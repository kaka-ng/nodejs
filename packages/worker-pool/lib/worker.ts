import { randomUUID } from 'node:crypto'
import { isMainThread, parentPort, type MessagePort, type TransferListItem } from 'node:worker_threads'
import { handleMaybePromise } from './utils'

export type WorkerHandle = (...args: unknown[]) => unknown
export type WorkerCleanup = () => unknown
export type WorkerPrepare = () => unknown

interface WorkerOptions {
  prepare: WorkerPrepare
  cleanup: WorkerCleanup
}

// Worker class that is designed to use inside the worker_threads only
export class Worker {
  channel: MessagePort
  readonly #handle: WorkerHandle
  readonly #cleanup: WorkerCleanup
  readonly #prepare: WorkerPrepare
  // state
  #idle: boolean
  terminated: boolean

  get idle (): boolean {
    return this.#idle
  }

  set idle (idle: boolean) {
    this.#idle = idle
    if (idle) {
      this.#send('idle')
    } else {
      this.#send('busy')
    }
  }

  constructor (handle: WorkerHandle, options?: WorkerOptions) {
    this.channel = parentPort as MessagePort
    this.#handle = handle
    this.#cleanup = options?.cleanup ?? (() => {})
    this.#prepare = options?.prepare ?? (() => {})

    // state
    this.#idle = false
    this.terminated = false

    // auto launch
    this.launch()
  }

  launch (): void {
    if (isMainThread) {
      // we expect to run inside worker threads only
      process.exit(1)
    }

    // when process is disconnect
    // which means the main thread accidentially exit
    process.on('disconnect', () => {
      this.terminate()
    })

    this.channel.on('message', (value) => {
      if (typeof value === 'object') {
        switch (value.action) {
          case 'close': {
            this.terminate()
            break
          }
          default: {
            this.handle(value?.value ?? value)
            break
          }
        }
      } else {
        // do not handle something we don't understand
        this.handle(value)
      }
    })
    this.channel.on('close', () => {
      this.terminate()
    })

    handleMaybePromise(() => {
      return this.#prepare()
    }, () => {
      this.idle = true
    })
  }

  handle (value: unknown): void {
    this.idle = false
    handleMaybePromise(() => {
      return this.#handle(value)
    }, (err) => {
      this.idle = true
      err !== null && this.channel.postMessage(err)
    })
  }

  postMessage (value: unknown, transferList?: TransferListItem[]): void {
    this.#send('message', value, transferList)
  }

  #send (action: string, value?: unknown, transferList?: TransferListItem[]): void {
    this.channel.postMessage({
      messageId: randomUUID(),
      action,
      value,
    }, transferList)
  }

  terminate (): void {
    // prevent duplicate call
    if (this.terminated) return
    this.terminated = true
    this.#send('terminate')

    handleMaybePromise(() => {
      return this.#cleanup()
    }, (err) => {
      process.exit(err !== null ? 1 : 0)
    })
  }

  run (): void {
    // run method emit idle when worker is not closed
    if (this.terminated) return
    this.idle = true
  }
}
