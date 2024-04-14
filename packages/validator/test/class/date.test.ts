import { test } from '@kakang/unit'
import { isDate, isDateString, isIdentical, isISO8601Date } from '../../lib/class/date'

test('Date', async function (t) {
  t.test('isDate', async function (t) {
    t.test('new Date()', function (t) {
      t.equal(isDate(new Date()), true)
    })

    t.test('Date.now()', function (t) {
      t.equal(isDate(Date.now()), false)
    })
  })

  t.test('isISO8601Date', async function (t) {
    t.test('toISOString', function (t) {
      t.equal(isISO8601Date(new Date().toISOString()), true)
    })

    t.test('2012-01-01T17:52:27.8116975-12:00', function (t) {
      t.equal(isISO8601Date('2012-01-01T17:52:27.8116975-12:00'), true)
    })

    t.test('2012-01-01T17:52:27.811-1200', function (t) {
      t.equal(isISO8601Date('2012-01-01T17:52:27.811-1200'), true)
    })

    t.test('2012-01-01T17:52:27.8116975+08:00', function (t) {
      t.equal(isISO8601Date('2012-01-01T17:52:27.8116975+08:00'), true)
    })

    t.test('2012-01-01T17:52:27.811+0800', function (t) {
      t.equal(isISO8601Date('2012-01-01T17:52:27.811+0800'), true)
    })

    t.test('2012-02-01T18:21:06', function (t) {
      t.equal(isISO8601Date('2012-02-01T18:21:06'), true)
    })

    t.test('2012-03-01T00:00:00Z', function (t) {
      t.equal(isISO8601Date('2012-03-01T00:00:00Z'), true)
    })

    t.test('Date.now()', function (t) {
      t.equal(isISO8601Date(Date.now()), false)
    })

    t.test('new Date()', function (t) {
      t.equal(isISO8601Date(new Date()), false)
    })
  })

  t.test('isDateString', async function (t) {
    t.test('2048-02-29', function (t) {
      t.equal(isDateString('2048-02-29'), true)
    })

    t.test('9999-12-31', function (t) {
      t.equal(isDateString('9999-12-31'), true)
    })

    t.test('2048/02/29', function (t) {
      t.equal(isDateString('2048/02/29', '/'), true)
    })

    t.test('9999/12/31', function (t) {
      t.equal(isDateString('9999/12/31', '/'), true)
    })

    t.test('2049-02-29', function (t) {
      t.equal(isDateString('2049-02-29'), false)
    })

    t.test('9999-12-32', function (t) {
      t.equal(isDateString('9999-12-32'), false)
    })
  })

  t.test('isIdentical', async function (t) {
    t.test('new Date("2011-03-31") | new Date("2011-03-31")', function (t) {
      t.equal(isIdentical(new Date('2011-03-31'), new Date('2011-03-31')), true)
    })

    t.test('new Date("2011-03-31") | new Date("1970-01-01")', function (t) {
      t.equal(isIdentical(new Date('2011-03-31'), new Date('1970-01-01')), false)
    })
  })
})
