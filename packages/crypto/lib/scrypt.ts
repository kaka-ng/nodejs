import { randomBytes, scrypt, timingSafeEqual } from 'crypto'

export async function hash (value: string, keylen = 32, cost = 65536, blockSize = 8, parallelization = 1): Promise<string> {
  // salt is limited to at least 16 bytes long
  const salt = randomBytes(Math.min(16, keylen / 2))
  const maxmem = 128 * cost * blockSize * 2
  return await new Promise(function (resolve, reject) {
    scrypt(value, salt, Number(keylen), { cost, blockSize, parallelization, maxmem }, function (error, key) {
      /* istanbul ignore next */
      if (error !== null) reject(error)
      resolve(`$scrypt$L=${String(keylen)}$N=${String(Math.log2(cost))},r=${String(blockSize)},p=${String(parallelization)}$${salt.toString('base64url')}$${key.toString('base64url')}`)
    })
  })
}

export const REGEXP = /^\$scrypt\$L=(\d+)\$N=(\d+),r=(\d+),p=(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/

export async function compare (value: string, hashed: string): Promise<boolean> {
  const array = REGEXP.exec(hashed)
  if (array === null) throw new Error('Invalid Scrypt Hash Format.')
  const [,keylen, cost, blockSize, parallelization, salt, hash] = array
  const maxmem = 128 * Math.pow(2, Number(cost)) * Number(blockSize) * 2
  return await new Promise(function (resolve, reject) {
    scrypt(value, Buffer.from(salt, 'base64url'), Number(keylen), {
      cost: Math.pow(2, Number(cost)), blockSize: Number(blockSize), parallelization: Number(parallelization), maxmem
    }, function (error, key) {
      /* istanbul ignore next */
      if (error !== null) reject(error)
      resolve(timingSafeEqual(key, Buffer.from(hash, 'base64url')))
    })
  })
}
