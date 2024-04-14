import { test } from '@kakang/unit'
import { isBoolean, isFalse, isIdentical, isTrue, maybeFalse, maybeTrue } from '../../lib/primitive/boolean'

test('Boolean', async function (t) {
  t.test('isBoolean', async function (t) {
    t.test('true', function (t) {
      t.equal(isBoolean(true), true)
    })

    t.test('false', function (t) {
      t.equal(isBoolean(false), true)
    })

    t.test('string', function (t) {
      t.equal(isBoolean(''), false)
    })

    t.test('1', function (t) {
      t.equal(isBoolean(1), false)
    })

    t.test('0', function (t) {
      t.equal(isBoolean(0), false)
    })

    t.test('undefined', function (t) {
      t.equal(isBoolean(undefined), false)
    })

    t.test('null', function (t) {
      t.equal(isBoolean(null), false)
    })
  })

  t.test('isTrue', async function (t) {
    t.test('true', function (t) {
      t.equal(isTrue(true), true)
    })

    t.test('false', function (t) {
      t.equal(isTrue(false), false)
    })

    t.test('expression (1 === 1)', function (t) {
      // eslint-disable-next-line no-self-compare
      t.equal(isTrue(1 === 1), true)
    })
  })

  t.test('maybeTrue', async function (t) {
    t.test('true', function (t) {
      t.equal(maybeTrue(true), true)
    })

    t.test('1', function (t) {
      t.equal(maybeTrue(1), true)
    })

    t.test('"true"', function (t) {
      t.equal(maybeTrue('true'), true)
    })

    t.test('"abc"', function (t) {
      t.equal(maybeTrue('abc'), false)
    })

    t.test('()=>{}', function (t) {
      t.equal(maybeTrue(() => {}), false)
    })
  })

  t.test('isFalse', async function (t) {
    t.test('true', function (t) {
      t.equal(isFalse(true), false)
    })

    t.test('false', function (t) {
      t.equal(isFalse(false), true)
    })

    t.test('expression (1 === 0)', function (t) {
      // @ts-expect-error we need to test for expression
      t.equal(isFalse(1 === 0), true)
    })
  })

  t.test('maybeFalse', async function (t) {
    t.test('false', function (t) {
      t.equal(maybeFalse(false), true)
    })

    t.test('0', function (t) {
      t.equal(maybeFalse(0), true)
    })

    t.test('"false"', function (t) {
      t.equal(maybeFalse('false'), true)
    })

    t.test('"abc"', function (t) {
      t.equal(maybeFalse('abc'), false)
    })

    t.test('()=>{}', function (t) {
      t.equal(maybeFalse(() => {}), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('true | true', function (t) {
      t.equal(isIdentical(true, true), true)
    })

    t.test('false | false', function (t) {
      t.equal(isIdentical(false, false), true)
    })

    t.test('true | false', function (t) {
      t.equal(isIdentical(true, false), false)
    })

    t.test('false | true', function (t) {
      t.equal(isIdentical(false, true), false)
    })

    t.test('1 | true', function (t) {
      t.equal(isIdentical(1, true), false)
    })

    t.test('0 | false', function (t) {
      t.equal(isIdentical(0, false), false)
    })
  })
})
