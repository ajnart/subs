import type { SubsBootstrap } from '../lib/bootstrap'
import { HttpError } from '../lib/validation'
import { requireAuth, status } from './auth'
import { readData, revisionTag, withDatabase } from './database'

export async function readBootstrap(request: Request): Promise<SubsBootstrap> {
  const today = new Date().toISOString().slice(0, 10)
  try {
    return await withDatabase(async (db) => {
      const currentStatus = await status(db, request)
      if (!currentStatus.authenticated && !currentStatus.authDisabled) {
        return { kind: 'locked', status: currentStatus, data: null, revision: null, error: '', today }
      }
      await requireAuth(db, request)
      return {
        kind: 'ready',
        status: currentStatus,
        data: await readData(db),
        revision: await revisionTag(db),
        error: '',
        today,
      }
    })
  } catch (cause) {
    console.error('Collection bootstrap failed', cause instanceof Error ? cause.message : 'Unknown server error')
    let error = 'The server could not load your collection. Please try again.'
    if (cause instanceof HttpError && cause.status === 503) error = 'Server is busy; try again shortly.'
    return { kind: 'error', status: null, data: null, revision: null, error, today }
  }
}
