import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isBetween, isIdentical, isNaN, isNumber } from '../../lib/primitive/number'

test('Number', async function (t) {
  await t.test('isNumber', async function (t) {
    await t.test('number', function (t) {
      assert.equal(isNumber(Number()), true)
    })

    await t.test('1', function (t) {
      assert.equal(isNumber(1), true)
    })

    await t.test('0', function (t) {
      assert.equal(isNumber(0), true)
    })

    await t.test('-1', function (t) {
      assert.equal(isNumber(-1), true)
    })

    await t.test('1.0001', function (t) {
      assert.equal(isNumber(1.0001), true)
    })

    await t.test('0.0001', function (t) {
      assert.equal(isNumber(0.0001), true)
    })

    await t.test('-1.0001', function (t) {
      assert.equal(isNumber(-1.0001), true)
    })

    await t.test('String(1)', function (t) {
      assert.equal(isNumber(String(1)), false)
    })
  })

  // isNaN is used to check the type but not the value
  // string number should return NaN as well
  await t.test('isNaN', async function (t) {
    await t.test('string', function (t) {
      assert.equal(isNaN(String(1)), true)
    })

    await t.test('null', function (t) {
      assert.equal(isNaN(null), true)
    })

    await t.test('undefined', function (t) {
      assert.equal(isNaN(undefined), true)
    })

    await t.test('number', function (t) {
      assert.equal(isNaN(Number()), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('number | number', function (t) {
      assert.equal(isIdentical(Number(), Number()), true)
    })

    await t.test('1 | 1', function (t) {
      assert.equal(isIdentical(1, 1), true)
    })

    await t.test('0 | 0', function (t) {
      assert.equal(isIdentical(0, 0), true)
    })

    await t.test('1 | true', function (t) {
      assert.equal(isIdentical(1, true), false)
    })

    await t.test('0 | false', function (t) {
      assert.equal(isIdentical(1, false), false)
    })

    await t.test('0 | null', function (t) {
      assert.equal(isIdentical(1, null), false)
    })

    await t.test('0 | undefined', function (t) {
      assert.equal(isIdentical(1, undefined), false)
    })
  })

  await t.test('inRange', async function (t) {
    await t.test('value', function (t) {
      assert.equal(isBetween('abc', 1, 2), false)
    })

    await t.test('min', function (t) {
      assert.equal(isBetween(1, 'abc', 2), false)
    })

    await t.test('max', function (t) {
      assert.equal(isBetween(1, 2, 'abc'), false)
    })

    await t.test('value below min', function (t) {
      assert.equal(isBetween(0, 1, 10), false)
    })

    await t.test('value larger max', function (t) {
      assert.equal(isBetween(11, 1, 10), false)
    })

    await t.test('value in range', function (t) {
      assert.equal(isBetween(5, 1, 10), true)
    })
  })
})
