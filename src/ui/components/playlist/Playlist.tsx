import type { ReactNode } from 'react'
import {
  useEffect, useMemo, useRef, useState,
} from 'react'

import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'

import { ShortcutNotifier } from '@/infrastructure/shortcutNotifier/shortcutNotifier'

import { SHORTCUT_SUBSCRIBERS } from '@/ui/constants/shortcut/shortcutSubscribers'
import { useEvent } from '@/ui/hooks/useEvent'
import { keyWithControl } from '@/ui/utils/shortcutConditions/keyWithControl'
import { keyWithShift } from '@/ui/utils/shortcutConditions/keyWithShift'
import { singleKey } from '@/ui/utils/shortcutConditions/singleKey'

import { BashInput } from '../bashInput/BashInput'
import { Chip } from '../Chip'
import { PlaylistItem } from './PlaylistItem'
import { useFilterStore } from './useFilterStore'
import { usePlaylistStore } from './usePlaylistStore'

const ITEMS_HEIGHT = 60

export const Playlist = (): ReactNode => {
  const [selectedFile, setSelectedFile] = useState<AudioFileWithMetaInfo | null>(null)
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0)
  const [firstScreenItemIndex, setFirstScreenItemIndex] = useState(0)

  const fileListWasEmpty = useRef<boolean>(true)

  const currentFile = usePlaylistStore((state) => state.currentFile)
  const files = usePlaylistStore((state) => state.files)
  const deleteFile = usePlaylistStore((state) => state.deleteFile)
  const setCurrent = usePlaylistStore((state) => state.setCurrent)
  const moveUp = usePlaylistStore((state) => state.moveUp)
  const moveDown = usePlaylistStore((state) => state.moveDown)

  const filterValue = useFilterStore((state) => state.value)
  const showFilterInput = useFilterStore((state) => state.show)
  const isFilterInputShown = useFilterStore((state) => state.isShown)
  const clearFilterInput = useFilterStore((state) => state.clear)

  const itemsInViewPort = useMemo(() => window.visualViewport?.height
    ? Math.floor(((window.visualViewport.height || 0) - 100) / ITEMS_HEIGHT)
    : 0
  , [])

  function filterFiles(file: AudioFileWithMetaInfo, filter: string): boolean {
    if (file.metaInfo.title) {
      if (file.metaInfo.title.toLowerCase()
        .includes(filter.toLowerCase())) {
        return true
      }
    }

    return file.metaInfo.artist
      ? file.metaInfo.artist.toLowerCase().includes(filter.toLowerCase())
      : file.name.toLowerCase().includes(filter.toLowerCase())
  }

  const filteredFiles = useMemo(
    () => filterValue
      ? files.filter((file) => filterFiles(file, filterValue))
      : files,
    [files, filterValue],
  )

  const lastScreenItemIndex = useMemo(
    () => firstScreenItemIndex + itemsInViewPort < filteredFiles.length - 1
      ? firstScreenItemIndex + itemsInViewPort
      : filteredFiles.length - 1,
    [
      filteredFiles,
      firstScreenItemIndex,
      itemsInViewPort,
    ],
  )

  const moveCursorDown = useEvent(() => {
    if (selectedFile) {
      if (selectedFileIndex < filteredFiles.length - 1) {
        const newIndex = selectedFileIndex + 1

        setSelectedFile(filteredFiles[newIndex]!)
        setSelectedFileIndex(newIndex)

        if (newIndex > lastScreenItemIndex) {
          setFirstScreenItemIndex(firstScreenItemIndex + 1)
        }
      }
    }
  })

  const deleteUnderCursor = useEvent(() => {
    if (selectedFile && selectedFile.id !== currentFile?.id) {
      const deletedFile = selectedFile

      if (filteredFiles.length > 1) {
        if (selectedFileIndex === 0) {
          setSelectedFileIndex(0)
          setSelectedFile(() => filteredFiles[1]!)
        }
        else {
          const newIndex = selectedFileIndex - 1

          setSelectedFileIndex(newIndex)
          setSelectedFile(filteredFiles[newIndex]!)
        }
      }
      else {
        setSelectedFile(null)
        setSelectedFileIndex(0)
      }

      deleteFile(deletedFile)
    }
  })

  const moveSelectedUp = useEvent(() => {
    if (selectedFile) {
      const index = files.findIndex((f) => f.id === selectedFile!.id)

      if (index > 0) {
        setSelectedFileIndex(index - 1)
        moveUp(index)

        if (index === firstScreenItemIndex) {
          setFirstScreenItemIndex(firstScreenItemIndex - 1)
        }
      }
    }
  })

  const moveSelectedDown = useEvent(() => {
    if (selectedFile) {
      const index = files.findIndex((f) => f.id === selectedFile!.id)

      if (index < files.length - 1) {
        setSelectedFileIndex(index + 1)
        moveDown(index)

        if (index === lastScreenItemIndex) {
          setFirstScreenItemIndex(firstScreenItemIndex + 1)
        }
      }
    }
  })

  const jumpScreenForward = useEvent(() => {
    const newIndex = selectedFileIndex + itemsInViewPort < filteredFiles.length
      ? selectedFileIndex + itemsInViewPort
      : filteredFiles.length - 1

    setSelectedFileIndex(newIndex)
    setSelectedFile(filteredFiles[newIndex]!)

    if (itemsInViewPort >= filteredFiles.length) {
      return
    }

    if (lastScreenItemIndex + itemsInViewPort > filteredFiles.length) {
      setFirstScreenItemIndex(filteredFiles.length - itemsInViewPort)
    }
    else {
      setFirstScreenItemIndex(firstScreenItemIndex + itemsInViewPort)
    }
  })

  const jumpScreenBackward = useEvent(() => {
    const newIndex = selectedFileIndex - itemsInViewPort >= 0
      ? selectedFileIndex - itemsInViewPort
      : 0

    const newFile = filteredFiles[newIndex]

    if (newFile) {
      setSelectedFileIndex(newIndex)
      setSelectedFile(newFile)

      if (itemsInViewPort >= filteredFiles.length) {
        return
      }

      if (firstScreenItemIndex - itemsInViewPort < 0) {
        setFirstScreenItemIndex(0)
      }
      else {
        setFirstScreenItemIndex(firstScreenItemIndex - itemsInViewPort)
      }
    }
  })

  const selectCurrent = useEvent(() => {
    if (selectedFile) {
      setCurrent(selectedFile)
    }
  })

  const moveCursorUp = useEvent(() => {
    if (selectedFile) {
      if (selectedFileIndex > 0) {
        const newIndex = selectedFileIndex - 1

        const newFile = filteredFiles[newIndex]

        if (newFile) {
          setSelectedFile(newFile)
          setSelectedFileIndex(newIndex)

          if (firstScreenItemIndex > newIndex) {
            setFirstScreenItemIndex(newIndex)
          }
        }
      }
    }
  })

  const moveScreenToEnd = useEvent(() => {
    if (filteredFiles.length) {
      setSelectedFile(filteredFiles.at(-1)!)
      setSelectedFileIndex(filteredFiles.length - 1)

      if (filteredFiles.length > itemsInViewPort) {
        setFirstScreenItemIndex(filteredFiles.length - itemsInViewPort)
      }
    }
  })

  const moveScreenToStart = useEvent(() => {
    if (filteredFiles.length) {
      setFirstScreenItemIndex(0)
      setSelectedFile(filteredFiles[0]!)
      setSelectedFileIndex(0)
    }
  })

  useEffect(() => {
    if (files.length && fileListWasEmpty.current) {
      setSelectedFile(files[0]!)
      setSelectedFileIndex(0)
    }

    fileListWasEmpty.current = !files.length
  }, [files])

  useEffect(
    () => {
      if (filteredFiles.length && !currentFile) {
        setSelectedFile(filteredFiles[0]!)
        setSelectedFileIndex(0)
        setFirstScreenItemIndex(0)
      }
    },
    [filterValue, filteredFiles],
  )

  useEffect(() => {
    const shortcutNotifier = ShortcutNotifier.getInstance()

    shortcutNotifier.subscribe(SHORTCUT_SUBSCRIBERS.playlist, [
      {
        condition: singleKey('KeyJ'),
        callback: moveCursorDown,
      },
      {
        condition: keyWithShift('KeyJ'),
        callback: moveSelectedDown,
      },
      {
        condition: keyWithShift('KeyK'),
        callback: moveSelectedUp,
      },
      {
        condition: keyWithControl('KeyF'),
        callback: jumpScreenForward,
      },
      {
        condition: keyWithControl('KeyB'),
        callback: jumpScreenBackward,
      },
      {
        condition: singleKey('Enter'),
        callback: selectCurrent,
      },
      {
        condition: singleKey('KeyI'),
        callback: selectCurrent,
      },
      {
        condition: singleKey('KeyK'),
        callback: moveCursorUp,
      },
      {
        condition: keyWithShift('KeyG'),
        callback: moveScreenToEnd,
      },
      {
        condition: singleKey('KeyG'),
        callback: (payload) => {
          if (payload.isRepeated) {
            moveScreenToStart()
          }
        },
      },
      {
        condition: singleKey('Slash'),
        callback: showFilterInput,
      },
      {
        condition: singleKey('KeyU'),
        callback: clearFilterInput,
      },
      {
        condition: singleKey('KeyD'),
        callback: (payload) => {
          if (payload.isRepeated) {
            deleteUnderCursor()
          }
        },
      },
    ])
    shortcutNotifier.addActive(SHORTCUT_SUBSCRIBERS.playlist)

    return () => {
      shortcutNotifier.deleteActive(SHORTCUT_SUBSCRIBERS.playlist)
      shortcutNotifier.unsubscribe(SHORTCUT_SUBSCRIBERS.playlist)
    }
  }, [])

  const filter = useMemo(() => {
    if (isFilterInputShown) {
      return <div className='filter-container w-full transition-[width]'>
        <BashInput store={useFilterStore} />
      </div>
    }

    return filterValue
      ? <div className='filter-container w-content transition-[width] ml-4'>
        <Chip value={filterValue} className='bg-gray-700'/>
      </div>
      : <div className='filter-container w-1 transition-[width]'></div>
  }, [isFilterInputShown, filterValue])

  const Files = useMemo((): ReactNode => {
    const items = filteredFiles.slice(
      firstScreenItemIndex,
      lastScreenItemIndex + 1,
    )
    const Items = items.map((file: AudioFileWithMetaInfo) => <PlaylistItem
      key={file.id}
      file={file}
      current={currentFile}
      selected={selectedFile}
    />)

    return <div className='p-2 flex flex-col gap-1'>
      {Items}
    </div>
  }, [
    firstScreenItemIndex,
    lastScreenItemIndex,
    filteredFiles,
    currentFile,
    selectedFile,
  ])

  return (
    <div>
      <div className="flex gap-1 flex-col w-full relative">
        {Files}
      </div>

      {filter}
    </div>
  )
}
