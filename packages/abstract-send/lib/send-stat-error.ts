import { sendError } from './send-error'

export function sendStatError (err: Error & { code?: string }) {
  // POSIX throws ENAMETOOLONG and ENOTDIR, Windows only ENOENT
  /* c8 ignore start */
  switch (err.code) {
    case 'ENAMETOOLONG':
    case 'ENOTDIR':
    case 'ENOENT':
      return sendError(404, err)
    default:
      return sendError(500, err)
  }
  /* c8 ignore stop */
}
