import { onMounted, onUnmounted, ref } from 'vue'

type UpdateSW = (reloadPage?: boolean) => Promise<void>

const CHECK_INTERVAL_MS = 5 * 60 * 1000
const SW_RECOVERY_KEY = 'rozno-sw-recovery'

let updateSW: UpdateSW | null = null
let registration: ServiceWorkerRegistration | null = null
let started = false

const needRefresh = ref(false)
const offlineReady = ref(false)

async function unregisterBrokenServiceWorkers(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    if (regs.length === 0) return false
    await Promise.all(regs.map((reg) => reg.unregister()))
    return true
  } catch {
    return false
  }
}

async function recoverServiceWorkerOnce(): Promise<void> {
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SW_RECOVERY_KEY)) return
  const removed = await unregisterBrokenServiceWorkers()
  if (!removed) return
  try {
    sessionStorage.setItem(SW_RECOVERY_KEY, '1')
  } catch {
    /* sessionStorage blocked */
  }
  window.location.reload()
}

async function ensureRegistered(): Promise<void> {
  if (!import.meta.env.PROD || started) return
  started = true
  if (!('serviceWorker' in navigator)) return

  await new Promise<void>((resolve) => {
    if (document.readyState === 'complete') resolve()
    else window.addEventListener('load', () => resolve(), { once: true })
  })

  const { registerSW } = await import('virtual:pwa-register')

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      needRefresh.value = true
    },
    onOfflineReady() {
      offlineReady.value = true
    },
    onRegisteredSW(_swUrl, reg) {
      registration = reg ?? null
      void reg?.update()
    },
    onRegisterError(error) {
      console.error('service worker registration failed', error)
      void recoverServiceWorkerOnce()
    },
  })
}

export async function checkForAppUpdate(): Promise<'reloading' | 'current' | 'unavailable'> {
  await ensureRegistered()
  if (!('serviceWorker' in navigator)) return 'unavailable'

  const reg = registration ?? (await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL)) ?? null
  registration = reg
  if (!reg) return 'unavailable'

  try {
    await reg.update()
  } catch {
    return 'unavailable'
  }

  const waiting = reg.waiting
  if (waiting) {
    needRefresh.value = false
    waiting.postMessage({ type: 'SKIP_WAITING' })
    await new Promise<void>((resolve) => {
      const onChange = () => {
        navigator.serviceWorker.removeEventListener('controllerchange', onChange)
        resolve()
      }
      navigator.serviceWorker.addEventListener('controllerchange', onChange)
      window.setTimeout(resolve, 1500)
    })
    window.location.reload()
    return 'reloading'
  }

  // autoUpdate path: activate via plugin helper if a refresh was flagged
  if (needRefresh.value && updateSW) {
    needRefresh.value = false
    await updateSW(true)
    return 'reloading'
  }

  return 'current'
}

export function usePwaUpdate() {
  let intervalId = 0

  function onVisible(): void {
    if (document.visibilityState === 'visible') void checkForAppUpdate()
  }

  onMounted(() => {
    void ensureRegistered().then(() => {
      intervalId = window.setInterval(() => {
        void registration?.update()
      }, CHECK_INTERVAL_MS)
      document.addEventListener('visibilitychange', onVisible)
      window.addEventListener('focus', onVisible)
    })
  })

  onUnmounted(() => {
    window.clearInterval(intervalId)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('focus', onVisible)
  })

  async function applyUpdate(): Promise<void> {
    needRefresh.value = false
    if (updateSW) {
      await updateSW(true)
      return
    }
    await checkForAppUpdate()
  }

  return { needRefresh, offlineReady, applyUpdate, checkForAppUpdate }
}