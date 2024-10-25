import { EventEmitter, Listener } from '@kakang/eventemitter'
import { isArray, isEmpty, isExist, isNumber, isObject, isString } from '@kakang/validator'
import { type AggregateOptions, type Collection, type CreateIndexesOptions, type DeleteOptions, type Document, type Filter, type FindOneAndDeleteOptions, type FindOneAndReplaceOptions, type FindOneAndUpdateOptions, type FindOptions, type IndexSpecification, type UpdateFilter, type UpdateOptions } from 'mongodb'
import { AggregateBuilder, Pipeline, type MatchStage, type ProjectStage, type SortStage } from '../utils/aggregate-builder'
import { appendCreateFields, appendUpdateFields } from '../utils/append'
import { noop } from '../utils/noop'
import { buildOperatorMap } from '../utils/operator-map'
import { normalizeQueryData, splitFieldOperator } from '../utils/query'

export interface SearchOptions {
  // shortcut of where.or multiple field like
  search?: string
  // we prefix with where
  [key: `where.${string}`]: string
  // orderby
  [key: `orderby.${string}`]: 'asc' | 'desc' | 'text'
  // project
  fields?: string | string[]
  // embed
  embed?: string | string[]
  // pagination
  page?: number
  pageSize?: number
}

export interface ControllerOptions {
  schema?: unknown
  indexField?: string
  searchFields?: string[]
  indexes?: Array<[IndexSpecification, CreateIndexesOptions | undefined]>
}

export class Controller<TSchema extends Document = Document> extends EventEmitter {
  #collection: Collection<TSchema>
  readonly #indexes: Array<[IndexSpecification, CreateIndexesOptions | undefined]>
  #schema: unknown
  #fields: string[]
  #indexField: string
  searchFields: string[]
  operatorMap: Map<string, string>

  get collection (): Collection<TSchema> {
    return this.#collection
  }

  set collection (collection: Collection<TSchema>) {
    if (isEmpty(collection)) throw TypeError(`collection expected to be "object", but recieved "${typeof collection}"`)
    this.#collection = collection
  }

  get collectionName (): string {
    return this.collection.collectionName
  }

  get schema (): unknown {
    return this.#schema
  }

  set schema (schema: unknown) {
    if (!isObject(schema)) throw TypeError(`schema expected to be "object", but recieved "${typeof schema}"`)
    this.#schema = schema
    this.#fields = Object.keys((schema as any).properties as Record<string, unknown>)
  }

  get fields (): string[] {
    return this.#fields
  }

  constructor (collection: Collection<any>, options?: ControllerOptions) {
    super()
    // pre-allocation
    this.#collection = null as never as Collection<TSchema>
    this.collection = collection
    this.#indexField = options?.indexField ?? 'uid'
    this.#indexes = []
    this.#indexes.push([{ [this.#indexField]: 1 }, { background: false, unique: true }])
    this.#indexes.push(...(options?.indexes ?? []))
    this.#fields = []
    this.schema = options?.schema ?? { type: 'object', properties: {} }
    this.searchFields = options?.searchFields ?? [this.#indexField]
    // use build operator map to allows per controller
    this.operatorMap = buildOperatorMap()

    this.#createIndexes()

    this._emit('initialized')
  }

  // wrapper of emit that do not want to wait
  _emit (eventName: string, ...args: unknown[]): void {
    this.emit(eventName, ...args)
      .catch((err) => {
        // note that if you re-thrown inside the error listener
        // it may cause you infinite loop
        this._emit('error', err)
      })
  }

  #createIndexes (): void {
    for (const [indexSpec, options] of this.#indexes) {
      this.createIndex(indexSpec, options).catch(noop)
    }
  }

  async createIndex (indexSpec: IndexSpecification, options?: CreateIndexesOptions): Promise<string> {
    try {
      return await this.collection.createIndex(indexSpec, options)
    } catch {
      return ''
    }
  }

  async count<U extends Document = TSchema> (options?: SearchOptions, o?: AggregateOptions): Promise<U[]> {
    options ??= {}
    const pipeline = this.buildAggregateBuilder(options).concat(this.pipelineQuery(options)).count('count').toArray()
    const found = await this.collection.aggregate<U>(pipeline, o).toArray()
    const result = found.at(0)?.count ?? 0
    return result
  }

  async search<U extends Document = TSchema> (options?: SearchOptions, o?: AggregateOptions): Promise<U[]> {
    options ??= {}
    const pipeline = this.pipeline(options).toArray()
    const result = await this.collection.aggregate<U>(pipeline, o).toArray()
    return result
  }

  async insertOne (docs: TSchema, options?: FindOneAndReplaceOptions): Promise<TSchema | null> {
    const doc = appendCreateFields(docs)
    options ??= {}
    // we must use upsert = true here
    options.upsert = true
    options.returnDocument = 'after'
    const result = await this.collection.findOneAndReplace({
      [this.#indexField]: doc[this.#indexField],
    } as Filter<TSchema>, doc, options)
    return result as TSchema | null
  }

  async find (filter?: Filter<TSchema>, options?: FindOptions<TSchema>): Promise<TSchema[]> {
    filter ??= {}
    options ??= {}
    const result = await this.collection.find(filter, options).toArray()
    return result as TSchema[]
  }

  async findOne (filter?: Filter<TSchema>, options?: FindOptions<TSchema>): Promise<TSchema | null> {
    options ??= {}
    filter ??= {}
    const result = await this.collection.findOne(filter, options)
    return result as TSchema
  }

  async updateOne (filter: Filter<TSchema>, docs: UpdateFilter<TSchema> | Partial<TSchema>, options?: FindOneAndUpdateOptions): Promise<TSchema | null> {
    options ??= {}
    options.returnDocument ??= 'after'
    const doc = appendUpdateFields(docs)
    const result = await this.collection.findOneAndUpdate(filter, normalizeQueryData(doc), options)
    return result as TSchema | null
  }

  async updateMany (filter: Filter<TSchema>, docs: UpdateFilter<TSchema> | Partial<TSchema>, options?: UpdateOptions): Promise<TSchema[]> {
    options ??= {}
    const doc = appendUpdateFields(docs)
    const session = options.session
    // since mongodb do not provide a single transaction operate
    // to batch update and return new document
    // we pre-fetch the pending update documents and update
    // those records by uid to prevent non-consistency between
    // three operation without transaction.
    const _uids: string[] = await this.collection.find(filter, { session }).map((o) => o[this.#indexField]).toArray()
    const _filter: Filter<TSchema> = { [this.#indexField]: { $in: _uids } } as any
    await this.collection.updateMany(_filter, normalizeQueryData(doc), options)
    const result = await this.collection.find<TSchema>(_filter, { session }).toArray()
    return result
  }

  async deleteOne (filter: Filter<TSchema>, options?: FindOneAndDeleteOptions): Promise<TSchema | null> {
    options ??= {}
    const result = await this.collection.findOneAndDelete(filter, options)
    return result as TSchema | null
  }

  async deleteMany (filter?: Filter<TSchema>, options?: DeleteOptions): Promise<TSchema[]> {
    filter ??= {}
    options ??= {}
    const session = options.session
    const result = await this.collection.find<TSchema>(filter, { session }).toArray()
    const _filter: Filter<TSchema> = { [this.#indexField]: { $in: result.map((o) => o[this.#indexField]) } } as any
    await this.collection.deleteMany(_filter, options)
    return result
  }

  pipelineQuery (options?: SearchOptions): AggregateBuilder {
    const builder = new AggregateBuilder()
    const contains: string[] = []
    // search and where should be concat with $and
    // if anyone just like to filter, it should not
    // pass search
    const $and: unknown[] = []
    const option: MatchStage = { $and }
    if (isObject(options)) {
      if (isString(options.search) && isExist(options.search) && this.searchFields.length > 0) {
        // we update search first
        const search = []
        for (const field of this.searchFields) {
          contains.push(field)
          search.push({ [field]: { $regexp: options.search, $options: 'i' } })
        }
        $and.push({ $or: search })
      }
      const obj: Record<string, Record<string, unknown>> = {}
      for (const _field in options) {
        // TODO: consider support empty string value
        const value = options[_field as `where.${string}`]
        const fields = _field.split('.')
        const prefix = fields.shift()
        const field = fields.join('.')
        // field must be prefix with where.
        if (prefix !== 'where') continue
        // no field or value, then skip
        if (!isExist(field) || !isExist(value)) continue

        // where.or=([field].[operator]|[field].[operator])
        if (field === 'or' && value[0] === '(' && value[value.length - 1] === ')') {
          const $or: unknown[] = []
          for (const pair of value.substring(1, value.length - 1).split('|')) {
            const [field, value] = pair.split('=')
            const { field: _field, operator } = splitFieldOperator(field, this.operatorMap)
            if (!isExist(operator) || !isExist(_field)) continue

            contains.push(_field)
            $or.push({ [_field]: { [operator]: value } })
          }
          if ($or.length) {
            $and.push({ $or })
          }
          continue
        }

        // where.[field].[operator]
        const { field: name, operator } = splitFieldOperator(field, this.operatorMap)
        if (!isExist(operator) || !isExist(name)) continue

        contains.push(name)
        obj[name] ??= {}
        obj[name][operator] = value
      }

      if (Object.keys(obj).length) {
        $and.push(obj)
      }
    }

    if ($and.length) {
      builder.match(option)
    }

    // we provides the contained fields for embed
    builder.metadata = contains
    return builder
  }

  // embed, must override to uses
  pipelineEmbeds (_embed?: string | string[]): Record<string, AggregateBuilder> {
    return {}
  }

  // project
  pipelineFields (fields?: string | string[]): AggregateBuilder {
    const builder = new AggregateBuilder()
    if (isString(fields)) {
      // we split fields by comma
      fields = fields.split(',')
    }
    if (isArray(fields) && fields.length > 0) {
      const option: ProjectStage = {}
      for (const field of fields) {
        if (isString(field) && isExist(field)) {
          option[field] = 1
        }
      }
      if (Object.keys(option).length) {
        builder.project(option)
      }
    }
    return builder
  }

  // limit / skip
  pipelinePagination (page?: number, pageSize?: number): AggregateBuilder {
    const builder = new AggregateBuilder()
    // page & pageSize must be used to togather
    if (isNumber(page) && isNumber(pageSize)) {
      const skip = page > 0 ? (page - 1) * pageSize : 0
      // MongoDB will increase the limit amount automatically when
      // we place skip before limit. Instead of rely on optimization
      // we do it ourselve.
      builder.limit(pageSize + skip)
      builder.skip(skip)
    }
    return builder
  }

  // sort
  pipelineOrderBy (options?: Record<`orderby.${string}`, 'asc' | 'desc' | 'text'>): AggregateBuilder {
    const builder = new AggregateBuilder()
    const contains: string[] = []
    if (isObject(options)) {
      const option: SortStage = {}
      for (const _field in options) {
        const value = options[_field as `orderby.${string}`]
        const fields = _field.split('.')
        const prefix = fields.shift()
        const field = fields.join('.')
        // field must be prefix with orderby.
        if (prefix !== 'orderby') continue
        // no field string, then skip
        if (!isExist(field)) continue
        let order: 1 | -1 | { $meta: 'textScore' } | undefined
        switch (value) {
          case 'asc': {
            order = 1
            break
          }
          case 'desc': {
            order = -1
            break
          }
          case 'text': {
            order = { $meta: 'textScore' }
            break
          }
        }
        // no order, then skip
        if (!isExist(order)) continue
        contains.push(field)
        option[field] = order
      }

      if (Object.keys(option).length) {
        builder.sort(option)
      }
    }
    builder.metadata = contains
    return builder
  }

  pipeline (options: SearchOptions = {}): AggregateBuilder {
    const builder = this.buildAggregateBuilder(options)
    // matching in the first
    const query = this.pipelineQuery(options)
    builder.concat(query)
    // we should sort before pagination
    const orderBy = this.pipelineOrderBy(options)
    builder.concat(orderBy)
    const pagination = this.pipelinePagination(options.page, options.pageSize)
    builder.concat(pagination)
    // compute embed before fields to determine if we prepend or append to builder
    const embeds = this.pipelineEmbeds(options.embed)
    const embedKeys = Object.keys(embeds)
    const contains = (query.metadata as string[]).concat(orderBy.metadata as string[])
    let prepend: Pipeline[] = []
    let append: Pipeline[] = []
    for (const key of embedKeys) {
      if (contains.some((contain) => contain.startsWith(key))) {
        prepend = prepend.concat(embeds[key].toArray())
      } else {
        append = append.concat(embeds[key].toArray())
      }
    }
    builder.prepend(prepend)
    builder.concat(append)
    // project must be the last stage
    const fields = this.pipelineFields(options.fields)
    builder.concat(fields)
    return builder
  }

  buildAggregateBuilder (_options: SearchOptions): AggregateBuilder {
    return new AggregateBuilder()
  }

  async resetDatabase (): Promise<boolean> {
    try {
      await this.collection.drop()
    } catch (err: any) {
      // ns not found means the database is not exist
      if (err.message !== 'ns not found') throw err
    }
    this.#createIndexes()
    return true
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Controller<TSchema extends Document = Document> extends EventEmitter {
  on(eventName: 'initialized', listener: Listener): this
  once(eventName: 'initialized', listener: Listener): this
  addListener(eventName: 'initialized', listener: Listener): this
}
