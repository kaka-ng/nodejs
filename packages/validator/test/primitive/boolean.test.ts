import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isBoolean, isFalse, isIdentical, isTrue, maybeFalse, maybeTrue } from '../../lib/primitive/boolean'

test('Boolean', async function (t) {
  await t.test('isBoolean', async function (t) {
    await t.test('true', function (t) {
      assert.equal(isBoolean(true), true)
    })

    await t.test('false', function (t) {
      assert.equal(isBoolean(false), true)
    })

    await t.test('string', function (t) {
      assert.equal(isBoolean(''), false)
    })

    await t.test('1', function (t) {
      assert.equal(isBoolean(1), false)
    })

    await t.test('0', function (t) {
      assert.equal(isBoolean(0), false)
    })

    await t.test('undefined', function (t) {
      assert.equal(isBoolean(undefined), false)
    })

    await t.test('null', function (t) {
      assert.equal(isBoolean(null), false)
    })
  })

  await t.test('isTrue', async function (t) {
    await t.test('true', function (t) {
      assert.equal(isTrue(true), true)
    })

    await t.test('false', function (t) {
      assert.equal(isTrue(false), false)
    })

    await t.test('expression (1 === 1)', function (t) {
      // eslint-disable-next-line no-self-compare
      assert.equal(isTrue(1 === 1), true)
    })
  })

  await t.test('maybeTrue', async function (t) {
    await t.test('true', function (t) {
      assert.equal(maybeTrue(true), true)
    })

    await t.test('1', function (t) {
      assert.equal(maybeTrue(1), true)
    })

    await t.test('"true"', function (t) {
      assert.equal(maybeTrue('true'), true)
    })

    await t.test('"abc"', function (t) {
      assert.equal(maybeTrue('abc'), false)
    })

    await t.test('()=>{}', function (t) {
      assert.equal(maybeTrue(() => {}), false)
    })
  })

  await t.test('isFalse', async function (t) {
    await t.test('true', function (t) {
      assert.equal(isFalse(true), false)
    })

    await t.test('false', function (t) {
      assert.equal(isFalse(false), true)
    })

    await t.test('expression (1 === 0)', function (t) {
      // @ts-expect-error we need to test for expression
      assert.equal(isFalse(1 === 0), true)
    })
  })

  await t.test('maybeFalse', async function (t) {
    await t.test('false', function (t) {
      assert.equal(maybeFalse(false), true)
    })

    await t.test('0', function (t) {
      assert.equal(maybeFalse(0), true)
    })

    await t.test('"false"', function (t) {
      assert.equal(maybeFalse('false'), true)
    })

    await t.test('"abc"', function (t) {
      assert.equal(maybeFalse('abc'), false)
    })

    await t.test('()=>{}', function (t) {
      assert.equal(maybeFalse(() => {}), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('true | true', function (t) {
      assert.equal(isIdentical(true, true), true)
    })

    await t.test('false | false', function (t) {
      assert.equal(isIdentical(false, false), true)
    })

    await t.test('true | false', function (t) {
      assert.equal(isIdentical(true, false), false)
    })

    await t.test('false | true', function (t) {
      assert.equal(isIdentical(false, true), false)
    })

    await t.test('1 | true', function (t) {
      assert.equal(isIdentical(1, true), false)
    })

    await t.test('0 | false', function (t) {
      assert.equal(isIdentical(0, false), false)
    })
  })
})
