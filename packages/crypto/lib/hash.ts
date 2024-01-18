import { createHash, type BinaryLike, type BinaryToTextEncoding } from 'crypto'

export function hash (
  value: BinaryLike,
  encoding: BinaryToTextEncoding = 'hex',
  algorithm = 'sha512'
): string {
  const hash = createHash(algorithm)
  hash.update(value)
  return hash.digest(encoding)
}

export function md5 (value: string, encoding: BinaryToTextEncoding = 'hex'): string {
  return hash(value, encoding, 'md5')
}

export function sha1 (value: string, encoding: BinaryToTextEncoding = 'hex'): string {
  return hash(value, encoding, 'sha1')
}

export function sha224 (value: string, encoding: BinaryToTextEncoding = 'hex'): string {
  return hash(value, encoding, 'sha224')
}

export function sha256 (value: string, encoding: BinaryToTextEncoding = 'hex'): string {
  return hash(value, encoding, 'sha256')
}

export function sha384 (value: string, encoding: BinaryToTextEncoding = 'hex'): string {
  return hash(value, encoding, 'sha384')
}

export function sha512 (value: string, encoding: BinaryToTextEncoding = 'hex'): string {
  return hash(value, encoding, 'sha512')
}

export function shake128 (value: string, encoding: BinaryToTextEncoding = 'hex'): string {
  return hash(value, encoding, 'shake128')
}

export function shake256 (value: string, encoding: BinaryToTextEncoding = 'hex'): string {
  return hash(value, encoding, 'shake256')
}
