import { isEqual } from '../primitive/object'

export function isArray<T = any> (value: unknown): value is T[] {
  return value instanceof Array && Array.isArray(value)
}

export function isEmpty<T = any> (value: unknown): value is T[] {
  return isArray(value) && value.length === 0
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isArray(value) && isArray(compare) && isEqual(value, compare)
}
