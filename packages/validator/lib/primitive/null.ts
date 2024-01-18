export function isNull (value: unknown): value is null {
  return value === null
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isNull(value) && isNull(compare) && value === compare
}
