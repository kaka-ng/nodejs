import { isEmpty as isEmptyArray } from '../class/array'
import { isEmpty as isEmptyJSON } from '../class/json'
import { isNull } from '../primitive/null'
import { isEmpty as isEmptyString } from '../primitive/string'
import { isUndefined } from '../primitive/undefined'

export type Empty = undefined | null | '' | Record<string, never> | []

export function isEmpty (value: unknown): value is Empty {
  return isUndefined(value) || isNull(value) || isEmptyString(value) || isEmptyJSON(value) || isEmptyArray(value)
}

export function isExist<T> (value: T): value is NonNullable<T> {
  return !isEmpty(value)
}
