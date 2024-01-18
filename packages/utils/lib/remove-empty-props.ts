export function removeEmptyProps<T = any> (body: T, preserveEmpty: boolean = false, isArray: boolean = false): T {
  const clean: any = Array.isArray(body) ? [] : {}

  for (const key in body) {
    if (typeof body[key] === 'string') {
      const trimed = String(body[key]).trim()
      if (trimed.length > 0) {
        clean[key] = trimed
      } else if (preserveEmpty && !isArray && trimed.length === 0) {
        // allow empty string to remove props when it is object property only
        clean[key] = ''
      }
    } else if (typeof body[key] === 'object' && body[key] !== null && !(body[key] instanceof Date)) {
      const keys = Object.keys(body[key] as object)
      if (keys.length > 0) {
        clean[key] = removeEmptyProps(body[key], preserveEmpty, Array.isArray(body[key]))
      } else if (preserveEmpty && keys.length === 0) {
        // allow empty array or object to remove props
        clean[key] = Array.isArray(body[key]) ? [] : {}
      }
    } else if (typeof body[key] !== 'undefined' && body[key] !== null) {
      clean[key] = body[key]
    }
  }

  return clean
}
