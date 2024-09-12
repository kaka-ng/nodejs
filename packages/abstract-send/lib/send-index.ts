import { IncomingMessage } from 'http'
import { join } from 'node:path'
import { SendResult } from '.'
import { NormalizedSendOptions } from './options'
import { sendError } from './send-error'
import { sendFileDirectly } from './send-file-directly'
import { sendStatError } from './send-stat-error'
import { tryStat } from './try-stat'

export async function sendIndex (request: IncomingMessage, path: string, options: NormalizedSendOptions): Promise<SendResult> {
  let err: Error | null = null
  for (let i = 0; i < options.index.length; i++) {
    const index = options.index[i]
    const p = join(path, index)
    const { error, stat } = await tryStat(p, options)
    if (error) {
      err = error
      continue
    }
    if (stat.isDirectory()) continue
    return sendFileDirectly(request, p, stat, options)
  }

  if (err) {
    return sendStatError(err)
  }

  return sendError(404)
}
