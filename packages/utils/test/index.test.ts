import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clone, createDeferredPromise, removeEmptyProps, slugify } from '../lib'

test('removeEmptyProps', async function (t) {
  await t.test('{}', function (t) {
    const o = removeEmptyProps({})
    assert.deepEqual(o, {})
    assert.equal(typeof o, 'object')
  })

  await t.test('[]', function (t) {
    const o = removeEmptyProps([])
    assert.deepEqual(o, [])
    assert.equal(typeof o, 'object')
    assert.equal(Array.isArray(o), true)
  })

  await t.test('{ foo: bar }', function (t) {
    const o = removeEmptyProps({ foo: 'bar' })
    assert.deepEqual(o, { foo: 'bar' })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: bar }', function (t) {
    const o = removeEmptyProps({ foo: ' bar ' })
    assert.deepEqual(o, { foo: 'bar' })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: "" }', function (t) {
    const o = removeEmptyProps({ foo: '' })
    assert.deepEqual(o, {})
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: "" }, true', function (t) {
    const o = removeEmptyProps({ foo: '' }, true)
    assert.deepEqual(o, { foo: '' })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: 1 }', function (t) {
    const o = removeEmptyProps({ foo: 1 })
    assert.deepEqual(o, { foo: 1 })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: true }', function (t) {
    const o = removeEmptyProps({ foo: true })
    assert.deepEqual(o, { foo: true })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: undefined }', function (t) {
    const o = removeEmptyProps({ foo: undefined })
    assert.deepEqual(o, { })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: Date }', function (t) {
    const obj = { foo: new Date() }
    const o = removeEmptyProps(obj)
    assert.deepEqual(o, obj)
    assert.equal(typeof o, 'object')
    assert.equal(o.foo instanceof Date, true)
  })

  await t.test('{ foo: null }', function (t) {
    const o = removeEmptyProps({ foo: null })
    assert.deepEqual(o, { })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: {} }', function (t) {
    const o = removeEmptyProps({ foo: {} })
    assert.deepEqual(o, { })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: { bar: Date } }', function (t) {
    const obj = { foo: { bar: new Date() } }
    const o = removeEmptyProps(obj)
    assert.deepEqual(o, obj)
    assert.equal(typeof o, 'object')
    assert.equal(o.foo.bar instanceof Date, true)
  })

  await t.test('{ foo: {} }, true', function (t) {
    const o = removeEmptyProps({ foo: {} }, true)
    assert.deepEqual(o, { foo: {} })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: [] }', function (t) {
    const o = removeEmptyProps({ foo: [] })
    assert.deepEqual(o, { })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: [] }, true', function (t) {
    const o = removeEmptyProps({ foo: [] }, true)
    assert.deepEqual(o, { foo: [] })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: [""] }, true', function (t) {
    const o = removeEmptyProps({ foo: [''] }, true)
    assert.deepEqual(o, { foo: [] })
    assert.equal(typeof o, 'object')
  })

  await t.test('{ foo: { bar: "" } }, true', function (t) {
    const o = removeEmptyProps({ foo: { bar: '' } }, true)
    assert.deepEqual(o, { foo: { bar: '' } })
    assert.equal(typeof o, 'object')
  })
})

test('slugify', async function (t) {
  await t.test('HelloWorld', function (t) {
    const o = slugify('HelloWorld')
    assert.equal(o, 'helloworld')
  })

  await t.test('Hello World', function (t) {
    const o = slugify('Hello World')
    assert.equal(o, 'hello-world')
  })

  await t.test('Exceed Limit', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahahahahahahahahahahahahahahahahahahaahhaha')
    assert.equal(o, 'i-am-a-super-long-string-that-will-exceed-the-limit-hahahahahahahahahaha')
  })

  await t.test('Exceed Limit and End with Dash', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahaa a')
    assert.equal(o, 'i-am-a-super-long-string-that-will-exceed-the-limit-hahahahahahahahahaa')
  })

  await t.test('Include Unicode Character', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month')
    assert.equal(o, '訂閱計劃-subscription-plan-1-month')
  })

  await t.test('Exclude Unicode Character', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month', { unicode: false })
    assert.equal(o, 'subscription-plan-1-month')
  })

  await t.test('Limit to 1', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahaa a', { limit: 1 })
    assert.equal(o, 'i')
  })

  await t.test('should use pinyin', function (t) {
    const o = slugify('訂閱計劃', { pinyin: true })
    assert.equal(o, 'ding-yue-ji-hua')
  })

  await t.test('should use pinyin', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month', { pinyin: true })
    assert.equal(o, 'ding-yue-ji-hua-subscription-plan-1-month')
  })

  await t.test('should use pinyin but all englush', function (t) {
    const o = slugify('Subscription Plan 1 Month', { pinyin: true })
    assert.equal(o, 'subscription-plan-1-month')
  })

  await t.test('should use default generator', function (t) {
    const o = slugify('訂閱計劃', { unicode: false })
    assert.equal(o.length <= 16, true)
  })

  await t.test('should use custom generator', function (t) {
    const o = slugify('訂閱計劃', { unicode: false, generator () { return 'custom' } })
    assert.equal(o, 'custom')
  })
})

test('clone', async function (t) {
  await t.test('{ foo: null }', function (t) {
    const o = clone({ foo: null })
    assert.deepEqual(o, { foo: null })
  })

  await t.test('{ foo: string }', function (t) {
    const o = clone({ foo: 'bar' })
    assert.deepEqual(o, { foo: 'bar' })
  })

  await t.test('[string]', function (t) {
    const o = clone(['foo', 'bar'])
    assert.deepEqual(o, ['foo', 'bar'])
  })

  await t.test('string', function (t) {
    const o = clone('foo')
    assert.equal(o, 'foo')
  })

  await t.test('{ foo: Date }', function (t) {
    const ref = { foo: new Date() }
    const o = clone(ref)
    assert.deepEqual(o, ref)
  })

  await t.test('Map { foo: bar }', function (t) {
    const ref = new Map([['foo', 'bar']])
    const o = clone(ref)
    assert.deepEqual(o, ref)
  })

  await t.test('Set { foo }', function (t) {
    const ref = new Set(['foo'])
    const o = clone(ref)
    assert.deepEqual(o, ref)
  })
})

test('createDeferredPromise', async function (t) {
  await t.test('resolve', async function (t) {
    const promise = createDeferredPromise()
    promise.resolve('ok')
    const result = await promise.promise
    assert.deepEqual(result, 'ok')
  })

  await t.test('reject', async function (t) {
    const promise = createDeferredPromise()
    promise.reject('ok')
    try {
      await promise.promise
    } catch (err) {
      assert.deepEqual(err, 'ok')
    }
  })

  await t.test('chainable', async function (t) {
    const promise = createDeferredPromise()
    promise.resolve('ok')
    const result = await promise.promise.then((o) => {
      assert.deepEqual(o, 'ok')
      return o
    })
    assert.deepEqual(result, 'ok')
  })
})
