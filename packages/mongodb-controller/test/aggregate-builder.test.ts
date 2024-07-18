import { ExtendedTestContext, test } from '@kakang/unit'
import { AggregateBuilder, ChangeStreamStage, DensifyStage, FillStage, MergeStage, SetWindowFieldsStage, SortStage } from '../lib'

function validatePipeline (t: ExtendedTestContext, builder: AggregateBuilder) {
  const pipeline = builder.toArray()
  for (const stage of pipeline) {
    if (`$${t.name}` in stage) {
      t.equal(`$${t.name}` in stage, true)
    }
  }
}

test('methods', function (t) {
  t.plan(45)
  const builder = new AggregateBuilder()

  t.test('addFields', function (t) {
    t.plan(1)
    const opt = { foo: 'bar' }
    builder.addFields(opt)
    validatePipeline(t, builder)
  })

  t.test('bucket', function (t) {
    t.plan(1)
    const opt = {
      groupBy: '$year_born', // Field to group by
      boundaries: [1840, 1850, 1860, 1870, 1880], // Boundaries for the buckets
      default: 'Other', // Bucket id for documents which do not fall into a bucket
      output: { // Output for each bucket
        count: { $sum: 1 },
        artists:
          {
            $push: {
              name: { $concat: ['$first_name', ' ', '$last_name'] },
              year_born: '$year_born',
            },
          },
      },
    }
    builder.bucket(opt)
    validatePipeline(t, builder)
  })

  t.test('bucketAuto', function (t) {
    t.plan(1)
    const opt = {
      groupBy: {
        $multiply: ['$dimensions.height', '$dimensions.width'],
      },
      buckets: 4,
      output: {
        count: { $sum: 1 },
        titles: { $push: '$title' },
      },
    }
    builder.bucketAuto(opt)
    validatePipeline(t, builder)
  })

  t.test('changeStream', function (t) {
    t.plan(1)
    const opt: ChangeStreamStage = {
      fullDocumentBeforeChange: 'whenAvailable',
      resumeAfter: 0,
      showExpandedEvents: false,
      startAfter: {},
      startAtOperationTime: 0,
    }
    builder.changeStream(opt)
    validatePipeline(t, builder)
  })

  t.test('changeStreamSplitLargeEvent', function (t) {
    t.plan(1)
    builder.changeStreamSplitLargeEvent()
    validatePipeline(t, builder)
  })

  t.test('collStats', function (t) {
    t.plan(1)
    const opt = { latencyStats: { histograms: true } }
    builder.collStats(opt)
    validatePipeline(t, builder)
  })

  t.test('count', function (t) {
    t.plan(1)
    const opt = 'passing_scores'
    builder.count(opt)
    validatePipeline(t, builder)
  })

  t.test('currentOp', function (t) {
    t.plan(1)
    const opt = { allUsers: true, idleSessions: true }
    builder.currentOp(opt)
    validatePipeline(t, builder)
  })

  t.test('densify', function (t) {
    t.plan(1)
    const opt: DensifyStage = {
      field: 'foo',
      range: {
        step: 5,
        unit: 'millisecond',
        bounds: 'full',
      },
    }
    builder.densify(opt)
    validatePipeline(t, builder)
  })

  t.test('documents', function (t) {
    t.plan(1)
    const opt: unknown[] = []
    builder.documents(opt)
    validatePipeline(t, builder)
  })

  t.test('facet', function (t) {
    t.plan(1)
    const opt = {
      categorizedByTags: [
        { $unwind: '$tags' },
        { $sortByCount: '$tags' },
      ],
      categorizedByPrice: [
        // Filter out documents without a price e.g., _id: 7
        { $match: { price: { $exists: 1 } } },
        {
          $bucket: {
            groupBy: '$price',
            boundaries: [0, 150, 200, 300, 400],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              titles: { $push: '$title' },
            },
          },
        },
      ],
      'categorizedByYears(Auto)': [
        {
          $bucketAuto: {
            groupBy: '$year',
            buckets: 4,
          },
        },
      ],
    }
    builder.facet(opt)
    validatePipeline(t, builder)
  })

  t.test('fill', function (t) {
    t.plan(1)
    const opt: FillStage = {
      partitionBy: { foo: '$foo' },
      partitionByFields: ['foo'],
      sortBy: { foo: 1 },
      output: { foo: { value: '$foo' } },
    }
    builder.fill(opt)
    validatePipeline(t, builder)
  })

  t.test('geoNear', function (t) {
    t.plan(1)
    const opt = {
      near: { type: 'Point', coordinates: [-73.99279, 40.719296] },
      distanceField: 'dist.calculated',
      maxDistance: 2,
      query: { category: 'Parks' },
      includeLocs: 'dist.location',
      spherical: true,
    }
    builder.geoNear(opt)
    validatePipeline(t, builder)
  })

  t.test('graphLookup', function (t) {
    t.plan(1)
    const opt = {
      from: 'employees',
      startWith: '$reportsTo',
      connectFromField: 'reportsTo',
      connectToField: 'name',
      as: 'reportingHierarchy',
    }
    builder.graphLookup(opt)
    validatePipeline(t, builder)
  })

  t.test('group', function (t) {
    t.plan(1)
    const opt = { _id: '$item' }
    builder.group(opt)
    validatePipeline(t, builder)
  })

  t.test('indexStats', function (t) {
    t.plan(1)
    builder.indexStats()
    validatePipeline(t, builder)
  })

  t.test('limit', function (t) {
    t.plan(1)
    const opt = 5
    builder.limit(opt)
    validatePipeline(t, builder)
  })

  t.test('listLocalSessions', function (t) {
    t.plan(1)
    const opt = { users: [{ user: 'myAppReader', db: 't.test' }] }
    builder.listLocalSessions(opt)
    validatePipeline(t, builder)
  })

  t.test('listSampledQueries', function (t) {
    t.plan(1)
    const opt = { namespace: 'id' }
    builder.listSampledQueries(opt)
    validatePipeline(t, builder)
  })

  t.test('listSearchIndexes', function (t) {
    t.plan(1)
    const opt = { id: '_id', name: 'id' }
    builder.listSearchIndexes(opt)
    validatePipeline(t, builder)
  })

  t.test('listSessions', function (t) {
    t.plan(1)
    const opt = { users: [{ user: 'myAppReader', db: 't.test' }] }
    builder.listSessions(opt)
    validatePipeline(t, builder)
  })

  t.test('lookup', function (t) {
    t.plan(1)
    const opt = {
      from: 'inventory',
      localField: 'item',
      foreignField: 'sku',
      as: 'inventory_docs',
    }
    builder.lookup(opt)
    validatePipeline(t, builder)
  })

  t.test('match', function (t) {
    t.plan(1)
    const opt = { $or: [{ score: { $gt: 70, $lt: 90 } }, { views: { $gte: 1000 } }] }
    builder.match(opt)
    validatePipeline(t, builder)
  })

  t.test('merge', function (t) {
    t.plan(1)
    const opt: MergeStage = { into: 'myOutput', on: '_id', whenMatched: 'replace', whenNotMatched: 'insert' }
    builder.merge(opt)
    validatePipeline(t, builder)
  })

  t.test('out', function (t) {
    t.plan(1)
    const opt = 'authors'
    builder.out(opt)
    validatePipeline(t, builder)
  })

  t.test('planCacheStats', function (t) {
    t.plan(1)
    builder.planCacheStats()
    validatePipeline(t, builder)
  })

  t.test('project', function (t) {
    t.plan(1)
    const opt = { contact: 1, 'contact.address.country': 1 }
    builder.project(opt)
    validatePipeline(t, builder)
  })

  t.test('redact', function (t) {
    t.plan(1)
    const opt = {
      $cond: {
        if: { $gt: [{ $size: { $setIntersection: ['$tags', ['STLW', 'G']] } }, 0] },
        then: '$$DESCEND',
        else: '$$PRUNE',
      },
    }
    builder.redact(opt)
    validatePipeline(t, builder)
  })

  t.test('replaceRoot', function (t) {
    t.plan(1)
    const opt = { newRoot: { $mergeObjects: [{ _id: '$_id', first: '', last: '' }, '$name'] } }
    builder.replaceRoot(opt)
    validatePipeline(t, builder)
  })

  t.test('replaceWith', function (t) {
    t.plan(1)
    const opt = { $mergeObjects: [{ _id: '$_id', first: '', last: '' }, '$name'] }
    builder.replaceWith(opt)
    validatePipeline(t, builder)
  })

  t.test('sample', function (t) {
    t.plan(1)
    const opt = { size: 3 }
    builder.sample(opt)
    validatePipeline(t, builder)
  })

  t.test('search', function (t) {
    t.plan(1)
    const opt = {
      foo: 'bar',
    }
    builder.search(opt)
    validatePipeline(t, builder)
  })

  t.test('searchMeta', function (t) {
    t.plan(1)
    const opt = {
      foo: 'bar',
    }
    builder.searchMeta(opt)
    validatePipeline(t, builder)
  })

  t.test('set', function (t) {
    t.plan(1)
    const opt = {
      totalHomework: { $sum: '$homework' },
      totalQuiz: { $sum: '$quiz' },
    }
    builder.set(opt)
    validatePipeline(t, builder)
  })

  t.test('setWindowFields', function (t) {
    t.plan(1)
    const opt: SetWindowFieldsStage = {
      sortBy: { foo: 1 },
      output: { window: { documents: ['current'], range: ['current'], unit: 'millisecond' } },
    }
    builder.setWindowFields(opt)
    validatePipeline(t, builder)
  })

  t.test('shardedDataDistribution', function (t) {
    t.plan(1)
    builder.shardedDataDistribution()
    validatePipeline(t, builder)
  })

  t.test('skip', function (t) {
    t.plan(1)
    const opt = 5
    builder.skip(opt)
    validatePipeline(t, builder)
  })

  t.test('sort', function (t) {
    t.plan(1)
    const opt: SortStage = { borough: 1, _id: 1 }
    builder.sort(opt)
    validatePipeline(t, builder)
  })

  t.test('sortByCount', function (t) {
    t.plan(1)
    const opt = '$tags'
    builder.sortByCount(opt)
    validatePipeline(t, builder)
  })

  t.test('unionWith', function (t) {
    t.plan(1)
    const opt = { coll: 'warehouses', pipeline: [{ $project: { state: 1, _id: 0 } }] }
    builder.unionWith(opt)
    validatePipeline(t, builder)
  })

  t.test('unset', function (t) {
    t.plan(1)
    const opt = 'copies'
    builder.unset(opt)
    validatePipeline(t, builder)
  })

  t.test('unwind', function (t) {
    t.plan(1)
    const opt = '$sizes'
    builder.unwind(opt)
    validatePipeline(t, builder)
  })

  t.test('concat - array', function (t) {
    t.plan(1)
    const opt = [{ $count: 'concat' }]
    builder.concat(opt)
    t.equal(builder.toArray().length, 43)
  })

  t.test('concat - AggregateBuilder', function (t) {
    t.plan(1)
    const opt = new AggregateBuilder()
    opt.count('AggregateBuilder')
    builder.concat(opt)
    t.equal(builder.toArray().length, 44)
  })

  t.test('toArray', function (t) {
    t.plan(1)
    const pipeline = builder.toArray()
    t.equal(pipeline.length, 44)
  })
})
