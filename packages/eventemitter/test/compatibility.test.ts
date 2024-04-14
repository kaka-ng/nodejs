import { test } from '@kakang/unit'
import EE, { on, once, setMaxListeners } from 'events'
import { EventEmitter } from '../lib'

test('node:events', async function (t) {
  t.test('once', async function (t) {
    const ok: typeof t.ok = t.ok
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('once')
    })
    await once(ee as never as NodeJS.EventEmitter, 'once')
    ok('checked')
  })

  t.test('on', async function (t) {
    let count = 0
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('on', 'foo')
      ee.emit('on', 'foo')
    })
    for await (const event of on(ee as never as EE, 'on')) {
      t.deepEqual(event, ['foo'])
      count++
      if (count === 2) break
    }
  })

  t.test('iterator', async function (t) {
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('on', 'foo')
      ee.emit('on', 'foo')
    })
    const iterator = EventEmitter.on(ee, 'on')[Symbol.asyncIterator]()
    const e1 = await Promise.all([iterator.next(), iterator.next(), iterator.next()])
    for (const { value } of e1) {
      t.deepEqual(value, ['foo'])
    }
    const e2 = await iterator.next()
    t.deepEqual(e2.value, ['foo'])
  })

  t.test('setMaxListeners', function (t) {
    const ee1 = new EventEmitter()
    const ee2 = new EE()

    setMaxListeners(1, ee1 as never as EE, ee2)
    t.equal(ee1.getMaxListeners(), 1)
    t.equal(ee2.getMaxListeners(), 1)
  })
})

test('EventEmitter', async function (t) {
  t.test('once', async function (t) {
    const ok: typeof t.ok = t.ok
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('once')
    })
    await EventEmitter.once(ee, 'once')
    ok('checked')
  })

  t.test('on', async function (t) {
    let count = 0
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('on', 'foo')
      ee.emit('on', 'foo')
    })
    for await (const event of EventEmitter.on(ee, 'on')) {
      t.deepEqual(event, ['foo'])
      count++
      if (count === 2) break
    }
  })

  t.test('iterator', async function (t) {
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('on', 'foo')
      ee.emit('on', 'foo')
    })
    const iterator = EventEmitter.on(ee, 'on')[Symbol.asyncIterator]()
    const e1 = await Promise.all([iterator.next(), iterator.next(), iterator.next()])
    for (const { value } of e1) {
      t.deepEqual(value, ['foo'])
    }
    const e2 = await iterator.next()
    t.deepEqual(e2.value, ['foo'])
  })

  t.test('setMaxListeners', function (t) {
    const ee1 = new EventEmitter()
    const ee2 = new EE()

    EventEmitter.setMaxListeners(1, ee1, ee2)
    t.equal(ee1.getMaxListeners(), 1)
    t.equal(ee2.getMaxListeners(), 1)
  })
})
