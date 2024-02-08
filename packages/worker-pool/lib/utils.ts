import { extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type WorkerOptions } from 'node:worker_threads'

export const TYPESCRIPT_WORKER = `
const workerData = require('worker_threads').workerData
// we need to escape in unit test environment
// prevent duplicate ts-node registration
if(!process[Symbol.for('ts-node.register.instance')])
  require('ts-node').register(workerData.__tsNodeOptions)
require(workerData.__filename)
`

export function isTSNode (): boolean {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return !!(process as any)[Symbol.for('ts-node.register.instance')]
}

const defaultExtension = isTSNode() ? '.ts' : '.js'

export function filenameFixture (filename: string | URL): string {
  if (filename instanceof URL) {
    filename = fileURLToPath(filename)
  }

  const extension = extname(filename)
  switch (extension) {
    case '': {
      // provide missing extension
      filename += defaultExtension
      break
    }
    case '.js':
    case '.mjs': {
      // replace .[m]js to .ts
      isTSNode() && (filename = filename.replace(extension, '.ts'))
      break
    }
  }

  return normalize(filename)
}

export function optionsFixture (options?: WorkerOptions): WorkerOptions {
  options ??= {}

  if (isTSNode()) {
    options.eval = true
    options.workerData ??= {}
    options.workerData.__filename = ''
    options.workerData.__tsNodeOptions ??= {}
  }

  return options
}

export function isThenable<T = unknown> (value: unknown): value is Promise<T> {
  return typeof value === 'object' && value !== null && typeof (value as any).then === 'function'
}

export function handleMaybePromise (exec: () => unknown, done: (err: Error | null, value?: unknown) => void): void {
  try {
    const result = exec()
    if (isThenable(result)) {
      result.then((value) => { done(null, value) }, done)
    } else {
      done(null)
    }
  } catch (err) {
    done(err as Error)
  }
}
