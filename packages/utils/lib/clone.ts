// perf
// obj - 34,506,144 ops/sec ±1.54%
// arr - 32,347,650 ops/sec ±0.97%
// oth - 165,792,729 ops/sec ±1.97%
export function clone<T = any> (o: T): T {
  // handle object
  if (typeof o === 'object') {
    if (o === null) return o
    if (Array.isArray(o)) return (o as never as unknown[]).map(clone) as never as T
    if (o instanceof Date) return new Date(o) as never as T
    if (o instanceof Set) {
      const ref = new Set()
      for (const i of o) {
        ref.add(clone(i))
      }
      return ref as never as T
    }
    if (o instanceof Map) {
      const ref = new Map()
      for (const [k, i] of o.entries()) {
        ref.set(k, clone(i))
      }
      return ref as never as T
    }
    const tmp: any = {}
    Object.keys(o).forEach(function (k) {
      tmp[k] = clone((o as any)[k])
    })
    return tmp
  }
  // primitive
  return o
}
