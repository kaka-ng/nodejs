import { pinyin } from 'pinyin-pro'

const SLUGIFY_CHINESE_REGEXP = /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/g
const SLUGIFY_UNICODE_REGEXP = /[^a-zA-Z0-9_\u3400-\u9FBF\s-]/g
const SLUGIFY_ASCII_REGEXP = /[^a-zA-Z0-9_\s-]/g

const SLUGIFY_DEFAULT_GENERATOR = function (): string {
  // simple slug
  return Math.floor(Math.random() * 10000000000000000).toString()
}

interface PinYinOption {
  toneType?: 'symbol' | 'num' | 'none'
  pattern?: 'pinyin' | 'initial' | 'final' | 'num' | 'first'
  multiple?: boolean
  mode?: 'normal' | 'surname'
  removeNonZh?: boolean
  type?: 'string'
}

export function slugify (str: string, options?: { limit?: number, unicode?: boolean, generator?: () => string, pinyin?: PinYinOption | boolean }): string {
  let { limit, unicode, generator } = Object.assign({}, options)
  let pinyinOption = options?.pinyin ?? false
  if (typeof limit !== 'number') limit = 72
  if (typeof unicode !== 'boolean') unicode = true
  if (pinyinOption === true) pinyinOption = { toneType: 'none', type: 'string' }
  if (typeof generator !== 'function') generator = SLUGIFY_DEFAULT_GENERATOR
  const regexp = unicode ? SLUGIFY_UNICODE_REGEXP : SLUGIFY_ASCII_REGEXP

  str = str.replace(/^\s+|\s+$/g, '') // trim
  str = str.toLowerCase()

  // remove invalid chars
  str = str.replace(regexp, '')
  // transform chinese to pinyin when unicode is enable
  if (unicode && typeof pinyinOption === 'object') {
    const arr = str.match(SLUGIFY_CHINESE_REGEXP) ?? []
    for (const word of arr) {
      str = str.replace(word, pinyin(word, pinyinOption) + '-')
    }
  }

  // remove accents, swap ñ for n, etc
  str = str
    .replace(/(ā|á|ǎ|à|ä|â|ã)/g, 'a')
    .replace(/(ō|ó|ǒ|ò|ö|ô)/g, 'o')
    .replace(/(ē|é|ě|è|ë|ê)/g, 'e')
    .replace(/(ī|í|ǐ|ì|ï|î)/g, 'i')
    .replace(/(ū|ú|ǔ|ù|ü|û)/g, 'u')
    .replace(/(ǖ|ǘ|ǚ|ǜ)/g, 'u')
    .replace(/(ń|ň|ǹ|ñ)/g, 'n')
    .replace(/(ç)/g, 'c')
    .replace(/(·|\/|_|,|:|;)/g, '-')

  // remove leading and trailing space
  str = str.trim()
  // collapse whitespace and replace by -
  str = str.replace(/\s+/g, '-')
  // collapse dashes
  str = str.replace(/-+/g, '-')

  // strip if it is too long
  if (str.length > limit) str = str.substr(0, limit)
  if (str.endsWith('-')) str = str.substr(0, str.length - 1)
  // if slug is empty we use generator function to create an unique slug
  if (str.length === 0) return generator()

  return str
}
