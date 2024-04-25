import type { AudioFile } from '@/domain/types/audioFile'
import type { Directory } from '@/domain/types/directory'

export type DirectoryContent = {
  directories: Array<Directory>
  files: Array<AudioFile>
}
