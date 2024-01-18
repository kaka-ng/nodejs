import * as crypto from 'crypto'

export type RandomBytesEncode = BufferEncoding | 'buffer'

export function randomBytes (size: number, encoding?: 'buffer'): Buffer
export function randomBytes (size: number, encoding: BufferEncoding): string
export function randomBytes (size: number, encoding: RandomBytesEncode = 'buffer'): string | Buffer {
  const randomBytes = crypto.randomBytes(size)
  if (encoding === 'buffer') {
    return randomBytes
  } else {
    return randomBytes.toString(encoding)
  }
}

export function randomNum (digit: number = 6): string {
  return crypto.randomInt(0, Math.pow(10, digit)).toString().padStart(digit, '0')
}

export function randomUUID (): string {
  return crypto.randomUUID()
}
