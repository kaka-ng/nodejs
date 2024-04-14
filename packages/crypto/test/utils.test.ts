import { test } from '@kakang/unit'
import { randomBytes, randomNum, randomUUID } from '../lib/utils'

test('randomBytes()', async function (t) {
  t.test('randomByes(16)', function (t) {
    const result = randomBytes(16)

    t.equal(result instanceof Buffer, true)
    t.equal(result.length, 16)
  })

  t.test('randomByes(16, "hex")', function (t) {
    const result = randomBytes(16, 'hex')

    t.equal(typeof result, 'string')
    t.equal(result.length, 32)
  })
})

test('randomNum()', async function (t) {
  t.test('randomNum()', function (t) {
    const result = randomNum()

    t.equal(typeof result, 'string')
    t.equal(result.length, 6)
  })

  t.test('randomNum(8)', function (t) {
    const result = randomNum(8)

    t.equal(typeof result, 'string')
    t.equal(result.length, 8)
  })
})

test('randomUUID', async function (t) {
  t.equal(/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/i.test(randomUUID()), true)
})
