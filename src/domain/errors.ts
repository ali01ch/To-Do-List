import Dexie from 'dexie'

export type DataErrorCode =
  | 'TITLE_REQUIRED'
  | 'NAME_REQUIRED'
  | 'NOT_FOUND'
  | 'INVALID_DATE'
  | 'INVALID_TIME'
  | 'INVALID_PRIORITY'
  | 'INVALID_RECURRENCE'
  | 'INVALID_COLOR'
  | 'INVALID_ICON'
  | 'INVALID_SESSION'
  | 'LIST_NOT_FOUND'
  | 'TAG_NOT_FOUND'
  | 'DUPLICATE_NAME'
  | 'QUOTA'
  | 'VERSION'
  | 'UNKNOWN'

export class DataError extends Error {
  readonly code: DataErrorCode

  constructor(code: DataErrorCode, options?: ErrorOptions) {
    super(code, options)
    this.name = 'DataError'
    this.code = code
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function innerError(error: unknown): unknown {
  if (!error || typeof error !== 'object' || !('inner' in error)) return error
  return (error as { inner?: unknown }).inner
}

export function toDataError(error: unknown): DataError {
  const inner = innerError(error)
  if (error instanceof DataError) return error
  if (inner instanceof DataError) return inner
  if (error instanceof Dexie.QuotaExceededError || inner instanceof Dexie.QuotaExceededError) {
    return new DataError('QUOTA', { cause: error })
  }
  if (error instanceof Dexie.VersionError || inner instanceof Dexie.VersionError) {
    return new DataError('VERSION', { cause: error })
  }
  return new DataError('UNKNOWN', { cause: error })
}

export async function guard<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error) {
    throw toDataError(error)
  }
}
