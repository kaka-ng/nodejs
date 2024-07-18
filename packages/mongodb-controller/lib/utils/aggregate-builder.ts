export type Pipeline = Record<string, Stages>

export class AggregateBuilder {
  #pipeline: Pipeline[]

  constructor () {
    this.#pipeline = []
  }

  addFields (stage: AddFieldsStage): this {
    return this.#push('addFields', stage)
  }

  bucket (stage: BucketStage): this {
    return this.#push('bucket', stage)
  }

  bucketAuto (stage: BucketAutoStage): this {
    return this.#push('bucketAuto', stage)
  }

  changeStream (stage: ChangeStreamStage): this {
    return this.#push('changeStream', stage)
  }

  changeStreamSplitLargeEvent (): this {
    return this.#push('changeStreamSplitLargeEvent', {})
  }

  collStats (stage: CollStatsStage): this {
    return this.#push('collStats', stage)
  }

  count (stage: CountStage): this {
    return this.#push('count', stage)
  }

  currentOp (stage: CurrentOpStage): this {
    return this.#push('currentOp', stage)
  }

  densify (stage: DensifyStage): this {
    return this.#push('densify', stage)
  }

  documents (stage: DocumentsStage): this {
    return this.#push('documents', stage)
  }

  facet (stage: FacetStage): this {
    return this.#push('facet', stage)
  }

  fill (stage: FillStage): this {
    return this.#push('fill', stage)
  }

  geoNear (stage: GeoNearStage): this {
    return this.#push('geoNear', stage)
  }

  graphLookup (stage: GraphLookupStage): this {
    return this.#push('graphLookup', stage)
  }

  group (stage: GroupStage): this {
    return this.#push('group', stage)
  }

  indexStats (): this {
    return this.#push('indexStats', {})
  }

  limit (stage: LimitStage): this {
    return this.#push('limit', stage)
  }

  listLocalSessions (stage: ListLocalSessionsStage): this {
    return this.#push('listLocalSessions', stage)
  }

  listSampledQueries (stage: ListSampledQueriesStage): this {
    return this.#push('listSampledQueries', stage)
  }

  listSearchIndexes (stage: ListSearchIndexesStage): this {
    return this.#push('listSearchIndexes', stage)
  }

  listSessions (stage: ListSessionsStage): this {
    return this.#push('listSessions', stage)
  }

  lookup (stage: LookupStage): this {
    return this.#push('lookup', stage)
  }

  match (stage: MatchStage): this {
    return this.#push('match', stage)
  }

  merge (stage: MergeStage): this {
    return this.#push('merge', stage)
  }

  out (stage: OutStage): this {
    return this.#push('out', stage)
  }

  planCacheStats (): this {
    return this.#push('planCacheStats', {})
  }

  project (stage: ProjectStage): this {
    return this.#push('project', stage)
  }

  redact (stage: RedactStage): this {
    return this.#push('redact', stage)
  }

  replaceRoot (stage: ReplaceRootStage): this {
    return this.#push('replaceRoot', stage)
  }

  replaceWith (stage: ReplaceWithStage): this {
    return this.#push('replaceWith', stage)
  }

  sample (stage: SampleStage): this {
    return this.#push('sample', stage)
  }

  search (stage: SearchStage): this {
    return this.#push('search', stage)
  }

  searchMeta (stage: SearchMetaStage): this {
    return this.#push('searchMeta', stage)
  }

  set (stage: SetStage): this {
    return this.#push('set', stage)
  }

  setWindowFields (stage: SetWindowFieldsStage): this {
    return this.#push('setWindowFields', stage)
  }

  shardedDataDistribution (): this {
    return this.#push('shardedDataDistribution', {})
  }

  skip (stage: SkipStage): this {
    return this.#push('skip', stage)
  }

  sort (stage: SortStage): this {
    return this.#push('sort', stage)
  }

  sortByCount (stage: SortByCountStage): this {
    return this.#push('sortByCount', stage)
  }

  unionWith (stage: UnionWithStage): this {
    return this.#push('unionWith', stage)
  }

  unset (stage: UnsetStage): this {
    return this.#push('unset', stage)
  }

  unwind (stage: UnwindStage): this {
    return this.#push('unwind', stage)
  }

  #push (operator: string, stage: Stages): this {
    this.#pipeline.push({
      [`$${operator}`]: stage,
    })
    return this
  }

  concat (pipeline: AggregateBuilder | Pipeline[]): this {
    if (pipeline instanceof AggregateBuilder) {
      pipeline = pipeline.toArray()
    }
    this.#pipeline = this.#pipeline.concat(pipeline)
    return this
  }

  toArray (): Pipeline[] {
    return this.#pipeline
  }
}

export type Stages =
  AddFieldsStage |
  BucketStage |
  BucketAutoStage |
  ChangeStreamStage |
  CollStatsStage |
  CountStage |
  CurrentOpStage |
  DensifyStage |
  DocumentsStage |
  FacetStage |
  FillStage |
  GeoNearStage |
  GraphLookupStage |
  GroupStage |
  LimitStage |
  ListLocalSessionsStage |
  ListSampledQueriesStage |
  ListSearchIndexesStage |
  ListSessionsStage |
  LookupStage |
  MatchStage |
  MergeStage |
  OutStage |
  ProjectStage |
  RedactStage |
  ReplaceRootStage |
  ReplaceWithStage |
  SampleStage |
  SearchStage |
  SearchMetaStage |
  SetStage |
  SetWindowFieldsStage |
  SkipStage |
  SortStage |
  SortByCountStage |
  UnionWithStage |
  UnsetStage |
  UnwindStage

export type AddFieldsStage = Record<string, unknown>

export interface BucketStage {
  groupBy: string | Record<string, unknown>
  boundaries: unknown[]
  default: string
  output?: Record<string, unknown>
}

export interface BucketAutoStage {
  groupBy: string | Record<string, unknown>
  buckets: number
  output?: Record<string, unknown>
  granularity?: 'R5' | 'R10' | 'R20' | 'R40' | 'R80' | '1-2-5' | 'E6' | 'E12' | 'E24' | 'E48' | 'E96' | 'E192' | 'POWERSOF2'
}

export interface ChangeStreamStage {
  allChangesForCluster?: boolean
  fullDocument?: 'default' | 'required' | 'updateLookup' | 'whenAvailable'
  fullDocumentBeforeChange: 'off' | 'whenAvailable' | 'required'
  resumeAfter: number
  showExpandedEvents: boolean
  startAfter: unknown
  startAtOperationTime: number
}

export interface CollStatsStage {
  latencyStats?: { histograms: boolean }
  storageStats?: { scale: number }
  count?: Record<string, unknown>
  queryExecStats?: Record<string, unknown>
}

export type CountStage = string

export interface CurrentOpStage {
  allUsers?: boolean
  idleConnections?: boolean
  idleCursors?: boolean
  idleSessions?: boolean
  localOps?: boolean
  backtrace?: boolean
}

export interface DensifyStage {
  field: string
  partitionByFields?: string[]
  range: {
    step: number
    unit: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
    bounds: 'full' | 'partition' | [number, number]
  }
}

export type DocumentsStage = unknown[]

export type FacetStage = Record<string, unknown[]>

export interface FillStage {
  partitionBy: Record<string, `$${string}`>
  partitionByFields: string[]
  sortBy: Record<string, 1 | -1>
  output: Record<string, { value: unknown } | { method: string }>
}

export interface GeoNearStage {
  near: unknown
  distanceField: string
  spherical?: boolean
  maxDistance?: number
  query?: Record<string, unknown>
  distanceMultiplier?: number
  includeLocs?: string
  uniqueDocs?: boolean
  minDistance?: number
  key?: unknown
}

export interface GraphLookupStage {
  from: string
  startWith: string
  connectFromField: string
  connectToField: string
  as: string
  maxDepth?: number
  depthField?: string
  restrictSearchWithMatch?: Record<string, unknown>
}

export interface GroupStage {
  _id: string
  [key: string]: unknown
}

export type LimitStage = number

export type ListLocalSessionsStage = Record<string, unknown> | {
  users: Array<{ user: string, db: string }>
} | { allUsers: true }

export interface ListSampledQueriesStage {
  namespace?: string
}

export interface ListSearchIndexesStage {
  id?: string
  name?: string
}

export type ListSessionsStage = Record<string, unknown> | {
  users: Array<{ user: string, db: string }>
} | { allUsers: true }

export interface LookupStage {
  from: string
  localField?: string
  foreignField?: string
  let?: string
  pipeline?: unknown[]
  as: string
}

export type MatchStage = Record<string, unknown>

export interface MergeStage {
  into: OutStage
  on?: string | string[]
  let?: Record<string, unknown>
  whenMatched?: 'replace' | 'keepExisting' | 'merge' | 'fail'
  whenNotMatched?: 'insert' | 'discard' | 'fail'
}

export type OutStage = string | {
  db: string
  coll: string
}

export interface ProjectStage {
  _id?: 0 | false
  [key: string]: 0 | 1 | boolean | unknown
}

export type RedactStage = Record<string, unknown>

export interface ReplaceRootStage {
  newRoot: ReplaceWithStage
}

export type ReplaceWithStage = `$${string}` | Record<string, unknown>

export interface SampleStage {
  size: number
}

export type SearchStage = unknown

export type SearchMetaStage = unknown

export type SetStage = Record<string, unknown>

export interface SetWindowFieldsStage {
  partitionBy?: `$${string}` | Record<string, `$${string}`>
  sortBy: Record<string, 1 | -1>
  output: Record<string, {
    window?: {
      documents?: Array<'current' | 'unbound' | number>
      range?: ['current' | 'unbound' | number, 'current' | 'unbound' | number]
      unit?: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
    }
    [key: string]: unknown
  }>
}

export type SkipStage = number

export type SortStage = Record<string, 1 | -1 | { $meta: 'textScore' }>

export type SortByCountStage = `$${string}` | Record<string, unknown>

export type UnionWithStage = string | {
  coll: string
  pipeline?: unknown[]
}

export type UnsetStage = string | string[]

export type UnwindStage = string | {
  path: `$${string}`
  includeArrayIndex?: string
  preserveNullAndEmptyArrays?: boolean
}
