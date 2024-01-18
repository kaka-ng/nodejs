export function isUndefined (value: unknown): value is undefined {
  return typeof value === 'undefined'
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isUndefined(value) && isUndefined(compare) && value === compare
}
