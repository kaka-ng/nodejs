export function isSymbol (value: unknown): value is symbol {
  return typeof value === 'symbol'
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isSymbol(value) && isSymbol(compare) && value === compare
}
