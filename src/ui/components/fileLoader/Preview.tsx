import './Preview.css'

import { Music } from 'lucide-react'
import { type ReactNode } from 'react'

import type { AudioFileWithMetaInfo } from
  '@/domain/types/audioFileWithMetaInfo'

import { Duration } from '../Duration'
import { Image } from '../Image'

type Props = {
  file: AudioFileWithMetaInfo
  imageUrl?: string
}

export function Preview({ file, imageUrl }: Props): ReactNode {
  function Icon() {
    return imageUrl
      ? <Image url={imageUrl} className="size-60 rounded" />
      : <Music className="track-icon rounded opacity-20 bg-gray-500" />
  }

  function buildGenre(genres: Array<string>) {
    const style = 'py-1 px-2 text-black rounded bg-green-500'

    return genres.map(
      (genre) => <span key={genre} className={style}>{genre}</span>,
    )
  }

  function buildFilePreview() {
    const metaFields: Array<keyof AudioFileWithMetaInfo['metaInfo']> = [
      'artist',
      'album',
      'year',
      'duration',
    ]

    const info = []
    const titleStyle = 'text-gray-400'

    if (file.metaInfo.title) {
      info.push(
        <div key="title" className="title-grid">
          <span className={titleStyle}>title</span>
          <span>{file.metaInfo.title}</span>
        </div>,
      )
    }
    else {
      info.push(
        <div key="name" className="title-grid">
          <span className={titleStyle}>file</span>
          <span>{file.name}</span>
        </div>,
      )
    }

    for (const metaField of metaFields) {
      if (file.metaInfo[metaField]) {
        if (metaField === 'duration') {
          info.push(
            <div key={metaField} className="title-grid">
              <span className={titleStyle}>{metaField}</span>
              <Duration seconds={Math.floor(file.metaInfo.duration!)}/>
            </div>,
          )

          continue
        }

        info.push(
          <div key={metaField} className="title-grid">
            <span className={titleStyle}>{metaField}</span>
            <span>{file.metaInfo[metaField] as string}</span>
          </div>,
        )
      }
    }

    info.push(
      <div key="genre" className="pt-1 flex gap-2">{buildGenre(file.metaInfo.genre)}</div>,
    )

    return <div className="flex flex-col">{info}</div>
  }

  return <div className="key pt-10 pl-10 flex flex-col content-center items-start gap-1">
    <Icon />
    {buildFilePreview()}
  </div>
}
