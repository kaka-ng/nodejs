import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as Hash from '../lib/hash'

test('hash', async function (t) {
  await t.test('hash(foo)', function (t) {
    assert.equal(Hash.hash('foo'),
      'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'
    )
  })

  await t.test('hash(foo, base64)', function (t) {
    assert.equal(Hash.hash('foo', 'base64'),
      '9/u6bgY2+JDlb7vzKD5STG+jIErimDgtYkdB0NxmODJuKCxBvl5CVNiCB3LFUYosWowMf37aGVlKfrU5RT4e1w=='
    )
  })
})

test('md5', async function (t) {
  await t.test('md5(foo)', function (t) {
    assert.equal(Hash.md5('foo'), 'acbd18db4cc2f85cedef654fccc4a4d8')
  })

  await t.test('md5(foo, base64)', function (t) {
    assert.equal(Hash.md5('foo', 'base64'), 'rL0Y20zC+Fzt72VPzMSk2A==')
  })
})

test('sha1', async function (t) {
  await t.test('sha1(foo)', function (t) {
    assert.equal(Hash.sha1('foo'), '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33')
  })

  await t.test('sha1(foo, base64)', function (t) {
    assert.equal(Hash.sha1('foo', 'base64'), 'C+7Hteo/D9vJXQ3UfzxbwnXaijM=')
  })
})

test('sha224', async function (t) {
  await t.test('sha224(foo)', function (t) {
    assert.equal(Hash.sha224('foo'), '0808f64e60d58979fcb676c96ec938270dea42445aeefcd3a4e6f8db')
  })

  await t.test('sha224(foo, base64)', function (t) {
    assert.equal(Hash.sha224('foo', 'base64'), 'CAj2TmDViXn8tnbJbsk4Jw3qQkRa7vzTpOb42w==')
  })
})

test('sha256', async function (t) {
  await t.test('sha256(foo)', function (t) {
    assert.equal(Hash.sha256('foo'), '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae')
  })

  await t.test('sha256(foo, base64)', function (t) {
    assert.equal(Hash.sha256('foo', 'base64'), 'LCa0a2j/xo/5m0U8HTBBNBNCLXBkg7+g+YpeiGJm564=')
  })
})

test('sha384', async function (t) {
  await t.test('sha384(foo)', function (t) {
    assert.equal(Hash.sha384('foo'), '98c11ffdfdd540676b1a137cb1a22b2a70350c9a44171d6b1180c6be5cbb2ee3f79d532c8a1dd9ef2e8e08e752a3babb')
  })

  await t.test('sha384(foo, base64)', function (t) {
    assert.equal(Hash.sha384('foo', 'base64'), 'mMEf/f3VQGdrGhN8saIrKnA1DJpEFx1rEYDGvly7LuP3nVMsih3Z7y6OCOdSo7q7')
  })
})

test('sha512', async function (t) {
  await t.test('sha512(foo)', function (t) {
    assert.equal(Hash.sha512('foo'),
      'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'
    )
  })

  await t.test('sha512(foo, base64)', function (t) {
    assert.equal(Hash.sha512('foo', 'base64'),
      '9/u6bgY2+JDlb7vzKD5STG+jIErimDgtYkdB0NxmODJuKCxBvl5CVNiCB3LFUYosWowMf37aGVlKfrU5RT4e1w=='
    )
  })
})

test('shake128', async function (t) {
  await t.test('shake128(foo)', function (t) {
    assert.equal(Hash.shake128('foo'),
      'f84e95cb5fbd2038863ab27d3cdeac29'
    )
  })

  await t.test('shake128(foo, base64)', function (t) {
    assert.equal(Hash.shake128('foo', 'base64'),
      '+E6Vy1+9IDiGOrJ9PN6sKQ=='
    )
  })
})

test('shake256', async function (t) {
  await t.test('shake256(foo)', function (t) {
    assert.equal(Hash.shake256('foo'),
      '1af97f7818a28edfdfce5ec66dbdc7e871813816d7d585fe1f12475ded5b6502'
    )
  })

  await t.test('shake256(foo, base64)', function (t) {
    assert.equal(Hash.shake256('foo', 'base64'),
      'Gvl/eBiijt/fzl7Gbb3H6HGBOBbX1YX+HxJHXe1bZQI='
    )
  })
})
