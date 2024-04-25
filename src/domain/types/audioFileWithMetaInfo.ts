import type { AudioFile } from './audioFile'
import type { MetaInfo } from './metaInfo'

export type AudioFileWithMetaInfo = AudioFile & {
  id: string 
  metaInfo: MetaInfo
}
