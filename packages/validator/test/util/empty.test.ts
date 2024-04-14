import { test } from '@kakang/unit'
import { isEmpty, isExist } from '../../lib/util/empty'

test('Empty', async function (t) {
  t.test('isEmpty', async function (t) {
    t.test('""', function (t) {
      t.equal(isEmpty(''), true)
    })

    t.test('{}', function (t) {
      t.equal(isEmpty({}), true)
    })

    t.test('[]', function (t) {
      t.equal(isEmpty([]), true)
    })

    t.test('undefined', function (t) {
      t.equal(isEmpty(undefined), true)
    })

    t.test('null', function (t) {
      t.equal(isEmpty(null), true)
    })

    t.test('"123"', function (t) {
      t.equal(isEmpty('123'), false)
    })

    t.test('{foo:"bar"}', function (t) {
      t.equal(isEmpty({ foo: 'bar' }), false)
    })

    t.test('[1,2,3]', function (t) {
      t.equal(isEmpty([1, 2, 3]), false)
    })
  })

  t.test('isExist', async function (t) {
    t.test('""', function (t) {
      t.equal(isExist(''), false)
    })

    t.test('{}', function (t) {
      t.equal(isExist({}), false)
    })

    t.test('[]', function (t) {
      t.equal(isExist([]), false)
    })

    t.test('undefined', function (t) {
      t.equal(isExist(undefined), false)
    })

    t.test('null', function (t) {
      t.equal(isExist(null), false)
    })

    t.test('"123"', function (t) {
      t.equal(isExist('123'), true)
    })

    t.test('{foo:"bar"}', function (t) {
      t.equal(isExist({ foo: 'bar' }), true)
    })

    t.test('[1,2,3]', function (t) {
      t.equal(isExist([1, 2, 3]), true)
    })
  })
})
