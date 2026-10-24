import { resolve } from 'node:path'
import { definePlugin } from 'nitro'
import { connectionConfigs } from '#nitro/virtual/database'

export default definePlugin(() => {
  const connection = connectionConfigs.default
  if (!connection) throw new Error('Nitro default SQLite database is not configured')
  connection.options = {
    ...connection.options,
    path: resolve(process.env.SQLITE_PATH || `${process.env.DATA_DIR || './data'}/subs.sqlite`),
  }
})
