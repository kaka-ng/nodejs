import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as Scrypt from '../lib/scrypt'

test('scrypt', async function (t) {
  await t.test('hash(foo)', async function (t) {
    const hashed = await Scrypt.hash('foo')
    assert.equal(Scrypt.REGEXP.test(hashed), true)
  })

  await t.test('hash(foo, 10)', async function (t) {
    const hashed = await Scrypt.hash('foo', 10)
    assert.equal(Scrypt.REGEXP.test(hashed), true)
  })

  await t.test('hash(foo, 64, 2^15, 8, 2)', async function (t) {
    const hashed = await Scrypt.hash('foo', 64, 32768, 8, 2)
    assert.equal(Scrypt.REGEXP.test(hashed), true)
  })

  await t.test('compare(foo, foo)', async function (t) {
    const hashed = await Scrypt.hash('foo')
    const result = await Scrypt.compare('foo', hashed)
    assert.equal(result, true)
  })

  await t.test('compare(bar, foo)', async function (t) {
    const hashed = await Scrypt.hash('foo')
    const result = await Scrypt.compare('bar', hashed)
    assert.equal(result, false)
  })

  await t.test('compare(bar, invalid)', async function (t) {
    try {
      await Scrypt.compare('bar', '$scrypt$')
      assert.ok(false, 'should not reach here')
    } catch (err) {
      assert.ok(err)
    }
  })
})
