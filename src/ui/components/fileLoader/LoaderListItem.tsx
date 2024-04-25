import { Folder,Music } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'
import type { Directory } from '@/domain/types/directory'

import { Image } from '../Image'

type Props = {
  file: Directory | AudioFileWithMetaInfo
  isSelected?: boolean
  isCurrent?: boolean
  imageUrl?: string
  onPreviewUpdate?: (url: ReactNode) => void
}

export function LoaderListItem({
  file,
  isCurrent,
  isSelected,
  imageUrl,
}: Props): ReactNode {
  const cover = useMemo(
    () => {
      const style = 'rounded w-9 h-9'
      const iconStyle = 'rounded w-7 h-7 bordered opacity-20 bg-gray-500 p-1'

      if (imageUrl) {
        return imageUrl
          ? <Image url={imageUrl} className={style} />
          : <div className={style}></div>
      }

      return file.isDirectory
        ? <Folder className={iconStyle} />
        : <Music className={iconStyle} />
    },
    [file, imageUrl],
  )

  const title = useMemo(() => {
    if (!file.isDirectory) {
      return file.metaInfo.artist && file.metaInfo.title && file.metaInfo.title
        ? <div className="col-start-2 col-end-11 flex content-center gap-2">
          <span className="text-sm">{file.metaInfo.artist}</span>
          <span className="text-sm text-purple-300">{file.metaInfo.title}</span>
        </div>
        : <div className="col-start-2 col-end-11 flex content-center">
          <div></div>
          <span className="text-sm">{file.name}</span>
        </div>
    }

    return file.name
  }, [file])

  function buildTemplate(isSelected?: boolean, isCurrent?: boolean) {
    let boxStyle = `border-transparent h-10 p-1 flex gap-2 font-1
      border-1 border-solid rounded items-center`

    if (isCurrent) {
      boxStyle += ' bg-gray-700'
    }
    else {
      boxStyle = String(boxStyle)
    }

    if (isSelected) {
      boxStyle += ' bg-gray-500'
    }
    else {
      boxStyle = String(boxStyle)
    }

    return <div className={boxStyle}>
      {cover}
      {title}
    </div>
  }

  return buildTemplate(isSelected, isCurrent)
}
