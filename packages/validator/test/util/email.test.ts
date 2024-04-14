import { test } from '@kakang/unit'
import { isEmail, isIdentical } from '../../lib/util/email'

test('Email', async function (t) {
  t.test('isEmail', async function (t) {
    t.test('abc@abc.com', function (t) {
      t.equal(isEmail('abc@abc.com'), true)
    })

    t.test('abc+abc@abc.com', function (t) {
      t.equal(isEmail('abc+abc@abc.com'), true)
    })

    t.test('123@123', function (t) {
      t.equal(isEmail('123@123'), false)
    })

    t.test('123', function (t) {
      t.equal(isEmail('123'), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('abc@abc.com | abc@abc.com', function (t) {
      t.equal(isIdentical('abc@abc.com', 'abc@abc.com'), true)
    })

    t.test('abc@abc.com | abc+abc@abc.com', function (t) {
      t.equal(isIdentical('abc@abc.com', 'abc+abc@abc.com'), false)
    })
  })
})
