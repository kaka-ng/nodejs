import { IncomingMessage } from 'node:http'
import { Headers } from './types'

const slice = String.prototype.slice

function parseTokenList (str: string, cb: (match: string) => boolean | undefined): boolean | undefined {
  let end = 0
  let start = 0
  let result

  // gather tokens
  for (let i = 0, len = str.length; i < len; i++) {
    switch (str.charCodeAt(i)) {
      case 0x20: /*   */
        if (start === end) {
          start = end = i + 1
        }
        break
      case 0x2c: /* , */
        if (start !== end) {
          result = cb(slice.call(str, start, end))
          if (result !== undefined) {
            return result
          }
        }
        start = end = i + 1
        break
      default:
        end = i + 1
        break
    }
  }

  // final token
  if (start !== end) {
    return cb(slice.call(str, start, end))
  }
}

export function isConditionalGET (request: IncomingMessage) {
  return request.headers['if-match'] ||
    request.headers['if-unmodified-since'] ||
    request.headers['if-none-match'] ||
    request.headers['if-modified-since']
}

export function isPreconditionFailure (request: IncomingMessage, headers: Headers) {
  // if-match
  const ifMatch = request.headers['if-match']
  if (ifMatch) {
    const etag = headers.ETag

    if (ifMatch !== '*') {
      const isMatching = parseTokenList(ifMatch, function (match) {
        if (
          match === etag ||
          'W/' + match === etag
        ) {
          return true
        }
      }) || false

      if (isMatching !== true) {
        return true
      }
    }
  }

  // if-unmodified-since
  if ('if-unmodified-since' in request.headers) {
    const ifUnmodifiedSince = request.headers['if-unmodified-since']
    const unmodifiedSince = Date.parse(ifUnmodifiedSince as string)
    // eslint-disable-next-line no-self-compare
    if (unmodifiedSince === unmodifiedSince) { // fast path of isNaN(number)
      const lastModified = Date.parse(headers['Last-Modified'] as string)
      if (
        // eslint-disable-next-line no-self-compare
        lastModified !== lastModified ||// fast path of isNaN(number)
        lastModified > unmodifiedSince
      ) {
        return true
      }
    }
  }

  return false
}

export function isNotModifiedFailure (request: IncomingMessage, headers: Headers) {
  // Always return stale when Cache-Control: no-cache
  // to support end-to-end reload requests
  // https://tools.ietf.org/html/rfc2616#section-14.9.4
  if (
    'cache-control' in request.headers &&
    (request.headers as any)['cache-control'].indexOf('no-cache') !== -1
  ) {
    return false
  }

  // if-none-match
  if ('if-none-match' in request.headers) {
    const ifNoneMatch = request.headers['if-none-match'] as string

    if (ifNoneMatch === '*') {
      return true
    }

    const etag = headers.ETag

    if (typeof etag !== 'string') {
      return false
    }

    const etagL = etag.length
    const isMatching = parseTokenList(ifNoneMatch, function (match) {
      const mL = match.length

      if (
        (etagL === mL && match === etag) ||
        (etagL > mL && 'W/' + match === etag)
      ) {
        return true
      }
    })

    if (isMatching) {
      return true
    }

    /**
     * A recipient MUST ignore If-Modified-Since if the request contains an
     * If-None-Match header field; the condition in If-None-Match is considered
     * to be a more accurate replacement for the condition in If-Modified-Since,
     * and the two are only combined for the sake of interoperating with older
     * intermediaries that might not implement If-None-Match.
     *
     * @see RFC 9110 section 13.1.3
     */
    return false
  }

  // if-modified-since
  if ('if-modified-since' in request.headers) {
    const ifModifiedSince = request.headers['if-modified-since'] as string
    const lastModified = headers['Last-Modified'] as string

    if (!lastModified || (Date.parse(lastModified) <= Date.parse(ifModifiedSince))) {
      return true
    }
  }

  return false
}
