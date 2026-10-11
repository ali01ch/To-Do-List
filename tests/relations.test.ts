import { describe, expect, it } from 'vitest'
import { createFocusRepository } from '@/repositories/focusSessions'
import { createListRepository } from '@/repositories/lists'
import { createTagRepository } from '@/repositories/tags'
import { createTaskRepository } from '@/repositories/tasks'
import { openTestDatabase } from './helpers'

describe('lists and tags', () => {
  it('detaches tasks when a list is removed', async () => {
    const database = openTestDatabase()
    const lists = createListRepository(database)
    const tasks = createTaskRepository(database)
    const list = await lists.create({ name: 'خانه', color: 'clay', icon: 'book' })
    const task = await tasks.create({ title: 'آبیاری', listId: list.id })
    await lists.remove(list.id)
    expect(await lists.getById(list.id)).toBeUndefined()
    expect((await tasks.getById(task.id))?.listId).toBeNull()
  })

  it('removes tag links without deleting the task', async () => {
    const database = openTestDatabase()
    const tags = createTagRepository(database)
    const tasks = createTaskRepository(database)
    const tag = await tags.create({ name: 'فوری' })
    const task = await tasks.create({ title: 'تماس' })
    await tasks.setTags(task.id, [tag.id])
    await tags.remove(tag.id)
    expect(await tasks.tagIds(task.id)).toEqual([])
    expect(await tasks.getById(task.id)).toBeDefined()
  })

  it('rejects a duplicate tag name', async () => {
    const tags = createTagRepository(openTestDatabase())
    await tags.create({ name: 'کار' })
    await expect(tags.create({ name: '  کار  ' })).rejects.toMatchObject({ code: 'DUPLICATE_NAME' })
  })

  it('does not attach a focus session to a missing task', async () => {
    const focus = createFocusRepository(openTestDatabase())
    await expect(
      focus.create({ taskId: 'missing', startedAt: '2026-10-11T08:00:00.000Z' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
