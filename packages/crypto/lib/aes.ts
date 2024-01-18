import { createCipheriv, createDecipheriv, scryptSync, type BinaryLike, type CipherCCMTypes, type CipherGCM, type CipherGCMTypes, type DecipherGCM } from 'crypto'
import { randomBytes } from './utils'

export function computeKeySize (algorithm: CipherCCMTypes | CipherGCMTypes = 'aes-256-gcm'): number {
  switch (algorithm) {
    case 'aes-128-ccm':
    case 'aes-128-gcm':
      return 16
    case 'aes-192-ccm':
    case 'aes-192-gcm':
      return 24
    case 'aes-256-ccm':
    case 'aes-256-gcm':
    case 'chacha20-poly1305':
    default:
      return 32
  }
}

export function computeIVSize (algorithm: CipherCCMTypes | CipherGCMTypes = 'aes-256-gcm'): number {
  switch (algorithm) {
    case 'chacha20-poly1305':
      return 12
    case 'aes-128-ccm':
    case 'aes-128-gcm':
    case 'aes-192-ccm':
    case 'aes-192-gcm':
    case 'aes-256-ccm':
    case 'aes-256-gcm':
    default:
      return 16
  }
}

export interface EncryptionResult {
  value: string
  iv: string
  authTag: string
  secret: BinaryLike
  salt: BinaryLike
}

export function encrypt (
  token: string,
  algorithm: CipherCCMTypes | CipherGCMTypes = 'aes-256-gcm',
  secret: BinaryLike = randomBytes(32, 'hex'),
  salt: BinaryLike = randomBytes(32, 'hex'),
  authTagLength = 16
): EncryptionResult {
  const key: Buffer = scryptSync(secret, salt, computeKeySize(algorithm))
  const ivSize = computeIVSize(algorithm)
  const iv: Buffer = Buffer.alloc(ivSize, randomBytes(ivSize), 'binary')
  const option: any = [algorithm, key, iv, { authTagLength }]
  const cipher: CipherGCM = createCipheriv.apply(createCipheriv, option) as CipherGCM
  cipher.setAAD(Buffer.from(`${String(secret)}${String(salt)}`))

  let value = cipher.update(token, 'utf8', 'hex')
  value += cipher.final('hex')
  return {
    value,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
    secret,
    salt
  }
}

export function decrypt (
  encrypted: string,
  iv: Buffer,
  authTag: Buffer,
  algorithm: CipherCCMTypes | CipherGCMTypes,
  secret: BinaryLike,
  salt: BinaryLike,
  authTagLength = 16
): string {
  const key: Buffer = scryptSync(secret, salt, computeKeySize(algorithm))
  const option: any = [algorithm, key, iv, { authTagLength }]
  const decipher = createDecipheriv.apply(createDecipheriv, option) as DecipherGCM
  decipher.setAAD(Buffer.from(`${String(secret)}${String(salt)}`))
  decipher.setAuthTag(authTag)

  let value = decipher.update(encrypted, 'hex', 'utf8')
  value += decipher.final('utf8')
  return value
}
