import { IncomingMessage } from 'http'
import { extname, sep } from 'node:path'
import { SendResult } from '.'
import { NormalizedSendOptions } from './options'
import { sendError } from './send-error'
import { sendFileDirectly } from './send-file-directly'
import { sendRedirect } from './send-redirect'
import { sendStatError } from './send-stat-error'
import { tryStat } from './try-stat'

export async function sendFile (request: IncomingMessage, path: string, options: NormalizedSendOptions): Promise<SendResult> {
  const { error, stat } = await tryStat(path, options)
  if (error && (error as any).code === 'ENOENT' && !extname(path) && path[path.length - 1] !== sep) {
    let err: Error | null = error
    // not found, check extensions
    for (let i = 0; i < options.extensions.length; i++) {
      const extension = options.extensions[i]
      const p = path + '.' + extension
      const { error, stat } = await tryStat(p, options)
      if (error) {
        err = error
        continue
      }
      if (stat.isDirectory()) {
        err = null
        continue
      }
      return sendFileDirectly(request, p, stat, options)
    }
    if (err) {
      return sendStatError(err)
    }
    return sendError(404)
  }
  if (error) return sendStatError(error)
  if (stat.isDirectory()) return sendRedirect(path, options)
  return sendFileDirectly(request, path, stat, options)
}
