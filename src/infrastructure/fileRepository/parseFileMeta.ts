import type { IAudioMetadata } from 'music-metadata'
import { parseFile } from 'music-metadata'
import { parse } from 'path'

import type { MetaInfo } from '@/domain/types/metaInfo'
import type { SupportedExtention } from '@/domain/types/supportedExtention'

import { getCover } from './getCover'

export async function parseFileMeta(path: string): Promise<MetaInfo> {
  let info: IAudioMetadata | null = null

  try {
    info = await parseFile(path, { duration: true })
  }
  catch {
    //
  }

  const picture = info?.common.picture?.at(0)

  let image: ArrayBuffer | null = picture
    ? new Uint8Array(picture.data).buffer
    : null

  if (!image) {
    image = await getCover(parse(path).dir)
  }

  const meta: MetaInfo = {
    duration: info?.format.duration,
    artist: info?.common.artist,
    title: info?.common.title,
    genre: info?.common.genre ?? [],
    year: info?.common.year,
    album: info?.common.album,
    container: info?.format.container as SupportedExtention,
  }

  if (image) {
    meta.image = image
  }

  return meta
}
