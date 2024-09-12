import escapeHtml from 'escape-html'
import { Readable } from 'node:stream'
import { createHtmlDocument } from './html'
import { NormalizedSendOptions } from './options'
import { collapseLeadingSlashes, hasTrailingSlash } from './path-slash'
import { sendError } from './send-error'
import { Headers, SendResult } from './types'

export function sendRedirect (path: string, options: NormalizedSendOptions): SendResult {
  if (hasTrailingSlash(options.path)) {
    return sendError(403)
  }

  const loc = encodeURI(collapseLeadingSlashes(options.path + '/') as string)
  const doc = createHtmlDocument('Redirecting', 'Redirecting to <a href="' + escapeHtml(loc) + '">' +
    escapeHtml(loc) + '</a>')

  const headers: Headers = {}
  headers['Content-Type'] = 'text/html; charset=UTF-8'
  headers['Content-Length'] = doc[1]
  headers['Content-Security-Policy'] = "default-src 'none'"
  headers['X-Content-Type-Options'] = 'nosniff'
  headers.Location = loc

  return {
    statusCode: 301,
    headers,
    stream: Readable.from(doc[0]),
    // metadata
    type: 'directory',
    metadata: { requestPath: options.path, path }
  }
}
