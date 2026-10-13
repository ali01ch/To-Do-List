<script setup lang="ts">
import { computed, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import QuickAdd from '@/components/QuickAdd.vue'
import TaskStack from '@/components/TaskStack.vue'
import { fa } from '@/locales/fa'
import { tasksOnDay } from '@/services/taskQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'
import { todayDueOn } from '@/utils/dates'
import { toPersianDigits } from '@/utils/digits'
import { JALALI_MONTHS, JALALI_WEEKDAYS, buildMonthCells, jalaliPartsFromDueOn, shiftJalaliMonth } from '@/utils/jalali'

const catalog = useCatalogStore()
const view = useViewStore()
const today = todayDueOn()
if (!view.calendarDueOn) view.calendarDueOn = today
const parts = jalaliPartsFromDueOn(view.calendarDueOn ?? today)
const year = ref(parts.jy)
const month = ref(parts.jm)

const cells = computed(() => buildMonthCells(year.value, month.value))
const selected = computed(() => view.calendarDueOn ?? today)
const dayTasks = computed(() => tasksOnDay(catalog.tasks, selected.value))

function counts(dueOn: string): { open: number; done: number } {
  const tasks = tasksOnDay(catalog.tasks, dueOn)
  return {
    open: tasks.filter((task) => !task.completedAt).length,
    done: tasks.filter((task) => task.completedAt).length,
  }
}

function shift(delta: number): void {
  const next = shiftJalaliMonth(year.value, month.value, delta)
  year.value = next.jy
  month.value = next.jm
}

function choose(dueOn: string): void {
  view.calendarDueOn = dueOn
  const next = jalaliPartsFromDueOn(dueOn)
  year.value = next.jy
  month.value = next.jm
}
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.calendar.title" :description="fa.sections.calendar.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <div class="mt-5 flex items-center justify-between gap-2">
        <button type="button" class="min-h-11 rounded-xl px-3 text-sm" @click="shift(-1)">{{ fa.task.previous }}</button>
        <h2 class="text-base font-semibold">{{ JALALI_MONTHS[month - 1] }} {{ toPersianDigits(year) }}</h2>
        <button type="button" class="min-h-11 rounded-xl px-3 text-sm" @click="shift(1)">{{ fa.task.next }}</button>
      </div>
      <div class="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
        <span v-for="day in JALALI_WEEKDAYS" :key="day">{{ day }}</span>
      </div>
      <div class="mt-1 grid grid-cols-7 gap-1">
        <button
          v-for="cell in cells"
          :key="cell.dueOn"
          type="button"
          class="flex min-h-11 flex-col items-center justify-center rounded-xl text-sm"
          :class="[
            cell.dueOn === selected
              ? 'bg-accent text-accent-ink'
              : cell.inMonth
                ? 'bg-surface text-ink'
                : 'bg-surface text-muted',
            cell.dueOn === today && cell.dueOn !== selected ? 'ring-1 ring-accent' : '',
          ]"
          @click="choose(cell.dueOn)"
        >
          {{ toPersianDigits(cell.day) }}
          <span class="mt-0.5 flex h-1.5 gap-0.5" aria-hidden="true">
            <span
              v-if="counts(cell.dueOn).open"
              class="size-1.5 rounded-full"
              :class="cell.dueOn === selected ? 'bg-accent-ink' : 'bg-overdue'"
            />
            <span
              v-else-if="counts(cell.dueOn).done"
              class="size-1.5 rounded-full"
              :class="cell.dueOn === selected ? 'bg-accent-ink/80' : 'bg-accent'"
            />
          </span>
        </button>
      </div>
      <QuickAdd :preset="{ dueOn: selected }" />
      <EmptyState v-if="dayTasks.length === 0" :title="fa.empty.dayTitle" :description="fa.empty.dayBody" />
      <TaskStack v-else :tasks="dayTasks" />
    </template>
  </section>
</template>
