export const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
export const URLCHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_ '

export type Base64Charset = 'default' | 'url' | 'custom'

export function encodeReplaceCharset (
  value: string,
  charset: Base64Charset = 'default',
  custom: string = URLCHARSET
): string {
  if (charset === 'default') return value
  const replaced = []
  for (let i = value.length - 1; i >= 0; i--) {
    const char = value.charAt(i)
    const indexOf = CHARSET.indexOf(char)
    replaced.push(custom.charAt(indexOf))
  }
  return replaced
    .reverse()
    .join('')
    .trim()
}

export function encode (
  value: string | Buffer | Uint8Array,
  charset: Base64Charset = 'default',
  custom: string = URLCHARSET
): string {
  // Cast Uint8Array to Buffer
  if (value instanceof Uint8Array) {
    value = Buffer.from(value)
  }
  // Allocate Buffer
  value = Buffer.alloc(value.length, value as Buffer | string)
  return encodeReplaceCharset(value.toString('base64'), charset, custom)
}

export function decodeReplaceCharset (
  value: string,
  charset: Base64Charset = 'default',
  custom: string = URLCHARSET
): string {
  if (charset === 'default') return value
  let replaced: string[] | string = []
  for (let i = value.length - 1; i >= 0; i--) {
    const char = value[i]
    const indexOf = custom.indexOf(char)
    replaced.push(CHARSET[indexOf])
  }
  replaced = replaced.reverse().join('')
  while (replaced.length % 4 > 0) {
    replaced += '='
  }
  return replaced
}

export function decode (value: string, charset: Base64Charset = 'default', custom: string = URLCHARSET): string {
  const val = Buffer.from(decodeReplaceCharset(value, charset, custom), 'base64')
  return val.toString('utf8')
}
