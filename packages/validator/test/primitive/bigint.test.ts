import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isBigInt, isIdentical } from '../../lib/primitive/bigint'

test('BigInt', async function (t) {
  await t.test('isBigInt', async function (t) {
    await t.test('BigInt(0)', function (t) {
      assert.equal(isBigInt(BigInt(0)), true)
    })

    await t.test('Number(0)', function (t) {
      assert.equal(isBigInt(Number(0)), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('BigInt(0) | BigInt(0)', function (t) {
      assert.equal(isIdentical(BigInt(0), BigInt(0)), true)
    })

    await t.test('Number(0) | BigInt(0)', function (t) {
      assert.equal(isIdentical(Number(0), BigInt(0)), false)
    })
  })
})
