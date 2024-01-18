export function isString (value: unknown): value is string {
  return typeof value === 'string'
}

export function isEmpty (value: unknown): value is string {
  return isString(value) && value.trim() === ''
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isString(value) && isString(compare) && value === compare
}
