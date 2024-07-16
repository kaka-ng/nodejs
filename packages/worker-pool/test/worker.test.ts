import { test } from '@kakang/unit'
import { once } from 'node:events'
import { join } from 'node:path'
import { WorkerPool } from '../lib'

test('events', async function (t) {
  const worker = new WorkerPool(join(__dirname, 'pingpong.worker.ts'), {
    minWorker: 1,
    maxWorker: 1,
  })
  const events = {
    online: 0,
    idle: 0,
    busy: 0,
    terminate: 0,
    message: 0,
    exit: 0,
  }
  function inc (event: keyof typeof events): () => void {
    return function () {
      events[event]++
    }
  }
  worker.on('worker:online', inc('online'))
  worker.on('worker:idle', inc('idle'))
  worker.on('worker:busy', inc('busy'))
  worker.on('worker:terminate', inc('terminate'))
  worker.on('worker:message', inc('message'))
  worker.on('worker:exit', inc('exit'))

  await once(worker, 'worker:online')
  t.equal(worker.workerCount, 1)

  worker.postMessage('ping')

  await once(worker, 'worker:message')
  worker.terminate()

  await once(worker, 'terminated')

  t.deepEqual(events, {
    online: 1,
    idle: 2, // 1: startup, 2: handle job
    busy: 1,
    terminate: 0,
    message: 1,
    exit: 1,
  })
})
