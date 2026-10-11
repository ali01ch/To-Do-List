export interface StorageEstimate {
  usage: number
  quota: number
}

export async function readStorageEstimate(): Promise<StorageEstimate | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null
  try {
    const estimate = await navigator.storage.estimate()
    if (estimate.usage == null || estimate.quota == null) return null
    return { usage: estimate.usage, quota: estimate.quota }
  } catch {
    return null
  }
}
