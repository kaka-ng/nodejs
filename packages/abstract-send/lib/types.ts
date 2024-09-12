import { Stats } from 'node:fs'
import { Readable } from 'node:stream'

export interface Headers {
  [key: string]: string | number
}

export interface StatsLike extends Partial<Stats> {
  // this is the only two fields we need
  // others is optional
  size: number
  mtime: Date
  isDirectory: () => boolean
}

export interface BaseSendResult {
  statusCode: number
  headers: Headers
  stream: Readable
}

export interface FileSendResult extends BaseSendResult {
  type: 'file'
  metadata: {
    path: string
    stat: StatsLike
  }
}

export interface DirectorySendResult extends BaseSendResult {
  type: 'directory'
  metadata: {
    path: string
    requestPath: string
  }
}

export interface ErrorSendResult extends BaseSendResult {
  type: 'error'
  metadata: {
    error: Error
  }
}

export type SendResult = FileSendResult | DirectorySendResult | ErrorSendResult
