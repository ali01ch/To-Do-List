<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { fa } from '@/locales/fa'
import { addDays, formatJalaliDate, todayDueOn } from '@/utils/dates'
import { toPersianDigits } from '@/utils/digits'
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  buildMonthCells,
  jalaliPartsFromDueOn,
  shiftJalaliMonth,
} from '@/utils/jalali'

const model = defineModel<string | null>({ default: null })

const open = ref(false)
const today = todayDueOn()
const seed = model.value ?? today
const seedParts = jalaliPartsFromDueOn(seed)
const year = ref(seedParts.jy)
const month = ref(seedParts.jm)

const cells = computed(() => buildMonthCells(year.value, month.value))
const label = computed(() => (model.value ? formatJalaliDate(model.value) : fa.task.duePlaceholder))

watch(model, (value) => {
  if (!value) return
  const parts = jalaliPartsFromDueOn(value)
  year.value = parts.jy
  month.value = parts.jm
})

function shift(delta: number): void {
  const next = shiftJalaliMonth(year.value, month.value, delta)
  year.value = next.jy
  month.value = next.jm
}

function choose(dueOn: string): void {
  model.value = dueOn
  open.value = false
}

function clearDate(): void {
  model.value = null
  open.value = false
}

function setToday(): void {
  model.value = todayDueOn()
  open.value = false
}

function setTomorrow(): void {
  model.value = addDays(todayDueOn(), 1)
  open.value = false
}
</script>

<template>
  <div>
    <button
      id="task-due"
      type="button"
      class="mt-1 flex min-h-11 w-full items-center justify-between rounded-xl border border-line bg-canvas px-3 text-start text-sm"
      :class="model ? 'text-ink' : 'text-muted'"
      :aria-expanded="open"
      :aria-controls="'jalali-date-picker-panel'"
      @click="open = !open"
    >
      <span>{{ label }}</span>
      <span class="text-xs text-muted">{{ open ? fa.task.close : fa.task.pickDate }}</span>
    </button>

    <div v-if="open" id="jalali-date-picker-panel" class="mt-2 rounded-2xl border border-line bg-surface p-3">
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="min-h-9 rounded-full border border-line px-3 text-xs"
          :class="model === null ? 'border-accent bg-accent-soft text-accent' : 'text-muted'"
          @click="clearDate"
        >
          {{ fa.task.clearDue }}
        </button>
        <button
          type="button"
          class="min-h-9 rounded-full border border-line px-3 text-xs"
          :class="model === today ? 'border-accent bg-accent-soft text-accent' : 'text-muted'"
          @click="setToday"
        >
          {{ fa.nav.today }}
        </button>
        <button
          type="button"
          class="min-h-9 rounded-full border border-line px-3 text-xs"
          :class="model === addDays(today, 1) ? 'border-accent bg-accent-soft text-accent' : 'text-muted'"
          @click="setTomorrow"
        >
          {{ fa.task.tomorrow }}
        </button>
      </div>

      <div class="mt-3 flex items-center justify-between gap-2">
        <button type="button" class="grid size-10 place-items-center rounded-xl text-muted" :aria-label="fa.task.previous" @click="shift(-1)">
          <ChevronRight :size="18" :stroke-width="1.75" aria-hidden="true" />
        </button>
        <p class="text-sm font-medium">{{ JALALI_MONTHS[month - 1] }} {{ toPersianDigits(year) }}</p>
        <button type="button" class="grid size-10 place-items-center rounded-xl text-muted" :aria-label="fa.task.next" @click="shift(1)">
          <ChevronLeft :size="18" :stroke-width="1.75" aria-hidden="true" />
        </button>
      </div>

      <div class="mt-2 grid grid-cols-7 gap-1 text-center text-[0.7rem] text-muted">
        <span v-for="day in JALALI_WEEKDAYS" :key="day">{{ day }}</span>
      </div>
      <div class="mt-1 grid grid-cols-7 gap-1">
        <button
          v-for="cell in cells"
          :key="cell.dueOn"
          type="button"
          class="grid min-h-10 place-items-center rounded-xl text-sm transition-colors"
          :class="[
            cell.dueOn === model
              ? 'bg-accent font-medium text-accent-ink'
              : cell.inMonth
                ? 'bg-canvas text-ink hover:bg-accent-soft'
                : 'bg-canvas/50 text-muted',
            cell.dueOn === today && cell.dueOn !== model ? 'ring-1 ring-accent' : '',
          ]"
          @click="choose(cell.dueOn)"
        >
          {{ toPersianDigits(cell.day) }}
        </button>
      </div>
    </div>
  </div>
</template>
