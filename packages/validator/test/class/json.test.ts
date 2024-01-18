import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isEmpty, isIdentical, isJSON } from '../../lib/class/json'

test('JSON', async function (t) {
  await t.test('isJSON', async function (t) {
    await t.test('{}', function (t) {
      assert.equal(isJSON({}), true)
    })

    await t.test('"{}"', function (t) {
      assert.equal(isJSON('{}'), true)
    })

    await t.test('[]', function (t) {
      assert.equal(isJSON([]), false)
    })

    await t.test('null', function (t) {
      assert.equal(isJSON(null), false)
    })

    await t.test('undefined', function (t) {
      assert.equal(isJSON(undefined), false)
    })
  })

  await t.test('isEmpty', async function (t) {
    await t.test('{}', function (t) {
      assert.equal(isEmpty({}), true)
    })

    await t.test('null', function (t) {
      assert.equal(isEmpty(null), true)
    })

    await t.test('{a:1,b:2}', function (t) {
      assert.equal(isEmpty({ a: 1, b: 2 }), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('{} | {}', function (t) {
      assert.equal(isIdentical({}, {}), true)
    })

    await t.test('{a:1,b:2} | {a:1,b:2}', function (t) {
      assert.equal(isIdentical({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
    })

    await t.test('{a:1,b:2} | {b:2,a:1}', function (t) {
      assert.equal(isIdentical({ a: 1, b: 2 }, { b: 2, a: 1 }), true)
    })

    await t.test('{a:1,b:2} | {a:1,b:3}', function (t) {
      assert.equal(isIdentical({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
    })
  })
})
