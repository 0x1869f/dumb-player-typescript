import { readdir } from 'node:fs/promises'

import type { Dirent } from 'fs'
import { parse } from 'path'
import { join } from 'path'

import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'
import type { Directory } from '@/domain/types/directory'
import type { SupportedExtention } from '@/domain/types/supportedExtention'

import { getId } from '../../application/utils/getId'
import { addMetaInfoToFile } from './addMetaInfoToFile'
import { getCover } from './getCover'
import { isSupportedExtention } from './isSupportedExtention'

async function mapToDirectory(dirent: Dirent): Promise<Directory> {
  const directory: Directory = {
    isDirectory: true,
    fullPath: `${dirent.path}/${dirent.name}`,
    parentDir: dirent.path,
    name: dirent.name,
    id: getId(),
  }
  const image = await getCover(join(dirent.path, dirent.name))

  if (image) {
    directory.image = image
  }

  return directory
}

function mapToFile(dirent: Dirent): Promise<AudioFileWithMetaInfo> {
  const parsedPath = parse(dirent.name)

  return addMetaInfoToFile({
    isDirectory: false,
    parentDir: dirent.path,
    fullPath: `${dirent.path }/${ dirent.name}`,
    name: parsedPath.name,
    extention: parsedPath.ext as SupportedExtention,
  })
}

export async function listFiles(path: string):
  Promise<Array<AudioFileWithMetaInfo | Directory>> {
  const result: Array<Dirent> = await readdir(path, { withFileTypes: true })

  const files: Array<AudioFileWithMetaInfo> = []
  const directories: Array<Directory> = []

  for (const dirent of result) {
    if (dirent.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      const directory = await mapToDirectory(dirent)

      directories.push(directory)
    }
    else if (isSupportedExtention(dirent.name)) {
      // eslint-disable-next-line no-await-in-loop
      const file = await mapToFile(dirent)

      files.push(file)
    }
  }

  return [
    ...directories,
    ...files,
  ]
}
