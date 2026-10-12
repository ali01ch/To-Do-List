import { ref } from 'vue'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferred = ref<BeforeInstallPromptEvent | null>(null)
const installed = ref(false)
let listening = false

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const displayStandalone =
    typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return displayStandalone || iosStandalone
}

export function useInstallPrompt() {
  if (!listening && typeof window !== 'undefined') {
    listening = true
    installed.value = isStandalone()
    window.addEventListener('beforeinstallprompt', ((event: Event) => {
      event.preventDefault()
      deferred.value = event as BeforeInstallPromptEvent
    }) as EventListener)
    window.addEventListener('appinstalled', () => {
      installed.value = true
      deferred.value = null
    })
  }

  async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    const event = deferred.value
    if (!event) return 'unavailable'
    await event.prompt()
    const choice = await event.userChoice
    deferred.value = null
    return choice.outcome
  }

  return { deferred, installed, promptInstall, isIosSafari: isIosSafari() }
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const webkit = /WebKit/.test(ua)
  const chrome = /CriOS|FxiOS|EdgiOS/.test(ua)
  return iOS && webkit && !chrome
}
