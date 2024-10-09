import { sql } from 'drizzle-orm'
import { index, int, sqliteTableCreator, text } from 'drizzle-orm/sqlite-core'

export const createTable = sqliteTableCreator((name) => `subs_${name}`)

export const kvStore = createTable(
  'kv_store',
  {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    updatedAt: int('updated_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    keyIndex: index('key_idx').on(table.key),
  }),
)
