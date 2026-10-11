import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toDataError, type DataErrorCode } from '@/domain/errors'
import { focusRepository } from '@/repositories/container'
import { useCatalogStore } from '@/stores/catalogStore'

export const useFocusStore = defineStore('focus', () => {
  const kind = ref<'focus' | 'break'>('focus')
  const focusMinutes = ref(25)
  const breakMinutes = ref(5)
  const remainingMs = ref(25 * 60 * 1000)
  const running = ref(false)
  const taskId = ref<string | null>(null)
  const error = ref<DataErrorCode | null>(null)
  let endsAt = 0
  let timer = 0
  let finishing = false

  function stopTimer(): void {
    window.clearInterval(timer)
    timer = 0
    running.value = false
  }

  function applyDurations(): void {
    if (running.value) return
    remainingMs.value = (kind.value === 'focus' ? focusMinutes.value : breakMinutes.value) * 60 * 1000
  }

  function tick(): void {
    remainingMs.value = Math.max(0, endsAt - Date.now())
    if (remainingMs.value === 0) void finish()
  }

  function start(): void {
    if (running.value || remainingMs.value <= 0) return
    endsAt = Date.now() + remainingMs.value
    running.value = true
    timer = window.setInterval(tick, 250)
  }

  function pause(): void {
    if (!running.value) return
    remainingMs.value = Math.max(0, endsAt - Date.now())
    stopTimer()
  }

  async function finish(): Promise<void> {
    if (finishing) return
    finishing = true
    const finishedKind = kind.value
    const durationMs = (finishedKind === 'focus' ? focusMinutes.value : breakMinutes.value) * 60 * 1000
    stopTimer()
    if (finishedKind === 'focus') {
      try {
        const session = await focusRepository.create({
          taskId: taskId.value,
          kind: 'focus',
          status: 'completed',
          startedAt: new Date(Date.now() - durationMs).toISOString(),
          endedAt: new Date().toISOString(),
          durationMs,
        })
        useCatalogStore().rememberSession(session)
        error.value = null
      } catch (caught) {
        error.value = toDataError(caught).code
      }
    }
    kind.value = finishedKind === 'focus' ? 'break' : 'focus'
    applyDurations()
    finishing = false
  }

  function setFocusMinutes(value: number): void {
    if (!Number.isInteger(value) || value < 1 || value > 180) return
    focusMinutes.value = value
    if (kind.value === 'focus') applyDurations()
  }

  function setBreakMinutes(value: number): void {
    if (!Number.isInteger(value) || value < 1 || value > 60) return
    breakMinutes.value = value
    if (kind.value === 'break') applyDurations()
  }

  return {
    kind,
    focusMinutes,
    breakMinutes,
    remainingMs,
    running,
    taskId,
    error,
    start,
    pause,
    finish,
    setFocusMinutes,
    setBreakMinutes,
  }
})
