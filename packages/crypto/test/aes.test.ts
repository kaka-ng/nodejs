import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as AES from '../lib/aes'

test('computeKeySize()', async function (t) {
  await t.test('default', function (t) {
    assert.equal(AES.computeKeySize(), 32)
  })

  await t.test('aes-256-ccm', function (t) {
    assert.equal(AES.computeKeySize('aes-256-ccm'), 32)
  })

  await t.test('aes-256-gcm', function (t) {
    assert.equal(AES.computeKeySize('aes-256-gcm'), 32)
  })

  await t.test('chacha20-poly1305', function (t) {
    assert.equal(AES.computeKeySize('chacha20-poly1305'), 32)
  })

  await t.test('aes-192-ccm', function (t) {
    assert.equal(AES.computeKeySize('aes-192-ccm'), 24)
  })

  await t.test('aes-192-gcm', function (t) {
    assert.equal(AES.computeKeySize('aes-192-gcm'), 24)
  })

  await t.test('aes-128-ccm', function (t) {
    assert.equal(AES.computeKeySize('aes-128-ccm'), 16)
  })

  await t.test('aes-128-gcm', function (t) {
    assert.equal(AES.computeKeySize('aes-128-gcm'), 16)
  })
})

test('computeIVSize()', async function (t) {
  await t.test('default', function (t) {
    assert.equal(AES.computeIVSize(), 16)
  })

  await t.test('aes-256-ccm', function (t) {
    assert.equal(AES.computeIVSize('aes-256-ccm'), 16)
  })

  await t.test('aes-256-gcm', function (t) {
    assert.equal(AES.computeIVSize('aes-256-gcm'), 16)
  })

  await t.test('chacha20-poly1305', function (t) {
    assert.equal(AES.computeIVSize('chacha20-poly1305'), 12)
  })

  await t.test('aes-192-ccm', function (t) {
    assert.equal(AES.computeIVSize('aes-192-ccm'), 16)
  })

  await t.test('aes-192-gcm', function (t) {
    assert.equal(AES.computeIVSize('aes-192-gcm'), 16)
  })

  await t.test('aes-128-ccm', function (t) {
    assert.equal(AES.computeIVSize('aes-128-ccm'), 16)
  })

  await t.test('aes-128-gcm', function (t) {
    assert.equal(AES.computeIVSize('aes-128-gcm'), 16)
  })
})

test('encrypt()', async function (t) {
  const SECRET = 'bar'
  const SALT = 'baz'

  await t.test('encrypt(foo)', function (t) {
    const encrypted = AES.encrypt('foo')
    assert.equal('value' in encrypted, true)
    assert.equal('iv' in encrypted, true)
    assert.equal('authTag' in encrypted, true)
    assert.equal('secret' in encrypted, true)
    assert.equal('salt' in encrypted, true)
  })

  await t.test('encrypt(foo, aes-256-gcm, bar, baz)', function (t) {
    const encrypted = AES.encrypt('foo', 'aes-256-gcm', SECRET, SALT)
    assert.equal('value' in encrypted, true)
    assert.equal('iv' in encrypted, true)
    assert.equal('authTag' in encrypted, true)
    assert.equal('secret' in encrypted, true)
    assert.equal('salt' in encrypted, true)
  })

  await t.test('encrypt(foo, chacha20-poly1305, bar, baz)', function (t) {
    const encrypted = AES.encrypt('foo', 'chacha20-poly1305', SECRET, SALT)
    assert.equal('value' in encrypted, true)
    assert.equal('iv' in encrypted, true)
    assert.equal('authTag' in encrypted, true)
    assert.equal('secret' in encrypted, true)
    assert.equal('salt' in encrypted, true)
  })
})

test('decrypt()', async function (t) {
  await t.test('decrypt(foo)', function (t) {
    const encrypted = AES.encrypt('foo')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'aes-256-gcm',
      encrypted.secret,
      encrypted.salt
    )
    assert.equal(decrypted, 'foo')
  })

  await t.test('decrypt(foo, aes-128-gcm)', function (t) {
    const encrypted = AES.encrypt('foo', 'aes-128-gcm')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'aes-128-gcm',
      encrypted.secret,
      encrypted.salt
    )
    assert.equal(decrypted, 'foo')
  })

  await t.test('decrypt(foo, aes-192-gcm)', function (t) {
    const encrypted = AES.encrypt('foo', 'aes-192-gcm')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'aes-192-gcm',
      encrypted.secret,
      encrypted.salt
    )
    assert.equal(decrypted, 'foo')
  })

  await t.test('decrypt(foo, aes-256-gcm)', function (t) {
    const encrypted = AES.encrypt('foo', 'aes-256-gcm')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'aes-256-gcm',
      encrypted.secret,
      encrypted.salt
    )
    assert.equal(decrypted, 'foo')
  })

  await t.test('decrypt(foo, chacha20-poly1305)', function (t) {
    const encrypted = AES.encrypt('foo', 'chacha20-poly1305')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'chacha20-poly1305',
      encrypted.secret,
      encrypted.salt
    )
    assert.equal(decrypted, 'foo')
  })
})
