import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isEmail, isIdentical } from '../../lib/util/email'

test('Email', async function (t) {
  await t.test('isEmail', async function (t) {
    await t.test('abc@abc.com', function (t) {
      assert.equal(isEmail('abc@abc.com'), true)
    })

    await t.test('abc+abc@abc.com', function (t) {
      assert.equal(isEmail('abc+abc@abc.com'), true)
    })

    await t.test('123@123', function (t) {
      assert.equal(isEmail('123@123'), false)
    })

    await t.test('123', function (t) {
      assert.equal(isEmail('123'), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('abc@abc.com | abc@abc.com', function (t) {
      assert.equal(isIdentical('abc@abc.com', 'abc@abc.com'), true)
    })

    await t.test('abc@abc.com | abc+abc@abc.com', function (t) {
      assert.equal(isIdentical('abc@abc.com', 'abc+abc@abc.com'), false)
    })
  })
})
