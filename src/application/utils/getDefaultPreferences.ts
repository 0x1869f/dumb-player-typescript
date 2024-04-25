import type { Preferences } from '@/application/types/preferences'

export function getDefaultPreferences(): Preferences {
  return {
    playlist: [],
    isMuted: false,
    isRandom: false,
    volume: 0.4,
  }
}
