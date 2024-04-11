import assert from 'assert'
import { test } from '../lib/index'

test('sub path doesn\' requies await', (t) => {
  t.plan(2)

  t.test('sub test 1', (t) => {
    assert.ok('pass')
  })

  t.test('sub test 2', (t) => {
    assert.ok('pass')
  })
})

test('sub path with await', async (t) => {
  t.plan(2)

  await t.test('sub test 1', (t) => {
    assert.ok('pass')
  })

  await t.test('sub test 2', (t) => {
    assert.ok('pass')
  })
})

test('sub path with callback', async (t) => {
  t.plan(2)

  t.test('sub test 1', (t, done) => {
    assert.ok('pass')
    done()
  })

  t.test('sub test 2', (t, done) => {
    assert.ok('pass')
    done()
  })
})

test('use assert inside test', (t) => {
  t.plan(1)

  t.test('equal', (t) => {
    t.plan(1)

    t.equal(true, true)
  })
})
