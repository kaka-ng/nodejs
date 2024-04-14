import { test } from '@kakang/unit'
import * as AES from '../lib/aes'

test('computeKeySize()', async function (t) {
  t.test('default', function (t) {
    t.equal(AES.computeKeySize(), 32)
  })

  t.test('aes-256-ccm', function (t) {
    t.equal(AES.computeKeySize('aes-256-ccm'), 32)
  })

  t.test('aes-256-gcm', function (t) {
    t.equal(AES.computeKeySize('aes-256-gcm'), 32)
  })

  t.test('chacha20-poly1305', function (t) {
    t.equal(AES.computeKeySize('chacha20-poly1305'), 32)
  })

  t.test('aes-192-ccm', function (t) {
    t.equal(AES.computeKeySize('aes-192-ccm'), 24)
  })

  t.test('aes-192-gcm', function (t) {
    t.equal(AES.computeKeySize('aes-192-gcm'), 24)
  })

  t.test('aes-128-ccm', function (t) {
    t.equal(AES.computeKeySize('aes-128-ccm'), 16)
  })

  t.test('aes-128-gcm', function (t) {
    t.equal(AES.computeKeySize('aes-128-gcm'), 16)
  })
})

test('computeIVSize()', async function (t) {
  t.test('default', function (t) {
    t.equal(AES.computeIVSize(), 16)
  })

  t.test('aes-256-ccm', function (t) {
    t.equal(AES.computeIVSize('aes-256-ccm'), 16)
  })

  t.test('aes-256-gcm', function (t) {
    t.equal(AES.computeIVSize('aes-256-gcm'), 16)
  })

  t.test('chacha20-poly1305', function (t) {
    t.equal(AES.computeIVSize('chacha20-poly1305'), 12)
  })

  t.test('aes-192-ccm', function (t) {
    t.equal(AES.computeIVSize('aes-192-ccm'), 16)
  })

  t.test('aes-192-gcm', function (t) {
    t.equal(AES.computeIVSize('aes-192-gcm'), 16)
  })

  t.test('aes-128-ccm', function (t) {
    t.equal(AES.computeIVSize('aes-128-ccm'), 16)
  })

  t.test('aes-128-gcm', function (t) {
    t.equal(AES.computeIVSize('aes-128-gcm'), 16)
  })
})

test('encrypt()', async function (t) {
  const SECRET = 'bar'
  const SALT = 'baz'

  t.test('encrypt(foo)', function (t) {
    const encrypted = AES.encrypt('foo')
    t.equal('value' in encrypted, true)
    t.equal('iv' in encrypted, true)
    t.equal('authTag' in encrypted, true)
    t.equal('secret' in encrypted, true)
    t.equal('salt' in encrypted, true)
  })

  t.test('encrypt(foo, aes-256-gcm, bar, baz)', function (t) {
    const encrypted = AES.encrypt('foo', 'aes-256-gcm', SECRET, SALT)
    t.equal('value' in encrypted, true)
    t.equal('iv' in encrypted, true)
    t.equal('authTag' in encrypted, true)
    t.equal('secret' in encrypted, true)
    t.equal('salt' in encrypted, true)
  })

  t.test('encrypt(foo, chacha20-poly1305, bar, baz)', function (t) {
    const encrypted = AES.encrypt('foo', 'chacha20-poly1305', SECRET, SALT)
    t.equal('value' in encrypted, true)
    t.equal('iv' in encrypted, true)
    t.equal('authTag' in encrypted, true)
    t.equal('secret' in encrypted, true)
    t.equal('salt' in encrypted, true)
  })
})

test('decrypt()', async function (t) {
  t.test('decrypt(foo)', function (t) {
    const encrypted = AES.encrypt('foo')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'aes-256-gcm',
      encrypted.secret,
      encrypted.salt
    )
    t.equal(decrypted, 'foo')
  })

  t.test('decrypt(foo, aes-128-gcm)', function (t) {
    const encrypted = AES.encrypt('foo', 'aes-128-gcm')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'aes-128-gcm',
      encrypted.secret,
      encrypted.salt
    )
    t.equal(decrypted, 'foo')
  })

  t.test('decrypt(foo, aes-192-gcm)', function (t) {
    const encrypted = AES.encrypt('foo', 'aes-192-gcm')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'aes-192-gcm',
      encrypted.secret,
      encrypted.salt
    )
    t.equal(decrypted, 'foo')
  })

  t.test('decrypt(foo, aes-256-gcm)', function (t) {
    const encrypted = AES.encrypt('foo', 'aes-256-gcm')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'aes-256-gcm',
      encrypted.secret,
      encrypted.salt
    )
    t.equal(decrypted, 'foo')
  })

  t.test('decrypt(foo, chacha20-poly1305)', function (t) {
    const encrypted = AES.encrypt('foo', 'chacha20-poly1305')
    const decrypted = AES.decrypt(
      encrypted.value,
      Buffer.from(encrypted.iv, 'hex'),
      Buffer.from(encrypted.authTag, 'hex'),
      'chacha20-poly1305',
      encrypted.secret,
      encrypted.salt
    )
    t.equal(decrypted, 'foo')
  })
})
