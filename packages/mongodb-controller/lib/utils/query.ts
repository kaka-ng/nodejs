import { type Document, type UpdateFilter } from 'mongodb'

const UpdateQueryKeys = new Set([
  '$currentDate',
  '$inc',
  '$min',
  '$max',
  '$mul',
  '$rename',
  '$set',
  '$setOnInsert',
  '$unset',
  '$addToSet',
  '$pop',
  '$pull',
  '$push',
  '$pushAll',
  '$bit',
])

export function isUpdateQuery <TSchema extends Document = Document> (docs: UpdateFilter<TSchema> | Partial<TSchema>): docs is UpdateFilter<TSchema> {
  for (const key of Object.keys(docs)) {
    if (UpdateQueryKeys.has(key)) return true
  }
  return false
}

export function retrieveUpdateQueryData<TSchema extends Document = Document> (docs: UpdateFilter<TSchema> | Partial<TSchema>): TSchema {
  return isUpdateQuery(docs) ? Object.assign({}, docs.$set) as TSchema : docs as TSchema
}

export function normalizeQueryData<TSchema extends Document = Document> (docs: UpdateFilter<TSchema> | Partial<TSchema>): UpdateFilter<TSchema> {
  return isUpdateQuery(docs) ? docs : { $set: docs } as any
}

export function mergeUpdateQueryData<TSchema extends Document = Document> (from: UpdateFilter<TSchema> | Partial<TSchema>, to: UpdateFilter<TSchema> | Partial<TSchema>): UpdateFilter<TSchema> | Partial<TSchema> {
  from = normalizeQueryData(from)
  to = normalizeQueryData(to)
  const data = Object.assign({}, from.$set, to.$set)
  return { ...from, ...to, $set: data }
}

// [field].[operator]
export function splitFieldOperator (field: string, operatorMap: Map<string, string>): { field?: string, operator?: string } {
  const fields = field.split('.')
  const operator = operatorMap.get(fields.pop() ?? '')

  return {
    field: fields.join('.'),
    operator,
  }
}
