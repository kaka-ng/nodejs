import assert from 'node:assert/strict'
import { test } from 'node:test'
import { randomBytes, randomNum, randomUUID } from '../lib/utils'

test('randomBytes()', async function (t) {
  await t.test('randomByes(16)', function (t) {
    const result = randomBytes(16)

    assert.equal(result instanceof Buffer, true)
    assert.equal(result.length, 16)
  })

  await t.test('randomByes(16, "hex")', function (t) {
    const result = randomBytes(16, 'hex')

    assert.equal(typeof result, 'string')
    assert.equal(result.length, 32)
  })
})

test('randomNum()', async function (t) {
  await t.test('randomNum()', function (t) {
    const result = randomNum()

    assert.equal(typeof result, 'string')
    assert.equal(result.length, 6)
  })

  await t.test('randomNum(8)', function (t) {
    const result = randomNum(8)

    assert.equal(typeof result, 'string')
    assert.equal(result.length, 8)
  })
})

test('randomUUID', async function (t) {
  assert.equal(/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/i.test(randomUUID()), true)
})
