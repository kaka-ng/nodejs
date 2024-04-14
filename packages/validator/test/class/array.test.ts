import { test } from '@kakang/unit'
import { isArray, isEmpty, isIdentical } from '../../lib/class/array'

test('Array', async function (t) {
  t.test('isArray', async function (t) {
    t.test('new Array()', function (t) {
      // eslint-disable-next-line @typescript-eslint/no-array-constructor
      t.equal(isArray(new Array()), true)
    })

    t.test('[]', function (t) {
      t.equal(isArray([]), true)
    })

    t.test('{}', function (t) {
      t.equal(isArray({}), false)
    })
  })

  t.test('isEmpty', async function (t) {
    t.test('[]', function (t) {
      t.equal(isEmpty([]), true)
    })

    t.test('[1,2,3]', function (t) {
      t.equal(isEmpty([1, 2, 3]), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('[] | []', function (t) {
      t.equal(isIdentical([], []), true)
    })

    t.test('[1,2] | [1,2]', function (t) {
      t.equal(isIdentical([1, 2], [1, 2]), true)
    })

    t.test('[1,2] | [2,1]', function (t) {
      t.equal(isIdentical([1, 2], [2, 1]), false)
    })

    t.test('[1,2] | [1,2,3]', function (t) {
      t.equal(isIdentical([1, 2], [1, 2, 3]), false)
    })
  })
})
