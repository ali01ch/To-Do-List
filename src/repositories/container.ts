import { db } from '@/db/database'
import { createFocusRepository } from '@/repositories/focusSessions'
import { createListRepository } from '@/repositories/lists'
import { createProjectRepository } from '@/repositories/projects'
import { createProjectTaskRepository } from '@/repositories/projectTasks'
import { createSettingsRepository } from '@/repositories/settings'
import { createTagRepository } from '@/repositories/tags'
import { createTaskRepository } from '@/repositories/tasks'

export const taskRepository = createTaskRepository(db)
export const listRepository = createListRepository(db)
export const tagRepository = createTagRepository(db)
export const settingsRepository = createSettingsRepository(db)
export const focusRepository = createFocusRepository(db)
export const projectRepository = createProjectRepository(db)
export const projectTaskRepository = createProjectTaskRepository(db)
