import { test } from '@kakang/unit'
import * as Scrypt from '../lib/scrypt'

test('scrypt', async function (t) {
  t.test('hash(foo)', async function (t) {
    const hashed = await Scrypt.hash('foo')
    t.equal(Scrypt.REGEXP.test(hashed), true)
  })

  t.test('hash(foo, 10)', async function (t) {
    const hashed = await Scrypt.hash('foo', 10)
    t.equal(Scrypt.REGEXP.test(hashed), true)
  })

  t.test('hash(foo, 64, 2^15, 8, 2)', async function (t) {
    const hashed = await Scrypt.hash('foo', 64, 32768, 8, 2)
    t.equal(Scrypt.REGEXP.test(hashed), true)
  })

  t.test('compare(foo, foo)', async function (t) {
    const hashed = await Scrypt.hash('foo')
    const result = await Scrypt.compare('foo', hashed)
    t.equal(result, true)
  })

  t.test('compare(bar, foo)', async function (t) {
    const hashed = await Scrypt.hash('foo')
    const result = await Scrypt.compare('bar', hashed)
    t.equal(result, false)
  })

  t.test('compare(bar, invalid)', async function (t) {
    const ok: typeof t.ok = t.ok
    try {
      await Scrypt.compare('bar', '$scrypt$')
      ok(false, 'should not reach here')
    } catch (err) {
      ok(err)
    }
  })
})
