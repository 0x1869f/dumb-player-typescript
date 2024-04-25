import type { AudioFile } from '@/domain/types/audioFile'
import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'

import { mapper } from './mapper'

export const mapToFiles = mapper(
  (file: AudioFileWithMetaInfo | AudioFile): AudioFile => ({
    fullPath: file.fullPath,
    isDirectory: file.isDirectory,
    extention: file.extention,
    parentDir: file.parentDir,
    name: file.name,
  }),
)
