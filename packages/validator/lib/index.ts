import { isArray } from './class/array'
import { isDate } from './class/date'
import { isJSON } from './class/json'
import { isBigInt } from './primitive/bigint'
import { isBoolean } from './primitive/boolean'
import { isNull } from './primitive/null'
import { isNumber } from './primitive/number'
import { isObject } from './primitive/object'
import { isString } from './primitive/string'
import { isSymbol } from './primitive/symbol'
import { isUndefined } from './primitive/undefined'
import { isEmail } from './util/email'
import { isEmpty, isExist } from './util/empty'

export * as Array from './class/array'
export * as Date from './class/date'
export * as JSON from './class/json'
export * as BigInt from './primitive/bigint'
export * as Boolean from './primitive/boolean'
export * as Null from './primitive/null'
export * as Number from './primitive/number'
export * as Object from './primitive/object'
export * as String from './primitive/string'
export * as Symbol from './primitive/symbol'
export * as Undefined from './primitive/undefined'
export * as Email from './util/email'
export {
  isBigInt,
  isBoolean,
  isNull,
  isNumber,
  isObject,
  isString,
  isSymbol,
  isUndefined,
  isArray,
  isDate,
  isJSON,
  isEmpty,
  isExist,
  isEmail
}
