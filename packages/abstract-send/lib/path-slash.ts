export function hasTrailingSlash (path: string): boolean {
  return path[path.length - 1] === '/'
}

export function collapseLeadingSlashes (str: string) {
  if (
    str[0] !== '/' ||
    str[1] !== '/'
  ) {
    return str
  }
  for (let i = 2, il = str.length; i < il; ++i) {
    if (str[i] !== '/') {
      return str.slice(i - 1)
    }
  }
  /* c8 ignore next */
}
