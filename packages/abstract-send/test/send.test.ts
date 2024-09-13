'use strict'

import fs from 'node:fs'
import { readdir } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { test, TestContext } from 'node:test'
import request from 'supertest'
import { send } from '../lib'
import { createServer, shouldNotHaveBody, shouldNotHaveHeader, withResolvers } from './utils'

// test server

const dateRegExp = /^\w{3}, \d+ \w+ \d+ \d+:\d+:\d+ \w+$/
const fixtures = path.join(__dirname, 'fixtures')

test('send(file, options)', async function (t: TestContext) {
  await t.test('acceptRanges', async function (t: TestContext) {
    await t.test('should support disabling accept-ranges', async function (t: TestContext) {
      t.plan(2)

      const { promise, resolve } = withResolvers()
      request(createServer({ acceptRanges: false, root: fixtures }))
        .get('/nums.txt')
        .expect(shouldNotHaveHeader('Accept-Ranges', t))
        .expect(200, (err) => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await await t.test('should ignore requested range', async function (t: TestContext) {
      t.plan(3)

      const { promise, resolve } = withResolvers()
      request(createServer({ acceptRanges: false, root: fixtures }))
        .get('/nums.txt')
        .set('Range', 'bytes=0-2')
        .expect(shouldNotHaveHeader('Accept-Ranges', t))
        .expect(shouldNotHaveHeader('Content-Range', t))
        .expect(200, '123456789', (err) => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('cacheControl', async function (t: TestContext) {
    await t.test('should support disabling cache-control', async function (t: TestContext) {
      t.plan(2)

      const { promise, resolve } = withResolvers()
      request(createServer({ cacheControl: false, root: fixtures }))
        .get('/name.txt')
        .expect(shouldNotHaveHeader('Cache-Control', t))
        .expect(200, (err) => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should ignore maxAge option', async function (t: TestContext) {
      t.plan(2)

      const { promise, resolve } = withResolvers()
      request(createServer({ cacheControl: false, maxAge: 1000, root: fixtures }))
        .get('/name.txt')
        .expect(shouldNotHaveHeader('Cache-Control', t))
        .expect(200, (err) => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('etag', async function (t: TestContext) {
    await t.test('should support disabling etags', async function (t: TestContext) {
      t.plan(2)

      const { promise, resolve } = withResolvers()
      request(createServer({ etag: false, root: fixtures }))
        .get('/name.txt')
        .expect(shouldNotHaveHeader('ETag', t))
        .expect(200, (err) => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('extensions', async function (t: TestContext) {
    await t.test('should reject numbers', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      // @ts-expect-error - check invalid value
      request(createServer({ extensions: 42, root: fixtures }))
        .get('/pets/')
        .expect(500, /TypeError: extensions option/, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should reject true', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ extensions: true, root: fixtures }))
        .get('/pets/')
        .expect(500, /TypeError: extensions option/, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should be not be enabled by default', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/tobi')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should be configurable', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ extensions: 'txt', root: fixtures }))
        .get('/name')
        .expect(200, 'tobi', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should support disabling extensions', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ extensions: false, root: fixtures }))
        .get('/name')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should support fallbacks', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ extensions: ['htm', 'html', 'txt'], root: fixtures }))
        .get('/name')
        .expect(200, '<p>tobi</p>', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should 404 if nothing found', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ extensions: ['htm', 'html', 'txt'], root: fixtures }))
        .get('/bob')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should skip directories', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ extensions: ['file', 'dir'], root: fixtures }))
        .get('/name')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should not search if file has extension', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ extensions: 'html', root: fixtures }))
        .get('/thing.html')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('lastModified', async function (t: TestContext) {
    await t.test('should support disabling last-modified', async function (t: TestContext) {
      t.plan(2)

      const { promise, resolve } = withResolvers()
      request(createServer({ lastModified: false, root: fixtures }))
        .get('/name.txt')
        .expect(shouldNotHaveHeader('Last-Modified', t))
        .expect(200, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('dotfiles', async function (t: TestContext) {
    const { promise, resolve } = withResolvers()
    await t.test('should default to "ignore"', async function (t: TestContext) {
      t.plan(1)

      request(createServer({ root: fixtures }))
        .get('/.hidden.txt')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should reject bad value', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      // @ts-expect-error - check invalid value
      request(createServer({ dotfiles: 'bogus' }))
        .get('/name.txt')
        .expect(500, /dotfiles/, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('when "allow"', async function (t: TestContext) {
      await t.test('should send dotfile', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'allow', root: fixtures }))
          .get('/.hidden.txt')
          .expect(200, 'secret', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should send within dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'allow', root: fixtures }))
          .get('/.mine/name.txt')
          .expect(200, /tobi/, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 404 for non-existent dotfile', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'allow', root: fixtures }))
          .get('/.nothere')
          .expect(404, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('when "deny"', async function (t: TestContext) {
      await t.test('should 403 for dotfile', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: fixtures }))
          .get('/.hidden.txt')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 403 for dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: fixtures }))
          .get('/.mine')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 403 for dotfile directory with trailing slash', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: fixtures }))
          .get('/.mine/')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 403 for file within dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: fixtures }))
          .get('/.mine/name.txt')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 403 for non-existent dotfile', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: fixtures }))
          .get('/.nothere')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 403 for non-existent dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: fixtures }))
          .get('/.what/name.txt')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 403 for dotfile in directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: fixtures }))
          .get('/pets/.hidden')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 403 for dotfile in dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: fixtures }))
          .get('/.mine/.hidden')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should send files in root dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'deny', root: path.join(fixtures, '.mine') }))
          .get('/name.txt')
          .expect(200, /tobi/, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 403 for dotfile without root', async function (t: TestContext) {
        t.plan(1)

        const server = http.createServer(async function onRequest (req, res) {
          const { statusCode, headers, stream } = await send(req, fixtures + '/.mine' + req.url as string, { dotfiles: 'deny' })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(server)
          .get('/name.txt')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('when "ignore"', async function (t: TestContext) {
      await t.test('should 404 for dotfile', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'ignore', root: fixtures }))
          .get('/.hidden.txt')
          .expect(404, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 404 for dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'ignore', root: fixtures }))
          .get('/.mine')
          .expect(404, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 404 for dotfile directory with trailing slash', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'ignore', root: fixtures }))
          .get('/.mine/')
          .expect(404, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 404 for file within dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'ignore', root: fixtures }))
          .get('/.mine/name.txt')
          .expect(404, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 404 for non-existent dotfile', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'ignore', root: fixtures }))
          .get('/.nothere')
          .expect(404, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 404 for non-existent dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'ignore', root: fixtures }))
          .get('/.what/name.txt')
          .expect(404, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should send files in root dotfile directory', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ dotfiles: 'ignore', root: path.join(fixtures, '.mine') }))
          .get('/name.txt')
          .expect(200, /tobi/, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should 404 for dotfile without root', async function (t: TestContext) {
        t.plan(1)

        const server = http.createServer(async function onRequest (req, res) {
          const { statusCode, headers, stream } = await send(req, fixtures + '/.mine' + req.url as string, { dotfiles: 'ignore' })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(server)
          .get('/name.txt')
          .expect(404, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })
  })

  await t.test('immutable', async function (t: TestContext) {
    await t.test('should default to false', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/name.txt')
        .expect('Cache-Control', 'public, max-age=0', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should set immutable directive in Cache-Control', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ immutable: true, maxAge: '1h', root: fixtures }))
        .get('/name.txt')
        .expect('Cache-Control', 'public, max-age=3600, immutable', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('maxAge', async function (t: TestContext) {
    await t.test('should default to 0', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/name.txt')
        .expect('Cache-Control', 'public, max-age=0', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should floor to integer', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ maxAge: 123956, root: fixtures }))
        .get('/name.txt')
        .expect('Cache-Control', 'public, max-age=123', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should accept string', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ maxAge: '30d', root: fixtures }))
        .get('/name.txt')
        .expect('Cache-Control', 'public, max-age=2592000', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should max at 1 year', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ maxAge: '2y', root: fixtures }))
        .get('/name.txt')
        .expect('Cache-Control', 'public, max-age=31536000', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('index', async function (t: TestContext) {
    await t.test('should reject numbers', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      // @ts-expect-error - check invalid value
      request(createServer({ root: fixtures, index: 42 }))
        .get('/pets/')
        .expect(500, /TypeError: index option/, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should reject true', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, index: true }))
        .get('/pets/')
        .expect(500, /TypeError: index option/, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should default to index.html', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/pets/')
        .expect(fs.readFileSync(path.join(fixtures, 'pets', 'index.html'), 'utf8'), err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should be configurable', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, index: 'tobi.html' }))
        .get('/')
        .expect(200, '<p>tobi</p>', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should support disabling', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, index: false }))
        .get('/pets/')
        .expect(403, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should support fallbacks', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, index: ['default.htm', 'index.html'] }))
        .get('/pets/')
        .expect(200, fs.readFileSync(path.join(fixtures, 'pets', 'index.html'), 'utf8'), err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should 404 if no index file found (file)', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, index: 'default.htm' }))
        .get('/pets/')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should 404 if no index file found (dir)', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, index: 'pets' }))
        .get('/')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should not follow directories', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, index: ['pets', 'name.txt'] }))
        .get('/')
        .expect(200, 'tobi', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should work without root', async function (t: TestContext) {
      t.plan(1)

      const server = http.createServer(async function (req, res) {
        const p = path.join(fixtures, 'pets').replace(/\\/g, '/') + '/'
        const { statusCode, headers, stream } = await send(req, p, { index: ['index.html'] })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(server)
        .get('/')
        .expect(200, /tobi/, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('root', async function (t: TestContext) {
    await t.test('when given', async function (t: TestContext) {
      await t.test('should join root', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ root: fixtures }))
          .get('/pets/../name.txt')
          .expect(200, 'tobi', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should work with trailing slash', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures + '/' })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, 'tobi', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should work with empty path', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, '', { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(301, /Redirecting to/, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      //
      // NOTE: This is not a real part of the API, but
      //       over time this has become something users
      //       are doing, so this will prevent unseen
      //       regressions around this use-case.
      //
      await t.test('should try as file with empty path', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, '', { root: path.join(fixtures, 'name.txt') })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/')
          .expect(200, 'tobi', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should restrict paths to within root', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ root: fixtures }))
          .get('/pets/../../send.js')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should allow .. in root', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures + '/../fixtures' })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/pets/../../send.js')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should not allow root transversal', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ root: path.join(fixtures, 'name.d') }))
          .get('/../name.dir/name.txt')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should not allow root path disclosure', async function (t: TestContext) {
        t.plan(1)

        const { promise, resolve } = withResolvers()
        request(createServer({ root: fixtures }))
          .get('/pets/../../fixtures/name.txt')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('when missing', async function (t: TestContext) {
      await t.test('should consider .. malicious', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, fixtures + req.url)
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/../send.js')
          .expect(403, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should still serve files with dots in name', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, fixtures + req.url)
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/do..ts.txt')
          .expect(200, '...', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })
  })

  await t.test('should stream the file contents', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/name.txt')
      .expect('Content-Length', '4')
      .expect(200, 'tobi', err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should stream a zero-length file', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/empty.txt')
      .expect('Content-Length', '0')
      .expect(200, '', err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should decode the given path as a URI', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/some%20thing.txt')
      .expect(200, 'hey', err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should serve files with dots in name', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/do..ts.txt')
      .expect(200, '...', err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should treat a malformed URI as a bad request', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/some%99thing.txt')
      .expect(400, /Bad Request/, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should 400 on NULL bytes', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/some%00thing.txt')
      .expect(400, /Bad Request/, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should treat an ENAMETOOLONG as a 404', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    const path = Array(100).join('foobar')
    request(app)
      .get('/' + path)
      .expect(404, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should support HEAD', async function (t: TestContext) {
    t.plan(2)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .head('/name.txt')
      .expect(200)
      .expect('Content-Length', '4')
      .expect(shouldNotHaveBody(t))
      .end(err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should add an ETag header field', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/name.txt')
      .expect('etag', /^W\/"[^"]+"$/)
      .end(err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should add a Date header field', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/name.txt')
      .expect('date', dateRegExp, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should add a Last-Modified header field', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/name.txt')
      .expect('last-modified', dateRegExp, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should add a Accept-Ranges header field', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/name.txt')
      .expect('Accept-Ranges', 'bytes', err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should 404 if the file does not exist', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/meow')
      .expect(404, /Not Found/, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should 404 if the filename is too long', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const longFilename = new Array(512).fill('a').join('')

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/' + longFilename)
      .expect(404, /Not Found/, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should 404 if the requested resource is not a directory', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/nums.txt/invalid')
      .expect(404, /Not Found/, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should not override content-type', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, {
        ...headers,
        'Content-Type': 'application/x-custom'
      })
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/name.txt')
      .expect('Content-Type', 'application/x-custom', err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('should set Content-Type via mime map', async function (t: TestContext) {
    t.plan(2)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/name.txt')
      .expect('Content-Type', 'text/plain; charset=UTF-8')
      .expect(200, function (err) {
        request(app)
          .get('/tobi.html')
          .expect('Content-Type', 'text/html; charset=UTF-8')
          .expect(200, err => {
            resolve()
            return t.assert.ifError(err)
          })
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('send directory', async function (t: TestContext) {
    await t.test('should redirect directories to trailing slash', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/pets')
        .expect('Location', '/pets/')
        .expect(301, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should respond with an HTML redirect', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/pets')
        .expect('Location', '/pets/')
        .expect('Content-Type', /html/)
        .expect(301, />Redirecting to \/pets\/</, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should respond with default Content-Security-Policy', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/pets')
        .expect('Location', '/pets/')
        .expect('Content-Security-Policy', "default-src 'none'")
        .expect(301, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should not redirect to protocol-relative locations', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('//pets')
        .expect('Location', '/pets/')
        .expect(301, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should respond with an HTML redirect', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, (req.url as string).replace('/snow', '/snow ☃'), { root: 'test/fixtures' })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/snow')
        .expect('Location', '/snow%20%E2%98%83/')
        .expect('Content-Type', /html/)
        .expect(301, />Redirecting to \/snow%20%E2%98%83\/</, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('send error', async function (t: TestContext) {
    await t.test('should respond to errors directly', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/foobar')
        .expect(404, />Not Found</, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should respond with default Content-Security-Policy', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures }))
        .get('/foobar')
        .expect('Content-Security-Policy', "default-src 'none'")
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('with conditional-GET', async function (t: TestContext) {
    await t.test('should remove Content headers with 304', async function (t: TestContext) {
      t.plan(2)

      const server = createServer({ root: fixtures }, function (req, res) {
        res.setHeader('Content-Language', 'en-US')
        res.setHeader('Content-Location', 'http://localhost/name.txt')
        res.setHeader('Contents', 'foo')
      })

      const { promise, resolve } = withResolvers()
      request(server)
        .get('/name.txt')
        .expect(200, function (err, res) {
          request(server)
            .get('/name.txt')
            .set('If-None-Match', res.headers.etag)
            .expect('Content-Location', 'http://localhost/name.txt')
            .expect('Contents', 'foo')
            .expect(304, err => {
              resolve()
              return t.assert.ifError(err)
            })
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should not remove all Content-* headers', async function (t: TestContext) {
      t.plan(2)

      const server = createServer({ root: fixtures }, function (req, res) {
        res.setHeader('Content-Location', 'http://localhost/name.txt')
        res.setHeader('Content-Security-Policy', 'default-src \'self\'')
      })

      const { promise, resolve } = withResolvers()
      request(server)
        .get('/name.txt')
        .expect(200, function (err, res) {
          request(server)
            .get('/name.txt')
            .set('If-None-Match', res.headers.etag)
            .expect('Content-Location', 'http://localhost/name.txt')
            .expect('Content-Security-Policy', 'default-src \'self\'')
            .expect(304, err => {
              resolve()
              return t.assert.ifError(err)
            })
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('where "If-Match" is set', async function (t: TestContext) {
      await t.test('should respond with 200 when "*"', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .set('If-Match', '*')
          .expect(200, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 412 when ETag unmatched', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .set('If-Match', ' "foo",, "bar" ,')
          .expect(412, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when ETag matched /1', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-Match', '"foo", "bar", ' + res.headers.etag)
              .expect(200, err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when ETag matched /2', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-Match', '"foo", ' + res.headers.etag + ', "bar"')
              .expect(200, err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('where "If-Modified-Since" is set', async function (t: TestContext) {
      await t.test('should respond with 304 when unmodified', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-Modified-Since', res.headers['last-modified'])
              .expect(304, err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when modified', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            const lmod = new Date(res.headers['last-modified']) as never as number
            const date = new Date(lmod - 60000)
            request(app)
              .get('/name.txt')
              .set('If-Modified-Since', date.toUTCString())
              .expect(200, 'tobi', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when modified', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-Modified-Since', res.headers['last-modified'])
              .set('cache-control', 'no-cache')
              .expect(200, 'tobi', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('where "If-None-Match" is set', async function (t: TestContext) {
      await t.test('should respond with 304 when ETag matched', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-None-Match', res.headers.etag)
              .expect(304, err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when ETag unmatched', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-None-Match', '"123"')
              .expect(200, 'tobi', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when ETag is not generated', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { etag: false, root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-None-Match', '"123"')
              .expect(200, 'tobi', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 306 Not Modified when using wildcard * on existing file', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { etag: false, root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-None-Match', '*')
              .expect(304, '', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 404 Not Found when using wildcard * on non-existing file', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { etag: false, root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/asdf.txt')
          .set('If-None-Match', '*')
          .expect(404, /Not Found/, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 cache-control is set to no-cache', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-None-Match', res.headers.etag)
              .set('cache-control', 'no-cache')
              .expect(200, 'tobi', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('where "If-Unmodified-Since" is set', async function (t: TestContext) {
      await t.test('should respond with 200 when unmodified', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            request(app)
              .get('/name.txt')
              .set('If-Unmodified-Since', res.headers['last-modified'])
              .expect(200, err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 412 when modified', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .expect(200, function (err, res) {
            const lmod = new Date(res.headers['last-modified']) as never as number
            const date = new Date(lmod - 60000).toUTCString()
            request(app)
              .get('/name.txt')
              .set('If-Unmodified-Since', date)
              .expect(412, err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when invalid date', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/name.txt')
          .set('If-Unmodified-Since', 'foo')
          .expect(200, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })
  })

  await t.test('with Range request', async function (t: TestContext) {
    await t.test('should support byte ranges', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/nums.txt')
        .set('Range', 'bytes=0-4')
        .expect(206, '12345', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should ignore non-byte ranges', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/nums.txt')
        .set('Range', 'items=0-4')
        .expect(200, '123456789', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should be inclusive', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/nums.txt')
        .set('Range', 'bytes=0-0')
        .expect(206, '1', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should set Content-Range', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/nums.txt')
        .set('Range', 'bytes=2-5')
        .expect('Content-Range', 'bytes 2-5/9')
        .expect(206, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should support -n', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/nums.txt')
        .set('Range', 'bytes=-3')
        .expect(206, '789', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should support n-', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/nums.txt')
        .set('Range', 'bytes=3-')
        .expect(206, '456789', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should respond with 206 "Partial Content"', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/nums.txt')
        .set('Range', 'bytes=0-4')
        .expect(206, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should set Content-Length to the # of octets transferred', async function (t: TestContext) {
      t.plan(1)

      const app = http.createServer(async function (req, res) {
        const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      })

      const { promise, resolve } = withResolvers()
      request(app)
        .get('/nums.txt')
        .set('Range', 'bytes=2-3')
        .expect('Content-Length', '2')
        .expect(206, '34', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('when last-byte-pos of the range is greater the length', async function (t: TestContext) {
      await t.test('is taken to be equal to one less than the length', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .set('Range', 'bytes=2-50')
          .expect('Content-Range', 'bytes 2-8/9')
          .expect(206, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should adapt the Content-Length accordingly', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .set('Range', 'bytes=2-50')
          .expect('Content-Length', '7')
          .expect(206, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('when the first- byte-pos of the range is greater length', async function (t: TestContext) {
      await t.test('should respond with 416', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .set('Range', 'bytes=9-50')
          .expect('Content-Range', 'bytes */9')
          .expect(416, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should emit error 416 with content-range header', async function (t: TestContext) {
        t.plan(1)

        const server = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, {
            ...headers,
            'X-Content-Range': headers['Content-Range']
          })
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(server)
          .get('/nums.txt')
          .set('Range', 'bytes=9-50')
          .expect('X-Content-Range', 'bytes */9')
          .expect(416, err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('when syntactically invalid', async function (t: TestContext) {
      await t.test('should respond with 200 and the entire contents', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .set('Range', 'asdf')
          .expect(200, '123456789', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('when multiple ranges', async function (t: TestContext) {
      await t.test('should respond with 200 and the entire contents', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .set('Range', 'bytes=1-1,3-')
          .expect(shouldNotHaveHeader('Content-Range', t))
          .expect(200, '123456789', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 206 is all ranges can be combined', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .set('Range', 'bytes=1-2,3-5')
          .expect('Content-Range', 'bytes 1-5/9')
          .expect(206, '23456', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })

    await t.test('when if-range present', async function (t: TestContext) {
      await t.test('should respond with parts when etag unchanged', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .expect(200, function (err, res) {
            const etag = res.headers.etag

            request(app)
              .get('/nums.txt')
              .set('If-Range', etag)
              .set('Range', 'bytes=0-0')
              .expect(206, '1', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when etag changed', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .expect(200, function (err, res) {
            const etag = res.headers.etag.replace(/"(.)/, '"0$1')

            request(app)
              .get('/nums.txt')
              .set('If-Range', etag)
              .set('Range', 'bytes=0-0')
              .expect(200, '123456789', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with parts when modified unchanged', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .expect(200, function (err, res) {
            const modified = res.headers['last-modified']

            request(app)
              .get('/nums.txt')
              .set('If-Range', modified)
              .set('Range', 'bytes=0-0')
              .expect(206, '1', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when modified changed', async function (t: TestContext) {
        t.plan(2)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .expect(200, function (err, res) {
            const modified = Date.parse(res.headers['last-modified']) - 20000

            request(app)
              .get('/nums.txt')
              .set('If-Range', new Date(modified).toUTCString())
              .set('Range', 'bytes=0-0')
              .expect(200, '123456789', err => {
                resolve()
                return t.assert.ifError(err)
              })
            return t.assert.ifError(err)
          })
        await promise
      })

      await t.test('should respond with 200 when invalid value', async function (t: TestContext) {
        t.plan(1)

        const app = http.createServer(async function (req, res) {
          const { statusCode, headers, stream } = await send(req, req.url as string, { root: fixtures })
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        })

        const { promise, resolve } = withResolvers()
        request(app)
          .get('/nums.txt')
          .set('If-Range', 'foo')
          .set('Range', 'bytes=0-0')
          .expect(200, '123456789', err => {
            resolve()
            return t.assert.ifError(err)
          })
        await promise
      })
    })
  })

  await t.test('when "options" is specified', async function (t: TestContext) {
    await t.test('should support start/end', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, start: 3, end: 5 }))
        .get('/nums.txt')
        .expect(200, '456', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should adjust too large end', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, start: 3, end: 90 }))
        .get('/nums.txt')
        .expect(200, '456789', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should support start/end with Range request', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, start: 0, end: 2 }))
        .get('/nums.txt')
        .set('Range', 'bytes=-2')
        .expect(206, '23', err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })

    await t.test('should support start/end with unsatisfiable Range request', async function (t: TestContext) {
      t.plan(1)

      const { promise, resolve } = withResolvers()
      request(createServer({ root: fixtures, start: 0, end: 2 }))
        .get('/nums.txt')
        .set('Range', 'bytes=5-9')
        .expect('Content-Range', 'bytes */3')
        .expect(416, err => {
          resolve()
          return t.assert.ifError(err)
        })
      await promise
    })
  })

  await t.test('file type', async function (t: TestContext) {
    t.plan(6)

    const { promise, resolve } = withResolvers()
    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream, type, metadata } = await send(req, req.url as string, { root: fixtures })
      t.assert.strictEqual(type, 'file')
      t.assert.ok((metadata as any).path)
      t.assert.ok((metadata as any).stat)
      t.assert.ok(!(metadata as any).error)
      t.assert.ok(!(metadata as any).requestPath)
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    request(app)
      .get('/name.txt')
      .expect('Content-Length', '4')
      .expect(200, 'tobi', err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('directory type', async function (t: TestContext) {
    t.plan(6)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream, type, metadata } = await send(req, req.url as string, { root: fixtures })
      t.assert.strictEqual(type, 'directory')
      t.assert.ok((metadata as any).path)
      t.assert.ok(!(metadata as any).stat)
      t.assert.ok(!(metadata as any).error)
      t.assert.ok((metadata as any).requestPath)
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/pets')
      .expect('Location', '/pets/')
      .expect(301, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('error type', async function (t: TestContext) {
    t.plan(6)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream, type, metadata } = await send(req, req.url as string, { root: fixtures })
      t.assert.strictEqual(type, 'error')
      t.assert.ok(!(metadata as any).path)
      t.assert.ok(!(metadata as any).stat)
      t.assert.ok((metadata as any).error)
      t.assert.ok(!(metadata as any).requestPath)
      res.writeHead(statusCode, headers)
      stream.pipe(res)
    })

    const { promise, resolve } = withResolvers()
    const path = Array(100).join('foobar')
    request(app)
      .get('/' + path)
      .expect(404, err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('custom directory index view', async function (t: TestContext) {
    t.plan(1)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream, type, metadata } = await send(req, req.url as string, { root: fixtures })
      if (type === 'directory') {
        const list = await readdir(metadata.path)
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' })
        res.end(list.join('\n') + '\n')
      } else {
        res.writeHead(statusCode, headers)
        stream.pipe(res)
      }
    })

    const { promise, resolve } = withResolvers()
    request(app)
      .get('/pets')
      .expect('Content-Type', 'text/plain; charset=UTF-8')
      .expect(200, '.hidden\nindex.html\n', err => {
        resolve()
        return t.assert.ifError(err)
      })
    await promise
  })

  await t.test('serving from a root directory with custom error-handling', async function (t: TestContext) {
    t.plan(3)

    const app = http.createServer(async function (req, res) {
      const { statusCode, headers, stream, type, metadata } = await send(req, req.url as string, { root: fixtures })
      switch (type) {
        case 'directory': {
          res.writeHead(301, {
            Location: metadata.requestPath + '/'
          })
          res.end('Redirecting to ' + metadata.requestPath + '/')
          break
        }
        case 'error': {
          res.writeHead((metadata as any).error.status ?? 500, {})
          res.end(metadata.error.message)
          break
        }
        default: {
          // serve all files for download
          res.setHeader('Content-Disposition', 'attachment')
          res.writeHead(statusCode, headers)
          stream.pipe(res)
        }
      }
    })

    const promises = []
    {
      const { promise, resolve } = withResolvers()
      request(app)
        .get('/pets')
        .expect('Location', '/pets/')
        .expect(301, err => {
          resolve()
          return t.assert.ifError(err)
        })
      promises.push(promise)
    }

    {
      const { promise, resolve } = withResolvers()
      request(app)
        .get('/not-exists')
        .expect(404, err => {
          resolve()
          return t.assert.ifError(err)
        })
      promises.push(promise)
    }

    {
      const { promise, resolve } = withResolvers()
      request(app)
        .get('/pets/index.html')
        .expect('Content-Disposition', 'attachment')
        .expect(200, err => {
          resolve()
          return t.assert.ifError(err)
        })
      promises.push(promise)
    }

    await Promise.all(promises)
  })
})
