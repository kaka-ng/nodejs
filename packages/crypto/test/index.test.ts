import { test } from '@kakang/unit'
import * as crypto from '../lib/index'
import { AES, Base64, md5, randomBytes, Scrypt, sha1, sha224, sha256, sha512 } from '../lib/index'

test('import', async function (t) {
  t.test('import * as', function (t) {
    t.equal('AES' in crypto, true)
    t.equal('Base64' in crypto, true)
    t.equal('Scrypt' in crypto, true)
    t.equal('md5' in crypto, true)
    t.equal('sha1' in crypto, true)
    t.equal('sha224' in crypto, true)
    t.equal('sha256' in crypto, true)
    t.equal('sha512' in crypto, true)
    t.equal('randomBytes' in crypto, true)
  })

  t.test('import {} from', function (t) {
    const ok: typeof t.ok = t.ok
    ok(AES)
    ok(Base64)
    ok(Scrypt)
    ok(md5)
    ok(sha1)
    ok(sha224)
    ok(sha256)
    ok(sha512)
    ok(randomBytes)
  })
})
