import type { AudioFile } from '@/domain/types/audioFile'

export type PreferencesData = {
  playlist: Array<AudioFile>
  volume: number
  isMuted: boolean
  isRandom: boolean
}
