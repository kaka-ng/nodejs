import type MIME from 'mime'

export function isUtf8MimeType (value: string): boolean {
  const len = value.length
  return (
    (len > 21 && value.indexOf('application/javascript') === 0) ||
    (len > 14 && value.indexOf('application/json') === 0) ||
    (len > 5 && value.indexOf('text/') === 0)
  )
}

export const proto = {
  mime: null as never as typeof MIME,
  defaultType: 'application/octet-stream'
}

type CustomImport = <R = any>(name: string) => Promise<{ default: R }>
// eslint-disable-next-line no-new-func
const _import = new Function('modulePath', 'return import(modulePath)') as CustomImport

export async function loadMIME (): Promise<typeof MIME> {
  proto.mime ??= (await _import<typeof MIME>('mime')).default
  return proto.mime
}

export async function getType (path: string): Promise<string | null> {
  return loadMIME().then((mime) => mime.getType(path))
}

export async function getExtension (type: string): Promise<string | null> {
  return loadMIME().then((mime) => mime.getExtension(type))
}

export async function getAllExtensions (type: string): Promise<string[] | Set<string> | null> {
  return loadMIME().then((mime) => mime.getAllExtensions(type))
}

export async function define (typeMap: { [key: string]: string[] }, force: boolean = false): Promise<typeof MIME> {
  return loadMIME().then((mime) => mime.define(typeMap, force))
}

export function getDefaultType () {
  return proto.defaultType
}

export function setDefaultType (type: string) {
  proto.defaultType = type
}

// since we use mime@4, we need to map the function to async
const mime = {
  define,
  getType,
  getExtension,
  getAllExtensions
}
// compatible to mime@2
Object.defineProperties(mime, {
  default_type: {
    get () {
      return getDefaultType()
    },
    set (type: string) {
      setDefaultType(type)
    }
  }
})

export { mime }
