import { randomUUID } from 'node:crypto'
import EventEmitter from 'node:events'
import { cpus } from 'node:os'
import { Worker, type TransferListItem, type WorkerOptions } from 'node:worker_threads'
import { TYPESCRIPT_WORKER, filenameFixture, handleMaybePromise, isTSNode, optionsFixture } from './utils'

export interface WorkerMessage {
  messageId: string
  action: string
  value: unknown
  transferList?: TransferListItem[]
}

export interface WorkerPoolOptions extends WorkerOptions {
  minWorker?: number
  maxWorker?: number

  maxQueueSize?: number
}

export class WorkerPool extends EventEmitter {
  // public variables
  minWorker: number
  maxWorker: number
  maxQueueSize: number
  // private variables
  readonly #filename: string
  readonly #options: WorkerOptions
  readonly #queue: WorkerMessage[]
  readonly #workers: Map<number, Worker>
  readonly #idleWorkers: Set<number>
  #terminated: boolean

  get workerCount (): number {
    return this.#workers.size
  }

  get queueSize (): number {
    return this.#queue.length
  }

  // WorkerPool provide similar interface of
  // Worker to ease the usage
  constructor (filename: string | URL, options?: WorkerPoolOptions) {
    super()
    this.#filename = filenameFixture(filename)
    // use spread operator to extract worker options
    const { minWorker, maxWorker, maxQueueSize, ...workerOptions } = options ?? {}
    this.minWorker = minWorker ?? 1
    this.maxWorker = maxWorker ?? Math.max(1, cpus().length - 1)
    this.maxQueueSize = maxQueueSize ?? Infinity

    this.#options = optionsFixture(workerOptions)
    if (isTSNode()) {
      this.#options.workerData.__filename = this.#filename
      this.#filename = TYPESCRIPT_WORKER
    }

    // unbounded array
    this.#queue = []
    this.#workers = new Map()
    this.#idleWorkers = new Set()
    this.#terminated = false

    // spwan worker until minWorker
    this.#spwan()
  }

  postMessage (value: unknown, transferList?: TransferListItem[]): void {
    if (this.#terminated) return
    this.#pushBuffer('message', value, transferList)
    this.#distribute()
  }

  terminate (): void {
    if (this.#terminated) return
    this.#terminated = true
    for (const [, worker] of this.#workers) {
      worker.postMessage({ messageId: randomUUID(), action: 'close' })
    }
  }

  #pushBuffer (action: string, value: unknown, transferList?: TransferListItem[]): void {
    if (this.queueSize >= this.maxQueueSize) throw Error('exceed queue size')
    this.#queue.push({
      messageId: randomUUID(),
      action,
      value,
      transferList: transferList ?? []
    })
  }

  #spwan (): void {
    if (this.#terminated) return
    for (let i = this.workerCount; i < this.minWorker; i++) {
      this.#spwanOnce()
    }
  }

  #spwanOnce (): number | undefined {
    if (this.#terminated) return
    if (this.#workers.size >= this.maxWorker) return
    const worker = new Worker(this.#filename, this.#options)
    // thread id will be negative number after exit
    // so, we cache it first
    const threadId = worker.threadId
    this.#workers.set(threadId, worker)
    let terminationTimeout: NodeJS.Timeout | null = null

    worker.on('online', () => {
      this.emit('worker:online', worker)
    })
    worker.on('message', (value) => {
      if (typeof value === 'object') {
        switch (value.action) {
          case 'idle': {
            this.#idleWorkers.add(threadId)
            this.emit('worker:idle', worker)
            this.#distribute()
            break
          }
          case 'busy': {
            this.#idleWorkers.delete(threadId)
            this.emit('worker:busy', worker)
            break
          }
          case 'terminate': {
            this.#workers.delete(threadId)
            this.#idleWorkers.delete(threadId)
            // we provide 30 seconds to cleanup
            terminationTimeout = setTimeout(() => {
              handleMaybePromise(async () => {
                await worker.terminate()
              }, () => {
                terminationTimeout = null
                this.emit('worker:terminate', worker)
                this.#spwan()
              })
            }, 30e3)
            break
          }
          default: {
            // do not handle something we don't understand
            this.emit('worker:message', worker, value?.value ?? value)
            break
          }
        }
      } else {
        // do not handle something we don't understand
        this.emit('worker:message', worker, value)
      }
    })
    worker.on('exit', () => {
      // when the worker is properly exit
      this.#idleWorkers.delete(threadId)
      this.#workers.delete(threadId)
      terminationTimeout !== null && clearTimeout(terminationTimeout)
      this.emit('worker:exit', worker)
      this.#spwan()

      if (this.#terminated && this.workerCount === 0) {
        this.emit('terminated')
      }
    })

    return worker.threadId
  }

  #distribute (): void {
    if (this.#idleWorkers.size === 0) {
      // we increase worker until max
      this.#spwanOnce()
    }

    if (this.#queue.length === 0 && this.#idleWorkers.size === 0) {
      return
    }

    for (const threadId of this.#idleWorkers) {
      const worker = this.#workers.get(threadId)
      if (worker === undefined) continue
      // FIFO
      const message = this.#queue.shift()
      if (message === undefined) continue
      const { transferList, ...value } = message
      worker.postMessage(value, transferList)
      this.#idleWorkers.delete(threadId)
    }
  }
}
