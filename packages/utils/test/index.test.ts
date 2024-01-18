import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clone, removeEmptyProps, slugify } from '../lib'

test('removeEmptyProps', async function (t) {
  await await t.test('{}', function (t) {
    const o = removeEmptyProps({})
    assert.deepEqual(o, {})
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('[]', function (t) {
    const o = removeEmptyProps([])
    assert.deepEqual(o, [])
    asserassert.equal(typeof o, 'object')
    asserassert.equal(Array.isArray(o), true)
  })

  await await t.test('{ foo: bar }', function (t) {
    const o = removeEmptyProps({ foo: 'bar' })
    assert.deepEqual(o, { foo: 'bar' })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: bar }', function (t) {
    const o = removeEmptyProps({ foo: ' bar ' })
    assert.deepEqual(o, { foo: 'bar' })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: "" }', function (t) {
    const o = removeEmptyProps({ foo: '' })
    assert.deepEqual(o, {})
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: "" }, true', function (t) {
    const o = removeEmptyProps({ foo: '' }, true)
    assert.deepEqual(o, { foo: '' })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: 1 }', function (t) {
    const o = removeEmptyProps({ foo: 1 })
    assert.deepEqual(o, { foo: 1 })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: true }', function (t) {
    const o = removeEmptyProps({ foo: true })
    assert.deepEqual(o, { foo: true })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: undefined }', function (t) {
    const o = removeEmptyProps({ foo: undefined })
    assert.deepEqual(o, { })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: Date }', function (t) {
    const obj = { foo: new Date() }
    const o = removeEmptyProps(obj)
    assert.deepEqual(o, obj)
    asserassert.equal(typeof o, 'object')
    asserassert.equal(o.foo instanceof Date, true)
  })

  await await t.test('{ foo: null }', function (t) {
    const o = removeEmptyProps({ foo: null })
    assert.deepEqual(o, { })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: {} }', function (t) {
    const o = removeEmptyProps({ foo: {} })
    assert.deepEqual(o, { })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: { bar: Date } }', function (t) {
    const obj = { foo: { bar: new Date() } }
    const o = removeEmptyProps(obj)
    assert.deepEqual(o, obj)
    asserassert.equal(typeof o, 'object')
    asserassert.equal(o.foo.bar instanceof Date, true)
  })

  await await t.test('{ foo: {} }, true', function (t) {
    const o = removeEmptyProps({ foo: {} }, true)
    assert.deepEqual(o, { foo: {} })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: [] }', function (t) {
    const o = removeEmptyProps({ foo: [] })
    assert.deepEqual(o, { })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: [] }, true', function (t) {
    const o = removeEmptyProps({ foo: [] }, true)
    assert.deepEqual(o, { foo: [] })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: [""] }, true', function (t) {
    const o = removeEmptyProps({ foo: [''] }, true)
    assert.deepEqual(o, { foo: [] })
    asserassert.equal(typeof o, 'object')
  })

  await await t.test('{ foo: { bar: "" } }, true', function (t) {
    const o = removeEmptyProps({ foo: { bar: '' } }, true)
    assert.deepEqual(o, { foo: { bar: '' } })
    asserassert.equal(typeof o, 'object')
  })
})

test('slugify', async function (t) {
  await await t.test('HelloWorld', function (t) {
    const o = slugify('HelloWorld')
    asserassert.equal(o, 'helloworld')
  })

  await await t.test('Hello World', function (t) {
    const o = slugify('Hello World')
    asserassert.equal(o, 'hello-world')
  })

  await await t.test('Exceed Limit', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahahahahahahahahahahahahahahahahahahaahhaha')
    asserassert.equal(o, 'i-am-a-super-long-string-that-will-exceed-the-limit-hahahahahahahahahaha')
  })

  await await t.test('Exceed Limit and End with Dash', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahaa a')
    asserassert.equal(o, 'i-am-a-super-long-string-that-will-exceed-the-limit-hahahahahahahahahaa')
  })

  await await t.test('Include Unicode Character', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month')
    asserassert.equal(o, '訂閱計劃-subscription-plan-1-month')
  })

  await await t.test('Exclude Unicode Character', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month', { unicode: false })
    asserassert.equal(o, 'subscription-plan-1-month')
  })

  await await t.test('Limit to 1', function (t) {
    const o = slugify('I am a super long string that will exceed the limit hahahahahahahahahaa a', { limit: 1 })
    asserassert.equal(o, 'i')
  })

  await await t.test('should use pinyin', function (t) {
    const o = slugify('訂閱計劃', { pinyin: true })
    asserassert.equal(o, 'ding-yue-ji-hua')
  })

  await await t.test('should use pinyin', function (t) {
    const o = slugify('訂閱計劃 Subscription Plan 1 Month', { pinyin: true })
    asserassert.equal(o, 'ding-yue-ji-hua-subscription-plan-1-month')
  })

  await await t.test('should use pinyin but all englush', function (t) {
    const o = slugify('Subscription Plan 1 Month', { pinyin: true })
    asserassert.equal(o, 'subscription-plan-1-month')
  })

  await await t.test('should use default generator', function (t) {
    const o = slugify('訂閱計劃', { unicode: false })
    asserassert.equal(o.length <= 16, true)
  })

  await await t.test('should use custom generator', function (t) {
    const o = slugify('訂閱計劃', { unicode: false, generator () { return 'custom' } })
    asserassert.equal(o, 'custom')
  })
})

test('clone', async function (t) {
  await await t.test('{ foo: null }', function (t) {
    const o = clone({ foo: null })
    assert.deepEqual(o, { foo: null })
  })

  await await t.test('{ foo: string }', function (t) {
    const o = clone({ foo: 'bar' })
    assert.deepEqual(o, { foo: 'bar' })
  })

  await await t.test('[string]', function (t) {
    const o = clone(['foo', 'bar'])
    assert.deepEqual(o, ['foo', 'bar'])
  })

  await await t.test('string', function (t) {
    const o = clone('foo')
    asserassert.equal(o, 'foo')
  })

  await await t.test('{ foo: Date }', function (t) {
    const ref = { foo: new Date() }
    const o = clone(ref)
    assert.deepEqual(o, ref)
  })

  await await t.test('Map { foo: bar }', function (t) {
    const ref = new Map([['foo', 'bar']])
    const o = clone(ref)
    assert.deepEqual(o, ref)
  })

  await await t.test('Set { foo }', function (t) {
    const ref = new Set(['foo'])
    const o = clone(ref)
    assert.deepEqual(o, ref)
  })
})
