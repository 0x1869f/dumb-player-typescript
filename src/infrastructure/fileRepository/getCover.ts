import type { Dirent } from 'fs'
import { readdir } from 'fs/promises'
import { join } from 'path'

import { IMAGE_SUPPORTED_EXTENTION } from
  '../../application/constants/imageSupportedExtention'
import { readFile } from './readFile'

export async function getCover(path: string): Promise<ArrayBuffer | null> {
  const files: Array<Dirent> = await readdir(path, { withFileTypes: true })

  let result = files.find((file: Dirent) => {
    for (const extention of Object.values(IMAGE_SUPPORTED_EXTENTION)) {
      if (file.name.toLowerCase() === `cover${extention}`) {
        return true
      }
    }

    return false
  })

  if (!result) {
    result = files.find((file: Dirent) => {
      for (const extention of Object.values(IMAGE_SUPPORTED_EXTENTION)) {
        if (file.name.toLowerCase().includes(`${extention}`)) {
          return true
        }
      }

      return false
    })
  }

  if (!result) {
    return null
  }

  return readFile(join(result.path, result.name))
}
