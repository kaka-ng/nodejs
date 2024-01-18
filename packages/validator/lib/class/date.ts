import { isString } from '../primitive/string'

export function isDate (value: unknown): value is Date {
  return value instanceof Date
}

export function isISO8601Date (value: unknown): value is string {
  const regexp = /^^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(([-+](\d{2}):(\d{2})|[-+](\d{4})|Z)?)$$/
  return isString(value) && regexp.test(value)
}

export function isDateString (value: unknown, seperator: string = '-'): value is string {
  const regexp = new RegExp(`^(?!0{4}${seperator}0{2}${seperator}0{2})((?=[0-9]{4}${seperator}(((0[^2])|1[0-2])|02(?=${seperator}(([0-1][0-9])|2[0-8])))${seperator}[0-9]{2})|(?=((([13579][26])|([2468][048])|(0[48]))0{2})|([0-9]{2}((((0|[2468])[48])|[2468][048])|([13579][26])))${seperator}02${seperator}29))([0-9]{4})${seperator}(?!((0[469])|11)${seperator}31)((0[1,3-9]|1[0-2])|(02(?!${seperator}3)))${seperator}([0-2][0-9]|3[0-1])$`)
  return isString(value) && regexp.test(value)
}

export function isIdentical (value: unknown, compare: unknown): boolean {
  return isDate(value) && isDate(compare) && value.valueOf() === compare.valueOf()
}
