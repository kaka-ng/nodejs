import { test } from '@kakang/unit'
import { MongoClient } from 'mongodb'
import { Controller } from '../lib'
import { noop } from '../lib/utils/noop'
import { MONGODB_URL } from './config'

test('controller', async (t) => {
  const client = new MongoClient(MONGODB_URL)
  await client.connect()
  const collection = client.db('cicd').collection('controller')
  const controller = new Controller(collection, {
    searchFields: ['uid', 'foo', 'bar'],
  })

  t.after(async () => {
    // we doesn't care if the database is properly removed or not
    await collection.deleteMany().catch(noop)
    await client.close()
  })

  t.test('provided getter', t => {
    t.equal(controller.collectionName, 'controller')
    t.deepEqual(controller.schema, { type: 'object', properties: {} })
    t.deepEqual(controller.fields, [])
  })

  t.test('insert', async t => {
    t.plan(7)
    const ok: typeof t.ok = t.ok
    const doc: any = await controller.insertOne({ foo: 'bar', bar: 'baz', hello: 'world' })
    ok(doc)
    // appended fields
    ok(doc.uid)
    ok(doc.createdAt)
    ok(doc.updatedAt)
    // inserted fields
    t.equal(doc.foo, 'bar')
    t.equal(doc.bar, 'baz')
    t.equal(doc.hello, 'world')
  })

  t.test('find one', async t => {
    t.plan(7)
    const ok: typeof t.ok = t.ok
    const doc: any = await controller.findOne({ foo: 'bar' })
    ok(doc)
    // appended fields
    ok(doc.uid)
    ok(doc.createdAt)
    ok(doc.updatedAt)
    // inserted fields
    t.equal(doc.foo, 'bar')
    t.equal(doc.bar, 'baz')
    t.equal(doc.hello, 'world')
  })

  t.test('find', async t => {
    t.plan(7)
    const ok: typeof t.ok = t.ok
    const [doc]: any = await controller.find({ foo: 'bar' })
    ok(doc)
    // appended fields
    ok(doc.uid)
    ok(doc.createdAt)
    ok(doc.updatedAt)
    // inserted fields
    t.equal(doc.foo, 'bar')
    t.equal(doc.bar, 'baz')
    t.equal(doc.hello, 'world')
  })

  t.test('partial update', async t => {
    t.plan(7)
    const ok: typeof t.ok = t.ok
    const doc: any = await controller.updateOne({ foo: 'bar' }, { foo: 'barrrrr' })
    ok(doc)
    // appended fields
    ok(doc.uid)
    ok(doc.createdAt)
    ok(doc.updatedAt)
    // inserted fields
    t.equal(doc.foo, 'barrrrr')
    t.equal(doc.bar, 'baz')
    t.equal(doc.hello, 'world')
  })

  t.test('update', async t => {
    t.plan(7)
    const ok: typeof t.ok = t.ok
    const doc: any = await controller.updateOne({ foo: 'barrrrr' }, { foo: 'barrrrr', bar: 'bazzzzz', hello: 'worlddddd' })
    ok(doc)
    // appended fields
    ok(doc.uid)
    ok(doc.createdAt)
    ok(doc.updatedAt)
    // inserted fields
    t.equal(doc.foo, 'barrrrr')
    t.equal(doc.bar, 'bazzzzz')
    t.equal(doc.hello, 'worlddddd')
  })

  t.test('delete', async t => {
    t.plan(7)
    const ok: typeof t.ok = t.ok
    const doc: any = await controller.deleteOne({ foo: 'barrrrr' })
    ok(doc)
    // appended fields
    ok(doc.uid)
    ok(doc.createdAt)
    ok(doc.updatedAt)
    // inserted fields
    t.equal(doc.foo, 'barrrrr')
    t.equal(doc.bar, 'bazzzzz')
    t.equal(doc.hello, 'worlddddd')
  })
})
