import createError from 'http-errors'
import { Readable } from 'stream'
import { createHtmlDocument } from './html'
import { ErrorSendResult } from './types'

export type ErrorOrHeaders = Error | {
  headers: {
    [key: string]: string | number
  }
}

const ERROR_RESPONSES = {
  400: createHtmlDocument('Error', 'Bad Request'),
  403: createHtmlDocument('Error', 'Forbidden'),
  404: createHtmlDocument('Error', 'Not Found'),
  412: createHtmlDocument('Error', 'Precondition Failed'),
  416: createHtmlDocument('Error', 'Range Not Satisfiable'),
  500: createHtmlDocument('Error', 'Internal Server Error')
}

function createHttpError (statusCode: number, err?: ErrorOrHeaders) {
  if (!err) {
    return createError(statusCode)
  }

  return err instanceof Error
    ? createError(statusCode, err, { expose: false })
    : createError(statusCode, err)
}

export function sendError (statusCode: number, err?: ErrorOrHeaders): ErrorSendResult {
  const headers: { [key: string]: string | number } = {}

  // add error headers
  if (err && 'headers' in err) {
    for (const headerName in err.headers) {
      headers[headerName] = err.headers[headerName]
    }
  }

  const doc = ERROR_RESPONSES[statusCode as keyof typeof ERROR_RESPONSES]

  // basic response
  headers['Content-Type'] = 'text/html; charset=UTF-8'
  headers['Content-Length'] = doc[1]
  headers['Content-Security-Policy'] = "default-src 'none'"
  headers['X-Content-Type-Options'] = 'nosniff'

  return {
    statusCode,
    headers,
    stream: Readable.from(doc[0]),
    // metadata
    type: 'error',
    metadata: { error: createHttpError(statusCode, err) }
  }
}
