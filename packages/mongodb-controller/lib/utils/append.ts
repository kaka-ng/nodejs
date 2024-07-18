import { isArray } from '@kakang/validator'
import { randomUUID } from 'crypto'
import { type Document, type UpdateFilter } from 'mongodb'
import { isUpdateQuery, retrieveUpdateQueryData } from './query'

export function appendCreateFields<TSchema extends Document = Document> (docs: TSchema): TSchema
export function appendCreateFields<TSchema extends Document = Document> (docs: TSchema[]): TSchema[]
export function appendCreateFields<TSchema extends Document = Document> (docs: TSchema | TSchema[]): TSchema[] | TSchema {
  const now = new Date()
  if (isArray(docs)) {
    return docs.map((d) => appendCreateFields(d))
  } else {
    const doc: any = { ...docs }
    doc.uid = randomUUID()
    doc.createdAt = now
    doc.updatedAt = now
    return doc
  }
}

export function appendUpdateFields<TSchema extends Document = Document> (docs: UpdateFilter<TSchema>): UpdateFilter<TSchema>
export function appendUpdateFields<TSchema extends Document = Document> (docs: Partial<TSchema>): TSchema
export function appendUpdateFields<TSchema extends Document = Document> (docs: UpdateFilter<TSchema> | Partial<TSchema>): UpdateFilter<TSchema> | TSchema {
  const now = new Date()
  const doc: Record<string, unknown> = retrieveUpdateQueryData(docs)
  // we remove uid and createdAt
  const { uid, createdAt, ...item } = doc
  item.updatedAt = now
  if (isUpdateQuery(docs)) {
    docs.$set = item as Partial<TSchema>
    return docs
  } else {
    return item
  }
}
