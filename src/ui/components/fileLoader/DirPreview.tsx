import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'

import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'
import type { Directory } from '@/domain/types/directory'

import { Loader } from '../loader/Loader'
import { LoaderListItem } from './LoaderListItem'
import { useImageUrls } from './useImageUrls'

const ITEMS_HEIGHT = 64

type Props = {
  dirFiles: Array<AudioFileWithMetaInfo | Directory>
  isLoading: boolean
}

export function DirPreview({ dirFiles, isLoading }: Props): ReactNode {
  const [
    imageUrls,
    generateImageUrls,
    isUrlLoading, ] = useImageUrls()

  const filesInViewPort = useMemo(() => {
    const itemsInViewPort = window.visualViewport?.height
      ? Math.floor(window.visualViewport.height / ITEMS_HEIGHT)
      : 0

    return dirFiles.slice(0, itemsInViewPort - 1)
  }, [dirFiles])

  useEffect(() => {
    if (filesInViewPort.length) {
      generateImageUrls(filesInViewPort)
    }
  }, [filesInViewPort])

  const directoryPreview = useMemo(() => filesInViewPort
    .map((item: AudioFileWithMetaInfo | Directory) => <
      LoaderListItem key={`list-item${ item.id}`} file={item} imageUrl={imageUrls[item.id]}
    />), [filesInViewPort, imageUrls])

  const component = useMemo(() => isLoading || isUrlLoading
    ? <Loader />
    : <div className="flex flex-col gap-1 h-full">
      {directoryPreview}
    </div>, [isLoading, directoryPreview])

  return component
}
