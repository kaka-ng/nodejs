export function isNumber (value: unknown): value is number {
  return typeof value === 'number'
}

export function isNaN (value: unknown): boolean {
  return !isNumber(value)
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isNumber(value) && isNumber(compare) && value === compare
}

export function isBetween (value: unknown, min: unknown, max: unknown): boolean {
  if (isNumber(value) && isNumber(min) && isNumber(max)) {
    return min <= value && value <= max
  } else {
    return false
  }
}
