import { Music } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import type { AudioFileWithMetaInfo } from
  '@/domain/types/audioFileWithMetaInfo'

import { Duration } from '../Duration'
import { Image } from '../Image'

type Props = {
  current: AudioFileWithMetaInfo | null
  selected: AudioFileWithMetaInfo | null
  file: AudioFileWithMetaInfo
}

export function PlaylistItem({
  current,
  selected,
  file,
}: Props): ReactNode {
  const duration = Math.floor(file.metaInfo.duration ?? 0)
  const [
    imageUrl,
    setImageUrl,
  ] = useState<string>('')

  useEffect(() => {
    if (file.metaInfo.image) {
      const url = URL.createObjectURL(new Blob([file.metaInfo.image]))

      setImageUrl(url)
    }

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [file])

  let boxStyle = 'border-transparent p-1 content-center font-1 grid grid-cols-12 gap-1 border-1 border-solid rounded'

  file.id === selected?.id
    ? boxStyle += ' bg-gray-700'
    : boxStyle = String(boxStyle)

  file.id === current?.id
    ? boxStyle += ' bg-gray-500'
    : boxStyle = String(boxStyle)

  const imageOrIcon = useMemo(() => imageUrl
    ? <Image url={imageUrl} className="rounded w-9 h-9" />
    : <Music className="rounded w-7 h-7 bordered opacity-20 bg-gray-500 p-1" />, [imageUrl])

  const title = file.metaInfo.artist && file.metaInfo.title && file.metaInfo.title
    ? <>
      <div className="w-1/2 flex flex-col">
        <span className="text-sm">{file.metaInfo.artist}</span>
        <span className="text-sm text-purple-300">{file.metaInfo.title}</span>
      </div>

      <div className="w-1/2">
        <span className="text-sm">{file.metaInfo.album}</span>
      </div>
    </>
    : <>
      <span className="text-sm">{file.name}</span>
    </>

  return <div className={boxStyle}>
    <div className="col-start-1 col-end-11 flex items-center gap-2">
      {imageOrIcon}
      {title}
    </div>

    <div className="col-start-12 justify-self-end self-center">
      <Duration seconds={duration} />
    </div>
  </div>
}
