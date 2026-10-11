import type { RoznoDatabase } from '@/db/database'
import { createDatabase } from '@/db/database'

const databases: RoznoDatabase[] = []

export function openTestDatabase(): RoznoDatabase {
  const database = createDatabase(`rozno-test-${crypto.randomUUID()}`)
  databases.push(database)
  return database
}

export async function cleanupTestDatabases(): Promise<void> {
  const pending = databases.splice(0)
  for (const database of pending) {
    database.close()
    await database.delete()
  }
}
