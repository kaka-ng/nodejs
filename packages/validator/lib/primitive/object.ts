export function isObject (value: unknown): value is object {
  return typeof value === 'object'
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isObject(value) && isObject(compare) && value === compare
}

export function isKeyEqual (valueKeys: string[], compareKeys: string[]): boolean {
  // key order is not a matter
  return compareKeys.every(function (index: string) {
    return valueKeys.includes(index)
  })
}

// Referece: https://stackoverflow.com/a/16788517/139361
export function isEqual (value: unknown, compare: unknown): boolean {
  // == null is shortener of === null || === undefined
  if (value == null || compare == null) return value === compare
  // after this just checking type of one would be enough
  if ((value as any).constructor !== (compare as any).constructor) return false
  // if they are functions, they should exactly refer to same one (because of closures)
  if (value instanceof Function) return value === compare
  // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
  if (value instanceof RegExp) return value === compare
  if (value === compare || (value as any).valueOf() === (compare as any).valueOf()) return true
  if (Array.isArray(value) && Array.isArray(compare) && value.length !== compare.length) return false
  // if they are dates, they must had equal valueOf
  if (value instanceof Date) return false
  // if they are strictly equal, they both need to be object at least
  if (!isObject(value) || !isObject(compare)) return false

  const valueKeys = Object.keys(value)
  const compareKeys = Object.keys(compare)
  return (
    isKeyEqual(valueKeys, compareKeys) &&
    valueKeys.every(function (index: string) {
      return isEqual((value as any)[index], (compare as any)[index])
    })
  )
}
