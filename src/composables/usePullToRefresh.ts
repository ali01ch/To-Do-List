import { nextTick, onMounted, onUnmounted, ref, type Ref } from 'vue'

export function usePullToRefresh(
  scrollEl: Ref<HTMLElement | null>,
  onRefresh: () => Promise<void>,
  threshold = 64,
) {
  const pullDistance = ref(0)
  const refreshing = ref(false)
  let startY = 0
  let tracking = false
  let attached: HTMLElement | null = null

  function onTouchStart(event: TouchEvent): void {
    const el = scrollEl.value
    if (!el || refreshing.value || el.scrollTop > 0) return
    startY = event.touches[0]?.clientY ?? 0
    tracking = true
  }

  function onTouchMove(event: TouchEvent): void {
    if (!tracking || refreshing.value) return
    const el = scrollEl.value
    if (!el || el.scrollTop > 0) {
      pullDistance.value = 0
      tracking = false
      return
    }
    const currentY = event.touches[0]?.clientY ?? startY
    const delta = currentY - startY
    if (delta <= 0) {
      pullDistance.value = 0
      return
    }
    pullDistance.value = Math.min(delta * 0.4, 88)
    if (pullDistance.value > 10) event.preventDefault()
  }

  async function onTouchEnd(): Promise<void> {
    if (!tracking) return
    tracking = false
    if (refreshing.value) return
    if (pullDistance.value < threshold) {
      pullDistance.value = 0
      return
    }
    refreshing.value = true
    pullDistance.value = 52
    try {
      await onRefresh()
    } finally {
      refreshing.value = false
      pullDistance.value = 0
    }
  }

  onMounted(async () => {
    await nextTick()
    const el = scrollEl.value
    if (!el) return
    attached = el
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
  })

  onUnmounted(() => {
    if (!attached) return
    attached.removeEventListener('touchstart', onTouchStart)
    attached.removeEventListener('touchmove', onTouchMove)
    attached.removeEventListener('touchend', onTouchEnd)
    attached.removeEventListener('touchcancel', onTouchEnd)
    attached = null
  })

  return { pullDistance, refreshing }
}
