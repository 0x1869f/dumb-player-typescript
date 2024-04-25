import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'
import type { Directory } from '@/domain/types/directory'

import { listFiles } from './listFiles'

export async function extractFilesFromDirectories(
  files: Array<Directory | AudioFileWithMetaInfo>,
): Promise<Array<AudioFileWithMetaInfo>> {
  let allFiles: Array<AudioFileWithMetaInfo> = []

  for (const file of files) {
    if (file.isDirectory) {
      const extractedFiles = await listFiles(file.fullPath)
      const validatedFiles = await extractFilesFromDirectories(extractedFiles)

      allFiles = allFiles.concat(validatedFiles)
    }
    else {
      allFiles.push(file)
    }
  }

  return allFiles
}
