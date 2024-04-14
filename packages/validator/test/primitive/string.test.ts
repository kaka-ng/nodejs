import { test } from '@kakang/unit'
import { isEmpty, isIdentical, isString } from '../../lib/primitive/string'

test('String', async function (t) {
  t.test('isString', async function (t) {
    t.test('string', function (t) {
      t.equal(isString(String('')), true)
    })

    t.test('null', function (t) {
      t.equal(isString(null), false)
    })

    t.test('undefined', function (t) {
      t.equal(isString(undefined), false)
    })

    t.test('number', function (t) {
      t.equal(isString(Number(0)), false)
    })
  })

  // space will be trim
  t.test('isEmpty', async function (t) {
    t.test('string', function (t) {
      t.equal(isEmpty(String('')), true)
    })

    t.test('string(  )', function (t) {
      t.equal(isEmpty(String('  ')), true)
    })

    t.test('string(no)', function (t) {
      t.equal(isEmpty(String('no')), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('string | string', function (t) {
      t.equal(isIdentical(String('identical'), String('identical')), true)
    })

    t.test('string(yes) | string(no)', function (t) {
      t.equal(isIdentical(String('yes'), String('no')), false)
    })
  })
})
