import { test } from '@kakang/unit'
import { isIdentical, isNull } from '../../lib/primitive/null'

test('Null', async function (t) {
  t.test('isNull', async function (t) {
    t.test('null', function (t) {
      t.equal(isNull(null), true)
    })

    t.test('undefined', function (t) {
      t.equal(isNull(undefined), false)
    })

    t.test('0', function (t) {
      t.equal(isNull(0), false)
    })

    t.test('empty string', function (t) {
      t.equal(isNull(''), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('null | null', function (t) {
      t.equal(isIdentical(null, null), true)
    })

    t.test('undefined | null', function (t) {
      t.equal(isIdentical(undefined, null), false)
    })

    t.test('0 | null', function (t) {
      t.equal(isIdentical(0, null), false)
    })

    t.test('empty string | null', function (t) {
      t.equal(isIdentical('', null), false)
    })
  })
})
