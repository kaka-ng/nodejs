import { IncomingMessage } from 'http'
import { containDotFile, normalizeOptions, normalizePath, SendOptions } from './options'
import { hasTrailingSlash } from './path-slash'
import { sendError } from './send-error'
import { sendFile } from './send-file'
import { sendIndex } from './send-index'
import { SendResult } from './types'

export async function send (request: IncomingMessage, requestPath: string, options?: SendOptions): Promise<SendResult> {
  const opts = normalizeOptions(options, requestPath)

  const parsed = normalizePath(opts)
  if ('statusCode' in parsed) {
    return sendError(parsed.statusCode)
  }
  const { path, parts } = parsed

  // dotfile handling
  if (
    opts.dotfiles !== 0 &&
    containDotFile(parts)
  ) {
    switch (opts.dotfiles) {
      case 0: {
        // allow - do nothing
        break
      }
      case 2: {
        // deny
        return sendError(403)
      }
      case 1:
      default: {
        // ignore
        return sendError(404)
      }
    }
  }

  // index file support
  if (opts.index.length && hasTrailingSlash(opts.path)) {
    return sendIndex(request, path, opts)
  }

  return sendFile(request, path, opts)
}

export { isUtf8MimeType, mime } from './mime'
export type { SendOptions } from './options'
export type { DirectorySendResult, ErrorSendResult, FileSendResult, SendResult } from './types'
