import { test } from '@kakang/unit'
import { isBigInt, isIdentical } from '../../lib/primitive/bigint'

test('BigInt', async function (t) {
  t.test('isBigInt', async function (t) {
    t.test('BigInt(0)', function (t) {
      t.equal(isBigInt(BigInt(0)), true)
    })

    t.test('Number(0)', function (t) {
      t.equal(isBigInt(Number(0)), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('BigInt(0) | BigInt(0)', function (t) {
      t.equal(isIdentical(BigInt(0), BigInt(0)), true)
    })

    t.test('Number(0) | BigInt(0)', function (t) {
      t.equal(isIdentical(Number(0), BigInt(0)), false)
    })
  })
})
