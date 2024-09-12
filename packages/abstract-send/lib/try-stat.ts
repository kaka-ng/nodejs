import { NormalizedSendOptions } from './options'
import { StatsLike } from './types'

interface SuccessStatResult {
  error: null
  stat: StatsLike
}

interface ErrorStatResult {
  error: Error
  stat: undefined
}

export async function tryStat (path: string, options: NormalizedSendOptions): Promise<ErrorStatResult | SuccessStatResult> {
  try {
    const stat = await options.engine.stat(path)
    return { error: null, stat }
  } catch (error) {
    return { error: error as Error, stat: undefined }
  }
}
