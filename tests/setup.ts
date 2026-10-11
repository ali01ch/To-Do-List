import { afterEach } from 'vitest'
import { cleanupTestDatabases } from './helpers'

afterEach(async () => {
  await cleanupTestDatabases()
})
