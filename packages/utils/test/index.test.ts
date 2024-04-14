import { test } from '@kakang/unit'
import { clone, createDeferredPromise, removeEmptyProps, slugify } from '../lib'

test('removeEmptyProps', async function (t) {
  t.test('{}', function (t) {
    const o = removeEmptyProps({})
    t.deepEqual(o, {})
    t.equal(typeof o, 'object')
  })

  t.test('[]', function (t) {
    const o = removeEmptyProps([])
    t.deepEqual(o, [])
    t.equal(typeof o, 'object')
    t.equal(Array.isArray(o), true)
  })

  t.test('{ foo: bar }', function (t) {
    const o = removeEmptyProps({ foo: 'bar' })
    t.deepEqual(o, { foo: 'bar' })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: bar }', function (t) {
    const o = removeEmptyProps({ foo: ' bar ' })
    t.deepEqual(o, { foo: 'bar' })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: "" }', function (t) {
    const o = removeEmptyProps({ foo: '' })
    t.deepEqual(o, {})
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: "" }, true', function (t) {
    const o = removeEmptyProps({ foo: '' }, true)
    t.deepEqual(o, { foo: '' })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: 1 }', function (t) {
    const o = removeEmptyProps({ foo: 1 })
    t.deepEqual(o, { foo: 1 })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: true }', function (t) {
    const o = removeEmptyProps({ foo: true })
    t.deepEqual(o, { foo: true })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: undefined }', function (t) {
    const o = removeEmptyProps({ foo: undefined })
    t.deepEqual(o, { })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: Date }', function (t) {
    const obj = { foo: new Date() }
    const o = removeEmptyProps(obj)
    t.deepEqual(o, obj)
    t.equal(typeof o, 'object')
    t.equal(o.foo instanceof Date, true)
  })

  t.test('{ foo: null }', function (t) {
    const o = removeEmptyProps({ foo: null })
    t.deepEqual(o, { })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: {} }', function (t) {
    const o = removeEmptyProps({ foo: {} })
    t.deepEqual(o, { })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: { bar: Date } }', function (t) {
    const obj = { foo: { bar: new Date() } }
    const o = removeEmptyProps(obj)
    t.deepEqual(o, obj)
    t.equal(typeof o, 'object')
    t.equal(o.foo.bar instanceof Date, true)
  })

  t.test('{ foo: {} }, true', function (t) {
    const o = removeEmptyProps({ foo: {} }, true)
    t.deepEqual(o, { foo: {} })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: [] }', function (t) {
    const o = removeEmptyProps({ foo: [] })
    t.deepEqual(o, { })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: [] }, true', function (t) {
    const o = removeEmptyProps({ foo: [] }, true)
    t.deepEqual(o, { foo: [] })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: [""] }, true', function (t) {
    const o = removeEmptyProps({ foo: [''] }, true)
    t.deepEqual(o, { foo: [] })
    t.equal(typeof o, 'object')
  })

  t.test('{ foo: { bar: "" } }, true', function (t) {
    const o = removeEmptyProps({ foo: { bar: '' } }, true)
    t.deepEqual(o, { foo: { bar: '' } })
    t.equal(typeof o, 'object')
  })
})

test('slugify', async function (t) {
  t.test('HelloWorld', function (t) {
    const o = slugify('HelloWorld')
    t.equal(o, 'helloworld')
  })

  t.test('Hello World', function (t) {
    const o = slugify('Hello World')
    t.equal(o, 'hello-world')
  })

  t.test('Exceed Limit', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahahahahahahahahahahahahahahahahahahaahhaha')
    t.equal(o, 'i-am-a-super-long-string-that-will-exceed-the-limit-hahahahahahahahahaha')
  })

  t.test('Exceed Limit and End with Dash', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahaa a')
    t.equal(o, 'i-am-a-super-long-string-that-will-exceed-the-limit-hahahahahahahahahaa')
  })

  t.test('Include Unicode Character', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month')
    t.equal(o, '訂閱計劃-subscription-plan-1-month')
  })

  t.test('Exclude Unicode Character', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month', { unicode: false })
    t.equal(o, 'subscription-plan-1-month')
  })

  t.test('Limit to 1', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahaa a', { limit: 1 })
    t.equal(o, 'i')
  })

  t.test('should use pinyin', function (t) {
    const o = slugify('訂閱計劃', { pinyin: true })
    t.equal(o, 'ding-yue-ji-hua')
  })

  t.test('should use pinyin', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month', { pinyin: true })
    t.equal(o, 'ding-yue-ji-hua-subscription-plan-1-month')
  })

  t.test('should use pinyin but all englush', function (t) {
    const o = slugify('Subscription Plan 1 Month', { pinyin: true })
    t.equal(o, 'subscription-plan-1-month')
  })

  t.test('should use default generator', function (t) {
    const o = slugify('訂閱計劃', { unicode: false })
    t.equal(o.length <= 16, true)
  })

  t.test('should use custom generator', function (t) {
    const o = slugify('訂閱計劃', { unicode: false, generator () { return 'custom' } })
    t.equal(o, 'custom')
  })
})

test('clone', async function (t) {
  t.test('{ foo: null }', function (t) {
    const o = clone({ foo: null })
    t.deepEqual(o, { foo: null })
  })

  t.test('{ foo: string }', function (t) {
    const o = clone({ foo: 'bar' })
    t.deepEqual(o, { foo: 'bar' })
  })

  t.test('[string]', function (t) {
    const o = clone(['foo', 'bar'])
    t.deepEqual(o, ['foo', 'bar'])
  })

  t.test('string', function (t) {
    const o = clone('foo')
    t.equal(o, 'foo')
  })

  t.test('{ foo: Date }', function (t) {
    const ref = { foo: new Date() }
    const o = clone(ref)
    t.deepEqual(o, ref)
  })

  t.test('Map { foo: bar }', function (t) {
    const ref = new Map([['foo', 'bar']])
    const o = clone(ref)
    t.deepEqual(o, ref)
  })

  t.test('Set { foo }', function (t) {
    const ref = new Set(['foo'])
    const o = clone(ref)
    t.deepEqual(o, ref)
  })
})

test('createDeferredPromise', async function (t) {
  t.test('resolve', async function (t) {
    const promise = createDeferredPromise()
    promise.resolve('ok')
    const result = await promise.promise
    t.deepEqual(result, 'ok')
  })

  t.test('reject', async function (t) {
    const promise = createDeferredPromise()
    promise.reject('ok')
    try {
      await promise.promise
    } catch (err) {
      t.deepEqual(err, 'ok')
    }
  })

  t.test('chainable', async function (t) {
    const promise = createDeferredPromise()
    promise.resolve('ok')
    const result = await promise.promise.then((o) => {
      t.deepEqual(o, 'ok')
      return o
    })
    t.deepEqual(result, 'ok')
  })
})
