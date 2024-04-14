import { test } from '@kakang/unit'
import { isIdentical, isSymbol } from '../../lib/primitive/symbol'

test('Symbol', async function (t) {
  t.test('isSymbol', async function (t) {
    t.test('symbol', function (t) {
      t.equal(isSymbol(Symbol('symbol')), true)
    })

    t.test('symbol.for()', function (t) {
      t.equal(isSymbol(Symbol.for('symbol')), true)
    })

    t.test('string', function (t) {
      t.equal(isSymbol(String('symbol')), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('symbol | symbol', function (t) {
      t.equal(isIdentical(Symbol('symbol'), Symbol('symbol')), false)
    })

    t.test('symbol.for() | symbol.for()', function (t) {
      t.equal(isIdentical(Symbol.for('symbol'), Symbol.for('symbol')), true)
    })

    t.test('string | symbol', function (t) {
      t.equal(isIdentical(String('symbol'), Symbol('symbol')), false)
    })
  })
})
