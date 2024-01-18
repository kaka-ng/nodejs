import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isDate, isDateString, isIdentical, isISO8601Date } from '../../lib/class/date'

test('Date', async function (t) {
  await t.test('isDate', async function (t) {
    await t.test('new Date()', function (t) {
      assert.equal(isDate(new Date()), true)
    })

    await t.test('Date.now()', function (t) {
      assert.equal(isDate(Date.now()), false)
    })
  })

  await t.test('isISO8601Date', async function (t) {
    await t.test('toISOString', function (t) {
      assert.equal(isISO8601Date(new Date().toISOString()), true)
    })

    await t.test('2012-01-01T17:52:27.8116975-12:00', function (t) {
      assert.equal(isISO8601Date('2012-01-01T17:52:27.8116975-12:00'), true)
    })

    await t.test('2012-01-01T17:52:27.811-1200', function (t) {
      assert.equal(isISO8601Date('2012-01-01T17:52:27.811-1200'), true)
    })

    await t.test('2012-01-01T17:52:27.8116975+08:00', function (t) {
      assert.equal(isISO8601Date('2012-01-01T17:52:27.8116975+08:00'), true)
    })

    await t.test('2012-01-01T17:52:27.811+0800', function (t) {
      assert.equal(isISO8601Date('2012-01-01T17:52:27.811+0800'), true)
    })

    await t.test('2012-02-01T18:21:06', function (t) {
      assert.equal(isISO8601Date('2012-02-01T18:21:06'), true)
    })

    await t.test('2012-03-01T00:00:00Z', function (t) {
      assert.equal(isISO8601Date('2012-03-01T00:00:00Z'), true)
    })

    await t.test('Date.now()', function (t) {
      assert.equal(isISO8601Date(Date.now()), false)
    })

    await t.test('new Date()', function (t) {
      assert.equal(isISO8601Date(new Date()), false)
    })
  })

  await t.test('isDateString', async function (t) {
    await t.test('2048-02-29', function (t) {
      assert.equal(isDateString('2048-02-29'), true)
    })

    await t.test('9999-12-31', function (t) {
      assert.equal(isDateString('9999-12-31'), true)
    })

    await t.test('2048/02/29', function (t) {
      assert.equal(isDateString('2048/02/29', '/'), true)
    })

    await t.test('9999/12/31', function (t) {
      assert.equal(isDateString('9999/12/31', '/'), true)
    })

    await t.test('2049-02-29', function (t) {
      assert.equal(isDateString('2049-02-29'), false)
    })

    await t.test('9999-12-32', function (t) {
      assert.equal(isDateString('9999-12-32'), false)
    })
  })

  await t.test('isIdentical', async function (t) {
    await t.test('new Date("2011-03-31") | new Date("2011-03-31")', function (t) {
      assert.equal(isIdentical(new Date('2011-03-31'), new Date('2011-03-31')), true)
    })

    await t.test('new Date("2011-03-31") | new Date("1970-01-01")', function (t) {
      assert.equal(isIdentical(new Date('2011-03-31'), new Date('1970-01-01')), false)
    })
  })
})
