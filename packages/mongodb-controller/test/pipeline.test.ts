import { test } from '@kakang/unit'
import { isArray, isString } from '@kakang/validator'
import { MongoClient } from 'mongodb'
import { AggregateBuilder, Controller } from '../lib'
import { noop } from '../lib/utils/noop'
import { MONGODB_URL } from './config'

test('pipeline', async (t) => {
  const client = new MongoClient(MONGODB_URL)
  await client.connect()
  const collection = client.db('cicd').collection('pipeline')
  const controller = new Controller(collection, {
    searchFields: ['uid', 'foo', 'bar'],
  })
  controller.pipelineEmbeds = (embed) => {
    const embeds: Record<string, AggregateBuilder> = {}
    let keys: string[] = []
    if (isString(embed)) {
      keys = embed.split(',')
    }
    if (isArray(embed)) {
      keys = embed
    }
    for (const key of keys) {
      embeds[key] = new AggregateBuilder().lookup({ from: key, localField: 'local', foreignField: 'foreign', as: key })
    }
    return embeds
  }

  t.after(async () => {
    // we doesn't care if the database is properly removed or not
    await collection.deleteMany().catch(noop)
    await client.close()
  })

  t.test('no options', t => {
    t.plan(1)
    const pipeline = controller.pipeline().toArray()
    t.equal(pipeline.length, 0)
  })

  t.test('empty object', t => {
    t.plan(1)
    const pipeline = controller.pipeline({}).toArray()
    t.equal(pipeline.length, 0)
  })

  t.test('pagination', t => {
    t.plan(4)

    t.test('page only', t => {
      t.plan(1)
      const pipeline = controller.pipeline({ page: 1 }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('pageSize only', t => {
      t.plan(1)
      const pipeline = controller.pipeline({ pageSize: 10 }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('page: 1, pageSize: 10', t => {
      t.plan(3)
      const pipeline = controller.pipeline({ page: 1, pageSize: 10 }).toArray()
      t.equal(pipeline.length, 2)
      t.equal(pipeline[0].$limit, 10)
      t.equal(pipeline[1].$skip, 0)
    })

    t.test('page: 10, pageSize: 1', t => {
      t.plan(3)
      const pipeline = controller.pipeline({ page: 10, pageSize: 1 }).toArray()
      t.equal(pipeline.length, 2)
      t.equal(pipeline[0].$limit, 10)
      t.equal(pipeline[1].$skip, 9)
    })
  })

  t.test('sort', t => {
    t.plan(7)

    t.test('no field', t => {
      t.plan(1)
      // @ts-expect-error
      const pipeline = controller.pipeline({ orderby: 'asc' }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('no field', t => {
      t.plan(1)
      const pipeline = controller.pipeline({ 'orderby.': 'asc' }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('no value', t => {
      t.plan(1)
      // @ts-expect-error
      const pipeline = controller.pipeline({ 'orderby.id': 'non-exist' }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('asc', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ 'orderby.id': 'asc' }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$sort, { id: 1 })
    })

    t.test('desc', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ 'orderby.id': 'desc' }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$sort, { id: -1 })
    })

    t.test('text', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ 'orderby.id': 'text' }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$sort, { id: { $meta: 'textScore' } })
    })

    t.test('mixed', t => {
      t.plan(2)
      const pipeline = controller.pipeline({
        'orderby.id': 'asc',
        'orderby.foo': 'asc',
        'orderby.bar': 'desc',
        'orderby.baz': 'text',
        'orderby.hello.world': 'asc',
      }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$sort, {
        id: 1,
        foo: 1,
        bar: -1,
        baz: { $meta: 'textScore' },
        'hello.world': 1,
      })
    })
  })

  t.test('projection', t => {
    t.plan(5)

    t.test('no field', t => {
      t.plan(1)
      const pipeline = controller.pipeline({ fields: '' }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('no field', t => {
      t.plan(1)
      const pipeline = controller.pipeline({ fields: [] }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('no field', t => {
      t.plan(1)
      const pipeline = controller.pipeline({ fields: [''] }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('string field', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ fields: 'foo,bar,,baz' }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$project, {
        foo: 1,
        bar: 1,
        baz: 1,
      })
    })

    t.test('array field', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ fields: ['foo', '', 'bar', 'baz'] }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$project, {
        foo: 1,
        bar: 1,
        baz: 1,
      })
    })
  })

  t.test('search', t => {
    t.plan(2)

    t.test('search empty string', t => {
      t.plan(1)
      const pipeline = controller.pipeline({ search: '' }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('search string', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ search: 'hello' }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$match, {
        $and: [
          {
            $or: [
              { uid: { $regexp: 'hello', $options: 'i' } },
              { foo: { $regexp: 'hello', $options: 'i' } },
              { bar: { $regexp: 'hello', $options: 'i' } },
            ],
          },
        ],
      })
    })
  })

  t.test('filter', t => {
    t.test('where empty string', t => {
      t.plan(1)
      const pipeline = controller.pipeline({ 'where.id.eq': '' }).toArray()
      t.equal(pipeline.length, 0)
    })

    t.test('where string', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ 'where.id.eq': 'hello' }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$match, {
        $and: [
          { id: { $eq: 'hello' } },
        ],
      })
    })

    t.test('multiple where', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ 'where.id.eq': 'hello', 'where.foo.ne': 'bar' }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$match, {
        $and: [
          {
            id: { $eq: 'hello' },
            foo: { $ne: 'bar' },
          },
        ],
      })
    })

    t.test('where or', t => {
      t.plan(2)
      const pipeline = controller.pipeline({ 'where.or': '(id.eq=hello|foo.ne=bar)' }).toArray()
      t.equal(pipeline.length, 1)
      t.deepEqual(pipeline[0].$match, {
        $and: [
          {
            $or: [
              { id: { $eq: 'hello' } },
              { foo: { $ne: 'bar' } },
            ],
          },
        ],
      })
    })
  })

  t.test('embed', t => {
    t.test('prepend', t => {
      t.plan(2)
      const pipeline = controller.pipeline({
        embed: 'foo',
        search: 'a'
      }).toArray()
      t.equal(pipeline.length, 2)
      t.deepEqual(pipeline[0].$lookup, { from: 'foo', localField: 'local', foreignField: 'foreign', as: 'foo' })
    })
  })

  t.test('append', t => {
    t.plan(2)
    const pipeline = controller.pipeline({
      embed: 'embed',
      search: 'a'
    }).toArray()
    t.equal(pipeline.length, 2)
    t.deepEqual(pipeline[1].$lookup, { from: 'embed', localField: 'local', foreignField: 'foreign', as: 'embed' })
  })

  t.test('both', t => {
    t.plan(3)
    const pipeline = controller.pipeline({
      embed: 'foo,embed',
      search: 'a'
    }).toArray()
    t.equal(pipeline.length, 3)
    t.deepEqual(pipeline[0].$lookup, { from: 'foo', localField: 'local', foreignField: 'foreign', as: 'foo' })
    t.deepEqual(pipeline[2].$lookup, { from: 'embed', localField: 'local', foreignField: 'foreign', as: 'embed' })
  })
})
