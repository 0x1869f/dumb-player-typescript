import type { File } from './file'

export type Directory = File & {
  isDirectory: true
  image?: ArrayBuffer
  id: string
}
