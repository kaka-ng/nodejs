export const operatorMap = new Map()
operatorMap.set('eq', '$eq')
operatorMap.set('in', '$in')
operatorMap.set('ne', '$ne')
operatorMap.set('gt', '$gt')
operatorMap.set('gte', '$gte')
operatorMap.set('lt', '$lt')
operatorMap.set('lte', '$lte')

export function buildOperatorMap () {
  const map = new Map()
  for (const [key, value] of operatorMap) {
    map.set(key, value)
  }
  return map
}
