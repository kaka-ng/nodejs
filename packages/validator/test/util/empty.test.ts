import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isEmpty, isExist } from '../../lib/util/empty'

test('Empty', async function (t) {
  await t.test('isEmpty', async function (t) {
    await t.test('""', function (t) {
      assert.equal(isEmpty(''), true)
    })

    await t.test('{}', function (t) {
      assert.equal(isEmpty({}), true)
    })

    await t.test('[]', function (t) {
      assert.equal(isEmpty([]), true)
    })

    await t.test('undefined', function (t) {
      assert.equal(isEmpty(undefined), true)
    })

    await t.test('null', function (t) {
      assert.equal(isEmpty(null), true)
    })

    await t.test('"123"', function (t) {
      assert.equal(isEmpty('123'), false)
    })

    await t.test('{foo:"bar"}', function (t) {
      assert.equal(isEmpty({ foo: 'bar' }), false)
    })

    await t.test('[1,2,3]', function (t) {
      assert.equal(isEmpty([1, 2, 3]), false)
    })
  })

  await t.test('isExist', async function (t) {
    await t.test('""', function (t) {
      assert.equal(isExist(''), false)
    })

    await t.test('{}', function (t) {
      assert.equal(isExist({}), false)
    })

    await t.test('[]', function (t) {
      assert.equal(isExist([]), false)
    })

    await t.test('undefined', function (t) {
      assert.equal(isExist(undefined), false)
    })

    await t.test('null', function (t) {
      assert.equal(isExist(null), false)
    })

    await t.test('"123"', function (t) {
      assert.equal(isExist('123'), true)
    })

    await t.test('{foo:"bar"}', function (t) {
      assert.equal(isExist({ foo: 'bar' }), true)
    })

    await t.test('[1,2,3]', function (t) {
      assert.equal(isExist([1, 2, 3]), true)
    })
  })
})
