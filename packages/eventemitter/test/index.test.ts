import * as crypto from 'crypto'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EventEmitter } from '../lib'

async function tick (): Promise<void> {
  await new Promise(function (resolve) {
    process.nextTick(function () {
      resolve('')
    })
  })
}

test('EventEmitter', async function (t) {
  t.beforeEach(function () {
    // reset EventEmitter constant
    EventEmitter.defaultMaxListeners = 10
  })

  t.afterEach(function () {
    process.removeAllListeners('warning')
  })

  await t.test('constant', async function (t) {
    await t.test('defaultMaxListeners is 10', function (t) {
      assert.equal(EventEmitter.defaultMaxListeners, 10)
    })

    await t.test('defaultMaxListeners = 11', function (t) {
      EventEmitter.defaultMaxListeners = 11
      assert.equal(EventEmitter.defaultMaxListeners, 11)
    })

    await t.test('defaultMaxListeners = -1', function (t) {
      try {
        EventEmitter.defaultMaxListeners = -1
        assert.fail('should not reach here')
      } catch (err) {
        assert.ok(err)
      }
    })

    await t.test('defaultMaxListeners = null', function (t) {
      try {
        EventEmitter.defaultMaxListeners = 'null' as any
        assert.fail('should not reach here')
      } catch (err) {
        assert.ok(err)
      }
    })
  })

  await t.test('constructor', async function (t) {
    await t.test('maxListeners', function (t) {
      const ee = new EventEmitter()
      assert.equal(ee.getMaxListeners(), 10)
    })

    await t.test('maxListeners = 11', function (t) {
      EventEmitter.defaultMaxListeners = 11
      const ee = new EventEmitter()
      assert.equal(ee.getMaxListeners(), 11)
    })
  })

  await t.test('addListener', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')

    await t.test('chainable', function (t) {
      const ee = new EventEmitter()
      assert.equal(ee.addListener(eventName, tick) instanceof EventEmitter, true)
    })

    await t.test(`eventNames include ${eventName}`, function (t) {
      const ee = new EventEmitter()
      ee.addListener(eventName, tick)
      assert.equal(ee.eventNames().includes(eventName), true)
    })

    await t.test(`rawListeners include ${Object.prototype.toString.call(tick)}`, function (t) {
      const ee = new EventEmitter()
      ee.addListener(eventName, tick)
      assert.equal(ee.rawListeners(eventName).includes(tick), true)
    })

    await t.test('emit Warning', function (t) {
      const ee = new EventEmitter()
      ee.setMaxListeners(1)
      process.on('warning', function (warning) {
        assert.equal(warning.name, 'MaxListenersExceededWarning')
      })
      ee.addListener(eventName, tick)
      ee.addListener(eventName, tick)
    })
  })

  await t.test('emit', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')
    const ee = new EventEmitter()
    const order: string[] = []
    async function before (order: string[]): Promise<void> {
      await new Promise(function (resolve) {
        process.nextTick(function () {
          order.push('before')
          resolve('')
        })
      })
    };
    async function after (order: string[]): Promise<void> {
      await new Promise(function (resolve) {
        process.nextTick(function () {
          order.push('after')
          resolve('')
        })
      })
    };

    ee.addListener(eventName, before)
    ee.addListener(eventName, after)

    await t.test('stack length = 2', function (t) {
      assert.equal(ee.listenerCount(eventName), 2)
    })

    await t.test('emit order', async function (t) {
      await ee.emit(eventName, order)
      assert.equal(order.length, 2)
      assert.equal(order[0], 'before')
      assert.equal(order[1], 'after')
    })
  })

  await t.test('eventNames', async function (t) {
    const ee = new EventEmitter()
    const events = [
      crypto.randomBytes(4).toString('hex'),
      crypto.randomBytes(4).toString('hex')
    ]
    ee.addListener(events[0], tick)
    ee.addListener(events[1], tick)

    await t.test('stack length = 2', function (t) {
      assert.equal(ee.eventNames().length, 2)
    })

    await t.test(`eventNames = [${events[0]},${events[1]}]`, function (t) {
      const names = ee.eventNames()
      assert.equal(names[0], events[0])
      assert.equal(names[1], events[1])
    })
  })

  await t.test('getMaxListeners', async function (t) {
    const ee = new EventEmitter()
    await t.test('= 10', function (t) {
      assert.equal(ee.getMaxListeners(), 10)
    })
  })

  await t.test('listenerCount', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')
    const random = Math.floor(Math.random() * 10 + 1)
    const ee = new EventEmitter()

    await t.test('empty at default', function (t) {
      assert.equal(ee.listenerCount(eventName), 0)
    })

    await t.test(`event stack should increase to ${random}`, function (t) {
      let count = 1
      while (count <= random) {
        ee.on(eventName, tick)
        count++
      }
      assert.equal(ee.listenerCount(eventName), random)
    })
  })

  await t.test('listeners', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')
    const random = Math.floor(Math.random() * 10 + 1)
    const ee = new EventEmitter()

    await t.test('empty at default', function (t) {
      assert.equal(ee.listeners(eventName).length, 0)
    })

    await t.test(`event stack should increase to ${random}`, function (t) {
      let count = 1
      while (count <= random) {
        ee.on(eventName, tick)
        count++
      }
      assert.equal(ee.listeners(eventName).length, random)
      ee.listeners(eventName).forEach(function (l) {
        assert.equal(typeof l === 'function', true)
      })
    })
  })

  await t.test('off', async function (t) {
    const ee = new EventEmitter()
    const eventName = crypto.randomBytes(4).toString('hex')

    await t.test('remove one listener at a time', function (t) {
      ee.addListener(eventName, tick)
      ee.addListener(eventName, tick)
      ee.off(eventName, tick)

      assert.equal(ee.listenerCount(eventName), 1)
    })

    await t.test('remove more than stack', function (t) {
      ee.off(eventName, tick)
      ee.off(eventName, tick)

      assert.equal(ee.listenerCount(eventName), 0)
    })
  })

  await t.test('on', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')
    await t.test('chainable', function (t) {
      const ee = new EventEmitter()
      assert.equal(ee.on(eventName, tick) instanceof EventEmitter, true)
    })

    await t.test(`eventNames include ${eventName}`, function (t) {
      const ee = new EventEmitter()
      ee.on(eventName, tick)
      assert.equal(ee.eventNames().includes(eventName), true)
    })

    await t.test(`rawListeners include ${Object.prototype.toString.call(tick)}`, function (t) {
      const ee = new EventEmitter()
      ee.on(eventName, tick)
      assert.equal(ee.rawListeners(eventName).includes(tick), true)
    })

    await t.test('emit Warning', function (t) {
      const ee = new EventEmitter()
      ee.setMaxListeners(1)
      process.on('warning', function (warning) {
        assert.equal(warning.name, 'MaxListenersExceededWarning')
      })
      ee.on(eventName, tick)
      ee.on(eventName, tick)
    })
  })

  await t.test('once', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')
    await t.test('chainable', function (t) {
      const ee = new EventEmitter()
      assert.equal(ee.once(eventName, tick) instanceof EventEmitter, true)
    })

    await t.test(`eventNames include ${eventName}`, function (t) {
      const ee = new EventEmitter()
      ee.once(eventName, tick)
      assert.equal(ee.eventNames().includes(eventName), true)
    })

    await t.test(`rawListeners include ${Object.prototype.toString.call(tick)}`, function (t) {
      const ee = new EventEmitter()
      ee.once(eventName, tick)
      assert.equal(ee.rawListeners(eventName).findIndex((l: any) => l.listener === tick) !== -1, true)
    })

    await t.test('emit Warning', function (t) {
      const ee = new EventEmitter()
      ee.setMaxListeners(1)
      process.on('warning', function (warning) {
        assert.equal(warning.name, 'MaxListenersExceededWarning')
      })
      ee.once(eventName, tick)
      ee.once(eventName, tick)
    })
  })

  await t.test('prependListener', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')
    const ee = new EventEmitter()
    const order: string[] = []
    async function before (order: string[]): Promise<void> {
      await new Promise(function (resolve) {
        process.nextTick(function () {
          order.push('before')
          resolve('')
        })
      })
    };
    async function after (order: string[]): Promise<void> {
      await new Promise(function (resolve) {
        process.nextTick(function () {
          order.push('after')
          resolve('')
        })
      })
    };

    ee.addListener(eventName, after)
    ee.prependListener(eventName, before)

    await t.test('stack length = 2', function (t) {
      assert.equal(ee.listenerCount(eventName), 2)
    })

    await t.test('emit order', async function (t) {
      await ee.emit(eventName, order)
      await ee.emit(eventName, order)
      assert.equal(order.length, 4)
      assert.equal(order[0], 'before')
      assert.equal(order[1], 'after')
      assert.equal(order[2], 'before')
      assert.equal(order[3], 'after')
    })
  })

  await t.test('prependOnceListener', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')
    const ee = new EventEmitter()
    const order: string[] = []
    async function before (order: string[]): Promise<void> {
      await new Promise(function (resolve) {
        process.nextTick(function () {
          order.push('before')
          resolve('')
        })
      })
    };
    async function after (order: string[]): Promise<void> {
      await new Promise(function (resolve) {
        process.nextTick(function () {
          order.push('after')
          resolve('')
        })
      })
    };

    ee.addListener(eventName, after)
    ee.prependOnceListener(eventName, before)

    await t.test('stack length = 2', function (t) {
      assert.equal(ee.listenerCount(eventName), 2)
    })

    await t.test('emit order', async function (t) {
      await ee.emit(eventName, order)
      await ee.emit(eventName, order)
      assert.equal(order.length, 3)
      assert.equal(order[0], 'before')
      assert.equal(order[1], 'after')
      assert.equal(order[2], 'after')
    })
  })

  await t.test('removeAllListeners', async function (t) {
    const eventName = crypto.randomBytes(4).toString('hex')
    const ee = new EventEmitter()

    await t.test('by eventName', function (t) {
      ee.on(eventName, tick)
      ee.on(eventName, tick)
      ee.removeAllListeners(eventName)
      assert.equal(ee.listenerCount(eventName), 0)
    })

    await t.test('clearAll', function (t) {
      ee.on('foo', tick)
      ee.on('bar', tick)
      ee.removeAllListeners()
      assert.equal(ee.listenerCount('foo'), 0)
      assert.equal(ee.listenerCount('bar'), 0)
    })
  })

  await t.test('removeListener', async function (t) {
    const ee = new EventEmitter()
    const eventName = crypto.randomBytes(4).toString('hex')

    await t.test('remove one listener at a time', function (t) {
      ee.addListener(eventName, tick)
      ee.addListener(eventName, tick)
      ee.removeListener(eventName, tick)

      assert.equal(ee.listenerCount(eventName), 1)
    })

    await t.test('remove more than stack', function (t) {
      ee.removeListener(eventName, tick)
      ee.removeListener(eventName, tick)

      assert.equal(ee.listenerCount(eventName), 0)
    })
  })

  await t.test('setMaxListeners', async function (t) {
    const ee = new EventEmitter()
    await t.test('maxListeners is 10', function (t) {
      assert.equal(ee.getMaxListeners(), 10)
    })

    await t.test('maxListeners = 11', function (t) {
      ee.setMaxListeners(11)
      assert.equal(ee.getMaxListeners(), 11)
    })

    await t.test('maxListeners = -1', function (t) {
      try {
        ee.setMaxListeners(-1)
        assert.fail('should not reach here')
      } catch (err) {
        assert.ok(err)
      }
    })

    await t.test('maxListeners = null', function (t) {
      try {
        ee.setMaxListeners('null' as never as number)
        assert.fail('should not reach here')
      } catch (err) {
        assert.ok(err)
      }
    })
  })
})
