import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isArray, isEmpty, isIdentical } from '../../lib/class/array'

test('Array', async function (t) {
  await t.test('isArray', async function (t) {
    await t.test('new Array()', function (t) {
      // eslint-disable-next-line @typescript-eslint/no-array-constructor
      assert.equal(isArray(new Array()), true)
    })

    await t.test('[]', function (t) {
      assert.equal(isArray([]), true)
    })

    await t.test('{}', function (t) {
      assert.equal(isArray({}), false)
    })
  })

  await t.test('isEmpty', async function (t) {
    await t.test('[]', function (t) {
      assert.equal(isEmpty([]), true)
    })

    await t.test('[1,2,3]', function (t) {
      assert.equal(isEmpty([1, 2, 3]), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('[] | []', function (t) {
      assert.equal(isIdentical([], []), true)
    })

    await t.test('[1,2] | [1,2]', function (t) {
      assert.equal(isIdentical([1, 2], [1, 2]), true)
    })

    await t.test('[1,2] | [2,1]', function (t) {
      assert.equal(isIdentical([1, 2], [2, 1]), false)
    })

    await t.test('[1,2] | [1,2,3]', function (t) {
      assert.equal(isIdentical([1, 2], [1, 2, 3]), false)
    })
  })
})
