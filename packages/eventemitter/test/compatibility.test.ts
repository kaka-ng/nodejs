import EE, { on, once, setMaxListeners } from 'events'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EventEmitter } from '../lib'

test('node:events', async function (t) {
  await t.test('once', async function (t) {
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('once')
    })
    await once(ee as never as NodeJS.EventEmitter, 'once')
    assert.ok('checked')
  })

  await t.test('on', async function (t) {
    let count = 0
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('on', 'foo')
      ee.emit('on', 'foo')
    })
    for await (const event of on(ee as never as EE, 'on')) {
      assert.deepEqual(event, ['foo'])
      count++
      if (count === 2) break
    }
  })

  await t.test('iterator', async function (t) {
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('on', 'foo')
      ee.emit('on', 'foo')
    })
    const iterator = EventEmitter.on(ee, 'on')[Symbol.asyncIterator]()
    const e1 = await Promise.all([iterator.next(), iterator.next(), iterator.next()])
    for (const { value } of e1) {
      assert.deepEqual(value, ['foo'])
    }
    const e2 = await iterator.next()
    assert.deepEqual(e2.value, ['foo'])
  })

  await t.test('setMaxListeners', function (t) {
    const ee1 = new EventEmitter()
    const ee2 = new EE()

    setMaxListeners(1, ee1 as never as EE, ee2)
    assert.equal(ee1.getMaxListeners(), 1)
    assert.equal(ee2.getMaxListeners(), 1)
  })
})

test('EventEmitter', async function (t) {
  await t.test('once', async function (t) {
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('once')
    })
    await EventEmitter.once(ee, 'once')
    assert.ok('checked')
  })

  await t.test('on', async function (t) {
    let count = 0
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('on', 'foo')
      ee.emit('on', 'foo')
    })
    for await (const event of EventEmitter.on(ee, 'on')) {
      assert.deepEqual(event, ['foo'])
      count++
      if (count === 2) break
    }
  })

  await t.test('iterator', async function (t) {
    const ee = new EventEmitter()
    process.nextTick(() => {
      ee.emit('on', 'foo')
      ee.emit('on', 'foo')
    })
    const iterator = EventEmitter.on(ee, 'on')[Symbol.asyncIterator]()
    const e1 = await Promise.all([iterator.next(), iterator.next(), iterator.next()])
    for (const { value } of e1) {
      assert.deepEqual(value, ['foo'])
    }
    const e2 = await iterator.next()
    assert.deepEqual(e2.value, ['foo'])
  })

  await t.test('setMaxListeners', function (t) {
    const ee1 = new EventEmitter()
    const ee2 = new EE()

    EventEmitter.setMaxListeners(1, ee1, ee2)
    assert.equal(ee1.getMaxListeners(), 1)
    assert.equal(ee2.getMaxListeners(), 1)
  })
})
