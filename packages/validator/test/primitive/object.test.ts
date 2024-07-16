import { test } from '@kakang/unit'
import { isEqual, isIdentical, isObject } from '../../lib/primitive/object'

test('Object', async function (t) {
  t.test('isObject', async function (t) {
    t.test('object', function (t) {
      // eslint-disable-next-line no-object-constructor
      t.equal(isObject(Object()), true)
    })

    t.test('{}', function (t) {
      t.equal(isObject({}), true)
    })

    t.test('array', function (t) {
      t.equal(isObject([]), true)
    })

    t.test('date', function (t) {
      t.equal(isObject(new Date()), true)
    })

    t.test('null', function (t) {
      t.equal(isObject(null), true)
    })

    t.test('new string', function (t) {
      // eslint-disable-next-line no-new-wrappers
      t.equal(isObject(new String()), true)
    })

    t.test('number', function (t) {
      t.equal(isObject(Number()), false)
    })

    t.test('string', function (t) {
      t.equal(isObject(String()), false)
    })

    t.test('undefined', function (t) {
      t.equal(isObject(undefined), false)
    })
  })

  // should be in same pointer
  t.test('isIdentical', async function (t) {
    t.test('ref | ref', function (t) {
      const a = {}
      t.equal(isIdentical(a, a), true)
    })

    t.test('{} | {}', function (t) {
      t.equal(isIdentical({}, {}), false)
    })
  })

  // should be in same structure
  t.test('isEqual', async function (t) {
    t.test('ref | ref', function (t) {
      const a = {}
      t.equal(isEqual(a, a), true)
    })

    t.test('null | null', function (t) {
      t.equal(isEqual(null, null), true)
    })

    t.test('null | undefined', function (t) {
      t.equal(isEqual(null, undefined), false)
    })

    t.test('{} | {}', function (t) {
      t.equal(isEqual({}, {}), true)
    })

    t.test('{a:1,b:2} | {a:1,b:2}', function (t) {
      t.equal(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
    })

    t.test('{a:1,b:2} | {b:2,a:1}', function (t) {
      t.equal(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true)
    })

    t.test('{a:1,b:2} | {a:1,b:3}', function (t) {
      t.equal(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
    })

    t.test('[] | []', function (t) {
      t.equal(isEqual([], []), true)
    })

    t.test('[1,2] | [1,2]', function (t) {
      t.equal(isEqual([1, 2], [1, 2]), true)
    })

    t.test('[1,2] | [2,1]', function (t) {
      t.equal(isEqual([1, 2], [2, 1]), false)
    })

    t.test('[1,2] | [1,2,3]', function (t) {
      t.equal(isEqual([1, 2], [1, 2, 3]), false)
    })

    t.test('new Date("2011-03-31") | new Date("2011-03-31")', function (t) {
      t.equal(isEqual(new Date('2011-03-31'), new Date('2011-03-31')), true)
    })

    t.test('new Date("2011-03-31") | new Date("1970-01-01")', function (t) {
      t.equal(isEqual(new Date('2011-03-31'), new Date('1970-01-01')), false)
    })

    t.test('new Date(1234) | 1234', function (t) {
      t.equal(isEqual(new Date(1234), 1234), false)
    })

    t.test('()=>{} | ()=>{}', function (t) {
      // function should be equal when they are in same reference
      t.equal(isEqual(() => {}, () => {}), false)
    })

    t.test('/abc/ | /abc/', function (t) {
      // regex should be equal when they are in same reference
      t.equal(isEqual(/abc/, /abc/), false)
    })
  })
})
