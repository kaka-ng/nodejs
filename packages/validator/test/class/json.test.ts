import { test } from '@kakang/unit'
import { isEmpty, isIdentical, isJSON } from '../../lib/class/json'

test('JSON', async function (t) {
  t.test('isJSON', async function (t) {
    t.test('{}', function (t) {
      t.equal(isJSON({}), true)
    })

    t.test('"{}"', function (t) {
      t.equal(isJSON('{}'), true)
    })

    t.test('[]', function (t) {
      t.equal(isJSON([]), false)
    })

    t.test('null', function (t) {
      t.equal(isJSON(null), false)
    })

    t.test('undefined', function (t) {
      t.equal(isJSON(undefined), false)
    })
  })

  t.test('isEmpty', async function (t) {
    t.test('{}', function (t) {
      t.equal(isEmpty({}), true)
    })

    t.test('null', function (t) {
      t.equal(isEmpty(null), true)
    })

    t.test('{a:1,b:2}', function (t) {
      t.equal(isEmpty({ a: 1, b: 2 }), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('{} | {}', function (t) {
      t.equal(isIdentical({}, {}), true)
    })

    t.test('{a:1,b:2} | {a:1,b:2}', function (t) {
      t.equal(isIdentical({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
    })

    t.test('{a:1,b:2} | {b:2,a:1}', function (t) {
      t.equal(isIdentical({ a: 1, b: 2 }, { b: 2, a: 1 }), true)
    })

    t.test('{a:1,b:2} | {a:1,b:3}', function (t) {
      t.equal(isIdentical({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
    })
  })
})
