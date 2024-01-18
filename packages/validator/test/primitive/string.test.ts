import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isEmpty, isIdentical, isString } from '../../lib/primitive/string'

test('String', async function (t) {
  await t.test('isString', async function (t) {
    await t.test('string', function (t) {
      assert.equal(isString(String('')), true)
    })

    await t.test('null', function (t) {
      assert.equal(isString(null), false)
    })

    await t.test('undefined', function (t) {
      assert.equal(isString(undefined), false)
    })

    await t.test('number', function (t) {
      assert.equal(isString(Number(0)), false)
    })
  })

  // space will be trim
  await t.test('isEmpty', async function (t) {
    await t.test('string', function (t) {
      assert.equal(isEmpty(String('')), true)
    })

    await t.test('string(  )', function (t) {
      assert.equal(isEmpty(String('  ')), true)
    })

    await t.test('string(no)', function (t) {
      assert.equal(isEmpty(String('no')), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('string | string', function (t) {
      assert.equal(isIdentical(String('identical'), String('identical')), true)
    })

    await t.test('string(yes) | string(no)', function (t) {
      assert.equal(isIdentical(String('yes'), String('no')), false)
    })
  })
})
