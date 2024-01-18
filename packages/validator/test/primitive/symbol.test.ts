import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isIdentical, isSymbol } from '../../lib/primitive/symbol'

test('Symbol', async function (t) {
  await t.test('isSymbol', async function (t) {
    await t.test('symbol', function (t) {
      assert.equal(isSymbol(Symbol('symbol')), true)
    })

    await t.test('symbol.for()', function (t) {
      assert.equal(isSymbol(Symbol.for('symbol')), true)
    })

    await t.test('string', function (t) {
      assert.equal(isSymbol(String('symbol')), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('symbol | symbol', function (t) {
      assert.equal(isIdentical(Symbol('symbol'), Symbol('symbol')), false)
    })

    await t.test('symbol.for() | symbol.for()', function (t) {
      assert.equal(isIdentical(Symbol.for('symbol'), Symbol.for('symbol')), true)
    })

    await t.test('string | symbol', function (t) {
      assert.equal(isIdentical(String('symbol'), Symbol('symbol')), false)
    })
  })
})
