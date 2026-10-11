import type { RoznoDatabase } from '@/db/database'
import { DataError, guard } from '@/domain/errors'
import type { NewTag, Tag, TagPatch } from '@/domain/types'
import { buildTag, mergeTag, sameName } from '@/domain/validation'

export function createTagRepository(database: RoznoDatabase) {
  return {
    async list(): Promise<Tag[]> {
      return guard(async () => {
        const rows = await database.tags.toArray()
        return rows.sort((a, b) => a.name.localeCompare(b.name, 'fa'))
      })
    },

    async getById(id: string): Promise<Tag | undefined> {
      return guard(() => database.tags.get(id))
    },

    async create(input: NewTag): Promise<Tag> {
      return guard(() =>
        database.transaction('rw', database.tags, async () => {
          const tag = buildTag(input)
          const existing = await database.tags.toArray()
          if (existing.some((item) => sameName(item.name, tag.name))) throw new DataError('DUPLICATE_NAME')
          await database.tags.add(tag)
          return tag
        }),
      )
    },

    async update(id: string, patch: TagPatch): Promise<Tag> {
      return guard(() =>
        database.transaction('rw', database.tags, async () => {
          const current = await database.tags.get(id)
          if (!current) throw new DataError('NOT_FOUND')
          const next = mergeTag(current, patch)
          const existing = await database.tags.toArray()
          if (existing.some((item) => item.id !== id && sameName(item.name, next.name))) {
            throw new DataError('DUPLICATE_NAME')
          }
          await database.tags.put(next)
          return next
        }),
      )
    },

    /** Removes the tag and its links. Tasks stay. */
    async remove(id: string): Promise<void> {
      return guard(() =>
        database.transaction('rw', database.tags, database.taskTags, async () => {
          const existing = await database.tags.get(id)
          if (!existing) throw new DataError('NOT_FOUND')
          await database.taskTags.where('tagId').equals(id).delete()
          await database.tags.delete(id)
        }),
      )
    },
  }
}

export type TagRepository = ReturnType<typeof createTagRepository>
