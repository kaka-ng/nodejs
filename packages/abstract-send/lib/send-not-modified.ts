import { Readable } from 'node:stream'
import { SendResult } from '.'
import { Headers, StatsLike } from './types'

export function sendNotModified (headers: Headers, path: string, stat: StatsLike): SendResult {
  delete headers['Content-Encoding']
  delete headers['Content-Language']
  delete headers['Content-Length']
  delete headers['Content-Range']
  delete headers['Content-Type']

  return {
    statusCode: 304,
    headers,
    stream: Readable.from(''),
    // metadata
    type: 'file',
    metadata: { path, stat }
  }
}
