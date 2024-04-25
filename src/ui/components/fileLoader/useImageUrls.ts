import { useEffect, useState } from 'react'

import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'
import type { Directory } from '@/domain/types/directory'

import type { Dictionary } from '@/application/utilityTypes/dictionary'

type Return = [
  Dictionary<string>,
  (nodeList: Array<AudioFileWithMetaInfo | Directory>) => void,
  boolean,
]

export function useImageUrls(): Return {
  const [imageUrls, setImageUrls] = useState<Dictionary<string>>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function createImageUrl(node: AudioFileWithMetaInfo | Directory): string | null {
    let image: ArrayBuffer | undefined = node.isDirectory
      ? node.image
      : node.metaInfo.image

    return image
      ? URL.createObjectURL(new Blob([image]))
      : null
  }

  function clearUrls(urls: Dictionary<string>) {
    for (const url of Object.values(urls)) {
      URL.revokeObjectURL(url)
    }
  }

  const generateNodeImages = (nodeList: Array<AudioFileWithMetaInfo | Directory>) => {
    setIsLoading(false)
    const oldUrls = imageUrls

    const newImages = nodeList
      .reduce<Dictionary<string>>((images, node) => {
        const image = createImageUrl(node)

        if (image) {
          images[node.id] = image
        }

        return images
      }, {})

    setImageUrls(newImages)

    clearUrls(oldUrls)
    setIsLoading(false)
  }

  useEffect(() => () => {
    clearUrls(imageUrls)
  }, [])

  return [
    imageUrls,
    generateNodeImages,
    isLoading,
  ]
}
