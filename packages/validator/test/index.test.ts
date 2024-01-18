import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Array, isArray, isBigInt, isBoolean, isDate, isEmail, isEmpty, isExist, isJSON, isNull, isNumber, isObject, isString, isSymbol, isUndefined } from '../lib'

test('index', async function (t) {
  await t.test('Array', async function (t) {
    await t.test('isArray', function (t) {
      assert.equal(Array.isArray([]), true)
    })
  })

  await t.test('isArray', function (t) {
    assert.equal(isArray([]), true)
  })

  await t.test('isDate', function (t) {
    assert.equal(isDate(new Date()), true)
  })

  await t.test('isJSON', function (t) {
    assert.equal(isJSON({}), true)
  })

  await t.test('isBigInt', function (t) {
    assert.equal(isBigInt(BigInt(0)), true)
  })

  await t.test('isBoolean', function (t) {
    assert.equal(isBoolean(true), true)
  })

  await t.test('isNull', function (t) {
    assert.equal(isNull(null), true)
  })

  await t.test('isNumber', function (t) {
    assert.equal(isNumber(0), true)
  })

  await t.test('isObject', function (t) {
    assert.equal(isObject({}), true)
  })

  await t.test('isString', function (t) {
    assert.equal(isString(''), true)
  })

  await t.test('isSymbol', function (t) {
    assert.equal(isSymbol(Symbol('')), true)
  })

  await t.test('isUndefined', function (t) {
    assert.equal(isUndefined(undefined), true)
  })

  await t.test('isExist', function (t) {
    assert.equal(isExist('abc'), true)
  })

  await t.test('isEmpty', function (t) {
    assert.equal(isEmpty(null), true)
  })

  await t.test('isEmail', function (t) {
    assert.equal(isEmail('abc@abc.com'), true)
  })
})
