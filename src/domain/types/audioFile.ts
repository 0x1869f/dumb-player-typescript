import type { SupportedExtention } from '@/domain/types/supportedExtention'

import type { File } from './file'

export type AudioFile = File & {
  isDirectory: false
  extention: SupportedExtention
}
