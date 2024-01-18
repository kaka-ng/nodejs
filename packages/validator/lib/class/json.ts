import { isNull } from '../primitive/null'
import { isEqual } from '../primitive/object'
import { isUndefined } from '../primitive/undefined'

export function isJSON<T> (value: unknown): value is T {
  try {
    const result = JSON.parse(JSON.stringify(value))
    // array can be parsed by json but it is not a json
    if (Array.isArray(result)) return false
    if (value === null) return false
    return true
  } catch (err) {
    return false
  }
}

export function isEmpty<T> (value: any): value is T {
  // undefined and null is empty JSON
  if (isUndefined(value) || isNull(value)) return true
  return isJSON(value) && JSON.stringify(value) === JSON.stringify({})
}

export function isIdentical (value: any, compare: any): boolean {
  return isEqual(value, compare)
}
