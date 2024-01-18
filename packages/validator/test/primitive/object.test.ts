import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isEqual, isIdentical, isObject } from '../../lib/primitive/object'

test('Object', async function (t) {
  await t.test('isObject', async function (t) {
    await t.test('object', function (t) {
      assert.equal(isObject(Object()), true)
    })

    await t.test('{}', function (t) {
      assert.equal(isObject({}), true)
    })

    await t.test('array', function (t) {
      assert.equal(isObject([]), true)
    })

    await t.test('date', function (t) {
      assert.equal(isObject(new Date()), true)
    })

    await t.test('null', function (t) {
      assert.equal(isObject(null), true)
    })

    await t.test('new string', function (t) {
      // eslint-disable-next-line no-new-wrappers
      assert.equal(isObject(new String()), true)
    })

    await t.test('number', function (t) {
      assert.equal(isObject(Number()), false)
    })

    await t.test('string', function (t) {
      assert.equal(isObject(String()), false)
    })

    await t.test('undefined', function (t) {
      assert.equal(isObject(undefined), false)
    })
  })

  // should be in same pointer
  await t.test('isIdentical', async function (t) {
    await t.test('ref | ref', function (t) {
      const a = {}
      assert.equal(isIdentical(a, a), true)
    })

    await t.test('{} | {}', function (t) {
      assert.equal(isIdentical({}, {}), false)
    })
  })

  // should be in same structure
  await t.test('isEqual', async function (t) {
    await t.test('ref | ref', function (t) {
      const a = {}
      assert.equal(isEqual(a, a), true)
    })

    await t.test('null | null', function (t) {
      assert.equal(isEqual(null, null), true)
    })

    await t.test('null | undefined', function (t) {
      assert.equal(isEqual(null, undefined), false)
    })

    await t.test('{} | {}', function (t) {
      assert.equal(isEqual({}, {}), true)
    })

    await t.test('{a:1,b:2} | {a:1,b:2}', function (t) {
      assert.equal(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
    })

    await t.test('{a:1,b:2} | {b:2,a:1}', function (t) {
      assert.equal(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true)
    })

    await t.test('{a:1,b:2} | {a:1,b:3}', function (t) {
      assert.equal(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
    })

    await t.test('[] | []', function (t) {
      assert.equal(isEqual([], []), true)
    })

    await t.test('[1,2] | [1,2]', function (t) {
      assert.equal(isEqual([1, 2], [1, 2]), true)
    })

    await t.test('[1,2] | [2,1]', function (t) {
      assert.equal(isEqual([1, 2], [2, 1]), false)
    })

    await t.test('[1,2] | [1,2,3]', function (t) {
      assert.equal(isEqual([1, 2], [1, 2, 3]), false)
    })

    await t.test('new Date("2011-03-31") | new Date("2011-03-31")', function (t) {
      assert.equal(isEqual(new Date('2011-03-31'), new Date('2011-03-31')), true)
    })

    await t.test('new Date("2011-03-31") | new Date("1970-01-01")', function (t) {
      assert.equal(isEqual(new Date('2011-03-31'), new Date('1970-01-01')), false)
    })

    await t.test('new Date(1234) | 1234', function (t) {
      assert.equal(isEqual(new Date(1234), 1234), false)
    })

    await t.test('()=>{} | ()=>{}', function (t) {
      // function should be equal when they are in same reference
      assert.equal(isEqual(() => {}, () => {}), false)
    })

    await t.test('/abc/ | /abc/', function (t) {
      // regex should be equal when they are in same reference
      assert.equal(isEqual(/abc/, /abc/), false)
    })
  })
})
