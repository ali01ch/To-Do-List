import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Priority } from '@/domain/types'
import type { CompletedRange, TaskSort } from '@/services/taskQuery'

export const useViewStore = defineStore('views', () => {
  const search = ref('')
  const status = ref<'active' | 'completed' | 'all'>('active')
  const priority = ref<Priority | 'any'>('any')
  const listId = ref<string | 'any'>('any')
  const due = ref<'any' | 'overdue' | 'today' | 'upcoming' | 'none'>('any')
  const tagIds = ref<string[]>([])
  const sort = ref<TaskSort>('manual')
  const completedRange = ref<CompletedRange>('all')
  const calendarDueOn = ref<string | null>(null)
  const showArchivedLists = ref(false)
  const includeCompletedInList = ref(false)

  function toggleTag(tagId: string): void {
    tagIds.value = tagIds.value.includes(tagId) ? tagIds.value.filter((id) => id !== tagId) : [...tagIds.value, tagId]
  }

  return {
    search,
    status,
    priority,
    listId,
    due,
    tagIds,
    sort,
    completedRange,
    calendarDueOn,
    showArchivedLists,
    includeCompletedInList,
    toggleTag,
  }
})
