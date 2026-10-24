import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'
import { readBootstrap } from '../server/bootstrap.server'

export const getSubsBootstrap = createServerFn({ method: 'GET' }).handler(async () => {
  setResponseHeader('Cache-Control', 'no-store')
  setResponseHeader('Vary', 'Cookie')
  return readBootstrap(getRequest())
})
