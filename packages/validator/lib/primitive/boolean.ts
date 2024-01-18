export function isBoolean (value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isTrue (value: unknown): value is true {
  return isBoolean(value) && value
}

export function maybeTrue (value: unknown): value is true {
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  if (typeof value === 'boolean') return isTrue(value)
  return false
}

export function isFalse (value: unknown): value is false {
  return isBoolean(value) && !value
}

export function maybeFalse (value: unknown): value is false {
  if (typeof value === 'number') return value === 0
  if (typeof value === 'string') return value.toLowerCase() === 'false'
  if (typeof value === 'boolean') return isFalse(value)
  return false
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isBoolean(value) && isBoolean(compare) && value === compare
}
