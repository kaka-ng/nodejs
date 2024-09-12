import http, { IncomingMessage, ServerResponse } from 'node:http'
import { TestContext } from 'node:test'
import { send } from '../lib'
import { SendOptions } from '../lib/options'

export function createServer (options: SendOptions, fn?: (request: IncomingMessage, response : ServerResponse) => void) {
  return http.createServer(async function (request, response) {
    try {
      fn && fn(request, response)
      const { statusCode, headers, stream } = await send(request, request.url as string, options)
      response.writeHead(statusCode, headers)
      stream.pipe(response)
    } catch (err) {
      response.statusCode = 500
      response.end(String(err))
    }
  })
}

export function shouldNotHaveHeader (header: string, t: TestContext) {
  return function (response: any) {
    t.assert.ok(!(header.toLowerCase() in response.headers), 'should not have header ' + header)
  }
}

export function shouldNotHaveBody (t: TestContext) {
  return function (response: any) {
    t.assert.ok(response.text === '' || response.text === undefined)
  }
}

export function withResolvers () {
  const promise: { promise: Promise<unknown>, resolve: () => void, reject: () => void } = {} as any
  promise.promise = new Promise((resolve, reject) => {
    promise.resolve = resolve as any
    promise.reject = reject as any
  })
  return promise
}
