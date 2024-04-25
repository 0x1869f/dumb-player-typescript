import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'

export type Preferences = {
  playlist: Array<AudioFileWithMetaInfo>
  volume: number
  isRandom: boolean
  isMuted: boolean
}
