import type { AudioFile } from '@/domain/types/audioFile'
import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'

import { getId } from '../../application/utils/getId'
import { parseFileMeta } from './parseFileMeta'

export async function addMetaInfoToFile(file: AudioFile): Promise<AudioFileWithMetaInfo> {
  const metaInfo = await parseFileMeta(file.fullPath)

  return {
    ...file,
    id: getId(),
    metaInfo,
  }
}

