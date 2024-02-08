import { Worker } from '../lib'

const worker = new Worker(function () {
  worker.postMessage('pong')
})
