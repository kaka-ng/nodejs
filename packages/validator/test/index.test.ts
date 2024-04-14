import { test } from '@kakang/unit'
import { Array, isArray, isBigInt, isBoolean, isDate, isEmail, isEmpty, isExist, isJSON, isNull, isNumber, isObject, isString, isSymbol, isUndefined } from '../lib'

test('index', async function (t) {
  t.test('Array', async function (t) {
    t.test('isArray', function (t) {
      t.equal(Array.isArray([]), true)
    })
  })

  t.test('isArray', function (t) {
    t.equal(isArray([]), true)
  })

  t.test('isDate', function (t) {
    t.equal(isDate(new Date()), true)
  })

  t.test('isJSON', function (t) {
    t.equal(isJSON({}), true)
  })

  t.test('isBigInt', function (t) {
    t.equal(isBigInt(BigInt(0)), true)
  })

  t.test('isBoolean', function (t) {
    t.equal(isBoolean(true), true)
  })

  t.test('isNull', function (t) {
    t.equal(isNull(null), true)
  })

  t.test('isNumber', function (t) {
    t.equal(isNumber(0), true)
  })

  t.test('isObject', function (t) {
    t.equal(isObject({}), true)
  })

  t.test('isString', function (t) {
    t.equal(isString(''), true)
  })

  t.test('isSymbol', function (t) {
    t.equal(isSymbol(Symbol('')), true)
  })

  t.test('isUndefined', function (t) {
    t.equal(isUndefined(undefined), true)
  })

  t.test('isExist', function (t) {
    t.equal(isExist('abc'), true)
  })

  t.test('isEmpty', function (t) {
    t.equal(isEmpty(null), true)
  })

  t.test('isEmail', function (t) {
    t.equal(isEmail('abc@abc.com'), true)
  })
})
