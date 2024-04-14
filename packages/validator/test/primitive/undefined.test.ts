import { test } from '@kakang/unit'
import { isIdentical, isUndefined } from '../../lib/primitive/undefined'

test('Undefined', async function (t) {
  t.test('isUndefined', async function (t) {
    t.test('undefined', function (t) {
      t.equal(isUndefined(undefined), true)
    })

    t.test('null', function (t) {
      t.equal(isUndefined(null), false)
    })

    t.test('0', function (t) {
      t.equal(isUndefined(0), false)
    })

    t.test('emptry string', function (t) {
      t.equal(isUndefined(''), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('undefined | undefined', function (t) {
      t.equal(isIdentical(undefined, undefined), true)
    })

    t.test('null | undefined', function (t) {
      t.equal(isIdentical(null, undefined), false)
    })

    t.test('0 | undefined', function (t) {
      t.equal(isIdentical(0, undefined), false)
    })

    t.test('empty string | undefined', function (t) {
      t.equal(isIdentical('', undefined), false)
    })
  })
})
