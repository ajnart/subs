import { Database } from 'bun:sqlite'
import { resolve } from 'node:path'

if (!process.argv.includes('--confirm')) {
  console.error('Stop Subs and back up its data directory, then run this command with --confirm to reset access.')
  process.exit(1)
}

try {
  const path = resolve(process.env.SQLITE_PATH || `${process.env.DATA_DIR || './data'}/subs.sqlite`)
  using database = new Database(path, { create: false, strict: true })
  const schema = database.query<{ value: string }, []>("SELECT value FROM meta WHERE key = 'schema_version'").get()
  if (schema?.value !== '1') throw new Error('The selected file is not a supported Subs database')
  database
    .transaction(() => {
      database.run("DELETE FROM meta WHERE key IN ('pin_hash', 'setup_token_hash')")
      database.run('DELETE FROM sessions')
      database.run('DELETE FROM rate_limits')
    })
    .immediate()
  console.info(
    'Access reset. Subscriptions and preferences are unchanged. Restart Subs and complete operator-token setup.',
  )
} catch (error) {
  console.error('Access reset failed:', error instanceof Error ? error.message : 'Unknown database error')
  process.exitCode = 1
}
