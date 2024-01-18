import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as Base64 from '../lib/base64'

const CUSTOMCHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/='
const decoded = {
  default: ['Zm9vYmFyYmF6', 'Zm9vYg=='],
  url: ['Zm9vYmFyYmF6', 'Zm9vYg'],
  custom: ['zM9VyMfYyMf6', 'zM9VyG==']
}
const encoded = {
  string: ['foobarbaz', 'foob'],
  buffer: [] as Buffer[],
  Uint8Array: [] as Uint8Array[]
}
encoded.buffer = [Buffer.from(encoded.string[0]), Buffer.from(encoded.string[1])]
encoded.Uint8Array = [new Uint8Array(encoded.buffer[0]), new Uint8Array(encoded.buffer[1])]

test('encode(*)', async function (t) {
  await t.test('foobarbaz', function (t) {
    assert.equal(Base64.encode(encoded.string[0]), decoded.default[0])
  })

  await t.test('foob', function (t) {
    assert.equal(Base64.encode(encoded.string[1]), decoded.default[1])
  })

  await t.test('Buffer(foobarbaz)', function (t) {
    assert.equal(Base64.encode(encoded.buffer[0]), decoded.default[0])
  })

  await t.test('Buffer(foob)', function (t) {
    assert.equal(Base64.encode(encoded.buffer[1]), decoded.default[1])
  })

  await t.test('Uint8Array(foobarbaz)', function (t) {
    assert.equal(Base64.encode(encoded.Uint8Array[0]), decoded.default[0])
  })

  await t.test('Uint8Array(foob)', function (t) {
    assert.equal(Base64.encode(encoded.Uint8Array[1]), decoded.default[1])
  })
})

test('encode(*, "url")', async function (t) {
  await t.test('foobarbaz', function (t) {
    assert.equal(Base64.encode(encoded.string[0], 'url'), decoded.url[0])
  })

  await t.test('foob', function (t) {
    assert.equal(Base64.encode(encoded.string[1], 'url'), decoded.url[1])
  })

  await t.test('Buffer(foobarbaz)', function (t) {
    assert.equal(Base64.encode(encoded.buffer[0], 'url'), decoded.url[0])
  })

  await t.test('Buffer(foob)', function (t) {
    assert.equal(Base64.encode(encoded.buffer[1], 'url'), decoded.url[1])
  })

  await t.test('Uint8Array(foobarbaz)', function (t) {
    assert.equal(Base64.encode(encoded.Uint8Array[0], 'url'), decoded.url[0])
  })

  await t.test('Uint8Array(foob)', function (t) {
    assert.equal(Base64.encode(encoded.Uint8Array[1], 'url'), decoded.url[1])
  })
})

test('encode(*, "custom", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=")', async function (t) {
  await t.test('foobarbaz', function (t) {
    assert.equal(Base64.encode(encoded.string[0], 'custom', CUSTOMCHARSET), decoded.custom[0])
  })

  await t.test('foob', function (t) {
    assert.equal(Base64.encode(encoded.string[1], 'custom', CUSTOMCHARSET), decoded.custom[1])
  })

  await t.test('Buffer(foobarbaz)', function (t) {
    assert.equal(Base64.encode(encoded.buffer[0], 'custom', CUSTOMCHARSET), decoded.custom[0])
  })

  await t.test('Buffer(foob)', function (t) {
    assert.equal(Base64.encode(encoded.buffer[1], 'custom', CUSTOMCHARSET), decoded.custom[1])
  })

  await t.test('Uint8Array(foobarbaz)', function (t) {
    assert.equal(Base64.encode(encoded.Uint8Array[0], 'custom', CUSTOMCHARSET), decoded.custom[0])
  })

  await t.test('Uint8Array(foob)', function (t) {
    assert.equal(Base64.encode(encoded.Uint8Array[1], 'custom', CUSTOMCHARSET), decoded.custom[1])
  })
})

test('encodeReplaceCharset(*)', async function (t) {
  await t.test('Zm9vYmFyYmF6', function (t) {
    assert.equal(Base64.encodeReplaceCharset(decoded.default[0]), decoded.default[0])
  })

  await t.test('Zm9vYg==', function (t) {
    assert.equal(Base64.encodeReplaceCharset(decoded.default[1]), decoded.default[1])
  })
})

test('encodeReplaceCharset(*, "url")', async function (t) {
  await t.test('Zm9vYmFyYmF6', function (t) {
    assert.equal(Base64.encodeReplaceCharset(decoded.default[0], 'url'), decoded.url[0])
  })

  await t.test('Zm9vYg==', function (t) {
    assert.equal(Base64.encodeReplaceCharset(decoded.default[1], 'url'), decoded.url[1])
  })
})

test('encodeReplaceCharset(*, "custom", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=")', async function (t) {
  await t.test('Zm9vYmFyYmF6', function (t) {
    assert.equal(Base64.encodeReplaceCharset(decoded.default[0], 'custom', CUSTOMCHARSET), decoded.custom[0])
  })

  await t.test('Zm9vYg==', function (t) {
    assert.equal(Base64.encodeReplaceCharset(decoded.default[1], 'custom', CUSTOMCHARSET), decoded.custom[1])
  })
})

test('decode(*)', async function (t) {
  await t.test('foobarbaz', function (t) {
    assert.equal(Base64.decode(decoded.default[0]), encoded.string[0])
  })

  await t.test('foob', function (t) {
    assert.equal(Base64.decode(decoded.default[1]), encoded.string[1])
  })
})

test('encode(*, "url")', async function (t) {
  await t.test('foobarbaz', function (t) {
    assert.equal(Base64.decode(decoded.url[0], 'url'), encoded.string[0])
  })

  await t.test('foob', function (t) {
    assert.equal(Base64.decode(decoded.url[1], 'url'), encoded.string[1])
  })
})

test('decode(*, "custom", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=")', async function (t) {
  await t.test('foobarbaz', function (t) {
    assert.equal(Base64.decode(decoded.custom[0], 'custom', CUSTOMCHARSET), encoded.string[0])
  })

  await t.test('foob', function (t) {
    assert.equal(Base64.decode(decoded.custom[1], 'custom', CUSTOMCHARSET), encoded.string[1])
  })
})

test('decodeReplaceCharset(*)', async function (t) {
  await t.test('Zm9vYmFyYmF6', function (t) {
    assert.equal(Base64.decodeReplaceCharset(decoded.default[0]), decoded.default[0])
  })

  await t.test('Zm9vYg==', function (t) {
    assert.equal(Base64.decodeReplaceCharset(decoded.default[1]), decoded.default[1])
  })
})

test('decodeReplaceCharset(*, "url")', async function (t) {
  await t.test('Zm9vYmFyYmF6', function (t) {
    assert.equal(Base64.decodeReplaceCharset(decoded.url[0], 'url'), decoded.default[0])
  })

  await t.test('Zm9vYg==', function (t) {
    assert.equal(Base64.decodeReplaceCharset(decoded.url[1], 'url'), decoded.default[1])
  })
})

test('decodeReplaceCharset(*, "custom", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=")', async function (t) {
  await t.test('Zm9vYmFyYmF6', function (t) {
    assert.equal(Base64.decodeReplaceCharset(decoded.custom[0], 'custom', CUSTOMCHARSET), decoded.default[0])
  })

  await t.test('Zm9vYg==', function (t) {
    assert.equal(Base64.decodeReplaceCharset(decoded.custom[1], 'custom', CUSTOMCHARSET), decoded.default[1])
  })
})
