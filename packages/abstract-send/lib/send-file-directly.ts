import { IncomingMessage } from 'http'
import { Readable } from 'node:stream'
import { isConditionalGET, isNotModifiedFailure, isPreconditionFailure } from './header-if'
import { contentRange, isRangeFresh, parseBytesRange } from './header-ranges'
import { getType, isUtf8MimeType, proto } from './mime'
import { NormalizedSendOptions } from './options'
import { sendError } from './send-error'
import { sendNotModified } from './send-not-modified'
import { Headers, SendResult, StatsLike } from './types'

const BYTES_RANGE_REGEXP = /^ *bytes=/

export async function sendFileDirectly (request: IncomingMessage, path: string, stat: StatsLike, options: NormalizedSendOptions): Promise<SendResult> {
  let len = stat.size
  let offset = options.start ?? 0

  let statusCode = 200
  const headers: Headers = {}

  // set header fields
  if (options.acceptRanges) {
    headers['Accept-Ranges'] = 'bytes'
  }

  if (options.cacheControl) {
    let cacheControl = 'public, max-age=' + Math.floor(options.maxage / 1000)

    if (options.immutable) {
      cacheControl += ', immutable'
    }

    headers['Cache-Control'] = cacheControl
  }

  if (options.lastModified) {
    const modified = stat.mtime.toUTCString()
    headers['Last-Modified'] = modified
  }

  if (options.etag) {
    const etag = 'W/"' + stat.size.toString(16) + '-' + stat.mtime.getTime().toString(16) + '"'
    headers.ETag = etag
  }

  // set content-type
  let type = await getType(path) || proto.defaultType
  if (type && isUtf8MimeType(type)) {
    type += '; charset=UTF-8'
  }
  if (type) {
    headers['Content-Type'] = type
  }

  // conditional GET support
  if (isConditionalGET(request)) {
    if (isPreconditionFailure(request, headers)) {
      return sendError(412)
    }

    if (isNotModifiedFailure(request, headers)) {
      return sendNotModified(headers, path, stat)
    }
  }

  // adjust len to start/end options
  len = Math.max(0, len - offset)
  if (options.end !== undefined) {
    const bytes = options.end - offset + 1
    if (len > bytes) len = bytes
  }

  // Range support
  if (options.acceptRanges) {
    const rangeHeader = request.headers.range

    if (
      rangeHeader !== undefined &&
      BYTES_RANGE_REGEXP.test(rangeHeader)
    ) {
      // If-Range support
      if (isRangeFresh(request, headers)) {
        // parse
        const ranges = parseBytesRange(len, rangeHeader)

        // unsatisfiable
        if (ranges.length === 0) {
          // Content-Range
          headers['Content-Range'] = contentRange('bytes', len)

          // 416 Requested Range Not Satisfiable
          return sendError(416, {
            headers: { 'Content-Range': headers['Content-Range'] }
          })
          // valid (syntactically invalid/multiple ranges are treated as a regular response)
        } else if (ranges.length === 1) {
          // Content-Range
          statusCode = 206
          headers['Content-Range'] = contentRange('bytes', len, ranges[0])

          // adjust for requested range
          offset += ranges[0].start
          len = ranges[0].end - ranges[0].start + 1
        }
      } else {
        // unexpected
      }
    }
  }

  // content-length
  headers['Content-Length'] = len

  // HEAD support
  if (request.method === 'HEAD') {
    return {
      statusCode,
      headers,
      stream: Readable.from(''),
      // metadata
      type: 'file',
      metadata: { path, stat }
    }
  }

  const stream = await options.engine.createReadStream(path, {
    start: offset,
    end: Math.max(offset, offset + len - 1)
  })

  return {
    statusCode,
    headers,
    stream,
    // metadata
    type: 'file',
    metadata: { path, stat }
  }
}
