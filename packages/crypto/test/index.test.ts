import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as crypto from '../lib/index'
import { AES, Base64, md5, randomBytes, Scrypt, sha1, sha224, sha256, sha512 } from '../lib/index'

test('import', async function (t) {
  await t.test('import * as', function (t) {
    assert.equal('AES' in crypto, true)
    assert.equal('Base64' in crypto, true)
    assert.equal('Scrypt' in crypto, true)
    assert.equal('md5' in crypto, true)
    assert.equal('sha1' in crypto, true)
    assert.equal('sha224' in crypto, true)
    assert.equal('sha256' in crypto, true)
    assert.equal('sha512' in crypto, true)
    assert.equal('randomBytes' in crypto, true)
  })

  await t.test('import {} from', function (t) {
    assert.ok(AES)
    assert.ok(Base64)
    assert.ok(Scrypt)
    assert.ok(md5)
    assert.ok(sha1)
    assert.ok(sha224)
    assert.ok(sha256)
    assert.ok(sha512)
    assert.ok(randomBytes)
  })
})
