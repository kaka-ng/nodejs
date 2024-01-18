import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isIdentical, isUndefined } from '../../lib/primitive/undefined'

test('Undefined', async function (t) {
  await t.test('isUndefined', async function (t) {
    await t.test('undefined', function (t) {
      assert.equal(isUndefined(undefined), true)
    })

    await t.test('null', function (t) {
      assert.equal(isUndefined(null), false)
    })

    await t.test('0', function (t) {
      assert.equal(isUndefined(0), false)
    })

    await t.test('emptry string', function (t) {
      assert.equal(isUndefined(''), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('undefined | undefined', function (t) {
      assert.equal(isIdentical(undefined, undefined), true)
    })

    await t.test('null | undefined', function (t) {
      assert.equal(isIdentical(null, undefined), false)
    })

    await t.test('0 | undefined', function (t) {
      assert.equal(isIdentical(0, undefined), false)
    })

    await t.test('empty string | undefined', function (t) {
      assert.equal(isIdentical('', undefined), false)
    })
  })
})
