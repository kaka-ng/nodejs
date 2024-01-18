import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isIdentical, isNull } from '../../lib/primitive/null'

test('Null', async function (t) {
  await t.test('isNull', async function (t) {
    await t.test('null', function (t) {
      assert.equal(isNull(null), true)
    })

    await t.test('undefined', function (t) {
      assert.equal(isNull(undefined), false)
    })

    await t.test('0', function (t) {
      assert.equal(isNull(0), false)
    })

    await t.test('empty string', function (t) {
      assert.equal(isNull(''), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('null | null', function (t) {
      assert.equal(isIdentical(null, null), true)
    })

    await t.test('undefined | null', function (t) {
      assert.equal(isIdentical(undefined, null), false)
    })

    await t.test('0 | null', function (t) {
      assert.equal(isIdentical(0, null), false)
    })

    await t.test('empty string | null', function (t) {
      assert.equal(isIdentical('', null), false)
    })
  })
})
