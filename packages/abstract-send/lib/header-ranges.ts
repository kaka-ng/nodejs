import { IncomingMessage } from 'node:http'
import { Headers } from './types'

export function isRangeFresh (request: IncomingMessage, headers: Headers): boolean {
  if (!('if-range' in request.headers)) {
    return true
  }

  const ifRange = request.headers['if-range'] as string

  // if-range as etag
  if (ifRange.indexOf('"') !== -1) {
    const etag = headers.ETag as string
    return (etag && ifRange.indexOf(etag) !== -1) || false
  }

  const ifRangeTimestamp = Date.parse(ifRange)
  // eslint-disable-next-line no-self-compare
  if (ifRangeTimestamp !== ifRangeTimestamp) { // fast path of isNaN(number)
    return false
  }

  // if-range as modified date
  const lastModified = Date.parse(headers['Last-Modified'] as string)

  return (
    // eslint-disable-next-line no-self-compare
    lastModified !== lastModified || // fast path of isNaN(number)
    lastModified <= ifRangeTimestamp
  )
}

export function parseBytesRange (size: number, str: string) {
  // split the range string
  const values = str.slice(str.indexOf('=') + 1)
  const ranges: Array<{ start: number, end: number, index: number }> = []

  const len = values.length
  let i = 0
  let il = 0
  let j = 0
  let start
  let end
  let commaIdx = values.indexOf(',')
  let dashIdx = values.indexOf('-')
  let prevIdx = -1

  // parse all ranges
  while (true) {
    commaIdx === -1 && (commaIdx = len)
    start = parseInt(values.slice(prevIdx + 1, dashIdx), 10)
    end = parseInt(values.slice(dashIdx + 1, commaIdx), 10)

    // -nnn
    // eslint-disable-next-line no-self-compare
    if (start !== start) { // fast path of isNaN(number)
      start = size - end
      end = size - 1
      // nnn-
    // eslint-disable-next-line no-self-compare
    } else if (end !== end) { // fast path of isNaN(number)
      end = size - 1
      // limit last-byte-pos to current length
    } else if (end > size - 1) {
      end = size - 1
    }

    // add range only on valid ranges
    if (
      // eslint-disable-next-line no-self-compare
      start === start && // fast path of isNaN(number)
      // eslint-disable-next-line no-self-compare
      end === end && // fast path of isNaN(number)
      start > -1 &&
      start <= end
    ) {
      // add range
      ranges.push({
        start,
        end,
        index: j++
      })
    }

    if (commaIdx === len) {
      break
    }
    prevIdx = commaIdx++
    dashIdx = values.indexOf('-', commaIdx)
    commaIdx = values.indexOf(',', commaIdx)
  }

  // unsatisfiable
  if (
    j < 2
  ) {
    return ranges
  }

  ranges.sort(sortByRangeStart)

  il = j
  j = 0
  i = 1
  while (i < il) {
    const range = ranges[i++]
    const current = ranges[j]

    if (range.start > current.end + 1) {
      // next range
      ranges[++j] = range
    } else if (range.end > current.end) {
      // extend range
      current.end = range.end
      current.index > range.index && (current.index = range.index)
    }
  }

  // trim ordered array
  ranges.length = j + 1

  // generate combined range
  ranges.sort(sortByRangeIndex)

  return ranges
}

function sortByRangeIndex (a: { start: number, end: number, index: number }, b: { start: number, end: number, index: number }) {
  return a.index - b.index
}

function sortByRangeStart (a: { start: number, end: number, index: number }, b: { start: number, end: number, index: number }) {
  return a.start - b.start
}

export function contentRange (type: string, size: number, range?: { start: number, end: number, index: number }): string {
  return type + ' ' + (range ? range.start + '-' + range.end : '*') + '/' + size
}
