import { parse } from '@lukeed/ms'
import decode from 'fast-decode-uri-component'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join, normalize, resolve, sep } from 'node:path'
import { Readable } from 'node:stream'
import { StatsLike } from './types'

export interface EngineOptions {
  stat: (path: string) => StatsLike | Promise<StatsLike>
  createReadStream: (path: string, options: { start: number, end: number }) => Readable | Promise<Readable>
}

export interface SendOptions {
  acceptRanges?: boolean
  cacheControl?: boolean
  dotfiles?: 'allow' | 'ignore' | 'deny'
  end?: number
  etag?: boolean
  extensions?: string[] | string | boolean
  immutable?: boolean
  index?: string[] | string | boolean
  lastModified?: boolean
  maxage?: string | number
  maxAge?: string | number
  root?: string
  start?: number
  engine?: EngineOptions
}

export interface NormalizedSendOptions {
  acceptRanges: boolean
  cacheControl: boolean
  dotfiles: number
  end?: number
  etag: boolean
  extensions: string[]
  immutable: boolean
  index: string[]
  lastModified: boolean
  maxage: number
  root: string | null
  start?: number
  path: string
  engine: EngineOptions
}

const VALID_DOT_FILES_ENUM = [
  'allow',
  'ignore',
  'deny'
]

const MAX_MAXAGE = 60 * 60 * 24 * 365 * 1000 // 1 year

const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/

function _boolean (option?: boolean, _default: boolean = true): boolean {
  return option !== undefined ? Boolean(option) : _default
}

function _enum (option?: string, options: string[] = [], _default: number = 1): number {
  return option !== undefined ? options.indexOf(option) : _default
}

function _array (option?: boolean | string | string[], name: string = 'option', _default: string[] = []): string[] {
  if (option === undefined) {
    return _default
  } else if (typeof option === 'string') {
    return [option]
  } else if (option === false) {
    return []
  } else if (Array.isArray(option)) {
    for (let i = 0, il = option.length; i < il; ++i) {
      if (typeof option[i] !== 'string') {
        throw new TypeError(name + ' must be array of strings or false')
      }
    }
    return option
  } else {
    throw new TypeError(name + ' must be array of strings or false')
  }
}

function _number (option?: string | number, min: number = 0, max: number = Number.POSITIVE_INFINITY): number {
  let num: number
  if (typeof option === 'string') {
    num = parse(option) as number
  } else {
    num = Number(option)
  }

  // eslint-disable-next-line no-self-compare
  if (num !== num) {
    // fast path of isNaN(number)
    return 0
  }

  return Math.min(Math.max(min, num), max)
}

export function normalizeOptions (options: SendOptions | undefined, path: string): NormalizedSendOptions {
  options ??= {}

  const acceptRanges = _boolean(options.acceptRanges, true)

  const cacheControl = _boolean(options.cacheControl, true)

  const etag = _boolean(options.etag, true)

  const dotfiles = _enum(options.dotfiles, VALID_DOT_FILES_ENUM, 1) // 'ignore'
  if (dotfiles === -1) {
    throw new TypeError('dotfiles option must be "allow", "deny", or "ignore"')
  }

  const extensions = _array(options.extensions, 'extensions option', [])

  const immutable = _boolean(options.immutable, false)

  const index = _array(options.index, 'index option', ['index.html'])

  const lastModified = _boolean(options.lastModified, true)

  const maxage = _number(options.maxAge ?? options.maxAge, 0, MAX_MAXAGE)

  const root = options.root ? resolve(options.root) : null

  const engine: EngineOptions = options.engine
    ? options.engine
    : {
        stat,
        createReadStream
      }

  return {
    acceptRanges,
    cacheControl,
    etag,
    dotfiles,
    extensions,
    immutable,
    index,
    lastModified,
    maxage,
    root,
    start: options.start,
    end: options.end,
    path,
    engine
  }
}

export function normalizePath (options: NormalizedSendOptions): { statusCode: number } | { path: string, parts: string[] } {
  // decode the path
  let path = decode(options.path)
  if (path == null) {
    return { statusCode: 400 }
  }

  // null byte(s)
  if (~path.indexOf('\0')) {
    return { statusCode: 400 }
  }

  let parts
  if (options.root !== null) {
    // normalize
    if (path) {
      path = normalize('.' + sep + path)
    }

    // malicious path
    if (UP_PATH_REGEXP.test(path)) {
      return { statusCode: 403 }
    }

    // explode path parts
    parts = path.split(sep)

    // join / normalize from optional root dir
    path = normalize(join(options.root, path))
  } else {
    // ".." is malicious without "root"
    if (UP_PATH_REGEXP.test(path)) {
      return { statusCode: 403 }
    }

    // explode path parts
    parts = normalize(path).split(sep)

    // resolve the path
    path = resolve(path)
  }

  return { path, parts }
}

export function containDotFile (parts: string[]): boolean {
  for (let i = 0, il = parts.length; i < il; ++i) {
    if (parts[i].length !== 1 && parts[i][0] === '.') {
      return true
    }
  }

  return false
}
