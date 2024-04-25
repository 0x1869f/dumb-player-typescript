import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useEffect, useState } from 'react'

import type { AudioFileWithMetaInfo } from
  '@/domain/types/audioFileWithMetaInfo'
import type { Directory } from '@/domain/types/directory'

import type { Dictionary } from '@/application/utilityTypes/dictionary'

import { ShortcutNotifier } from '@/infrastructure/shortcutNotifier/shortcutNotifier'

import { SHORTCUT_SUBSCRIBERS } from '@/ui/constants/shortcut/shortcutSubscribers'
import { useEvent } from '@/ui/hooks/useEvent'
import { keyWithControl } from '@/ui/utils/shortcutConditions/keyWithControl'
import { keyWithShift } from '@/ui/utils/shortcutConditions/keyWithShift'
import { singleKey } from '@/ui/utils/shortcutConditions/singleKey'

import { BashInput } from '../bashInput/BashInput'
import { Chip } from '../Chip'
import { Loader } from '../loader/Loader'
import { DirPreview } from './DirPreview'
import { LoaderListItem } from './LoaderListItem'
import { Preview } from './Preview'
import { useFilterStore } from './useFilterStore'
import { useImageUrls } from './useImageUrls'

type Node = AudioFileWithMetaInfo | Directory
type SelectedNodes = Dictionary<Dictionary<Node>>
type DirLastNode = Dictionary<{
  lastNode: AudioFileWithMetaInfo | Directory
  firstScreenIndex: number | null
}>

type Props = {
  initailPath: string
  onFileSelect: (files: Array<Node>) => void
  onExit: () => void
}

const ITEMS_HEIGHT = 64

export function FileLoader({
  initailPath,
  onFileSelect,
  onExit,
}: Props): ReactNode {
  const [nodes, setNodes] = useState<Array<Node>>([])
  const [previewNodes, setPreviewNodes] = useState<Array<Node>>([])
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false)

  const [currentDirImages, generateNodeImageUrls] = useImageUrls()

  const [currentDir, setCurentDir] = useState<string>(initailPath)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [parentDir, setParentDir] = useState<string>(initailPath)

  const [currentNode, setCurrentNode] = useState<Node | null>(null)

  const [dirLastNode, setDirLastNode] = useState<DirLastNode>({})

  const [selectedNodes, setSelectedNodes] = useState<SelectedNodes>({})

  const [currentNodeIndex, setCurrentNodeIndex] = useState<number>(0)

  const [firstScreenItemIndex, setFirstScreenItemIndex] = useState(0)

  const filterValue = useFilterStore((state) => state.value)
  const showFilterInput = useFilterStore((state) => state.show)
  const isFilterInputShown = useFilterStore((state) => state.isShown)
  const clearFilterInput = useFilterStore((state) => state.clear)

  const itemsInViewPort = useMemo(() => window.visualViewport?.height
    ? Math.floor(window.visualViewport.height / ITEMS_HEIGHT)
    : 0
  , [])

  function filterNodes(node: Node, filter: string): boolean {
    if (node.isDirectory) {
      return node.name.toLowerCase().includes(filter.toLowerCase())
    }

    if (node.metaInfo.title) {
      if (node.metaInfo.title.toLowerCase()
        .includes(filter.toLowerCase())) {
        return true
      }
    }

    return node.metaInfo.artist
      ? node.metaInfo.artist.toLowerCase().includes(filter.toLowerCase())
      : false
  }

  const filteredNodes = useMemo(
    () => filterValue
      ? nodes.filter((node) => filterNodes(node, filterValue))
      : nodes,
    [nodes, filterValue],
  )

  const selectFiles = useEvent(() => {
    if (Object.keys(selectedNodes).length) {
      let mappedNodes: Array<Node> = []

      for (const dirNodes of Object.values(selectedNodes)) {
        mappedNodes = mappedNodes.concat(Object.values(dirNodes))
      }

      clearFilterInput()
      onFileSelect(mappedNodes)
    }
  })

  const lastScreenItemIndex = useMemo(
    () => firstScreenItemIndex + itemsInViewPort < filteredNodes.length - 1
      ? firstScreenItemIndex + itemsInViewPort
      : filteredNodes.length - 1,
    [
      filteredNodes,
      firstScreenItemIndex,
      itemsInViewPort,
    ],
  )

  const moveDown = useEvent(() => {
    if (currentNode) {
      if (currentNodeIndex < filteredNodes.length - 1) {
        const newIndex = currentNodeIndex + 1

        setCurrentNodeIndex(() => newIndex)

        if (newIndex > lastScreenItemIndex) {
          setFirstScreenItemIndex(() => firstScreenItemIndex + 1)
        }

        const next = filteredNodes[currentNodeIndex + 1]

        if (next) {
          setCurrentNode(next)
        }
      }
    }
  })

  const selectNode = useEvent(() => {
    const allSelectedNodes = { ...selectedNodes }
    const currentDirNodes: Dictionary<Node> = selectedNodes[currentDir] ?? {}

    if (currentNode) {
      if (Object.prototype.hasOwnProperty
        .call(currentDirNodes, currentNode.fullPath)) {
        delete currentDirNodes[currentNode.fullPath]
      }
      else {
        currentDirNodes[currentNode.fullPath] = currentNode
        const children = Object.keys(allSelectedNodes)
          .filter((dirName) => dirName.includes(currentNode.fullPath))

        children.forEach((child) => {
          delete allSelectedNodes[child]
        })
      }

      setSelectedNodes({
        ...allSelectedNodes,
        [currentDir]: currentDirNodes,
      })
    }
  })

  const loadPreviewDir = (directory: Directory) => {
    setIsPreviewLoading(true)
    window.electron.listFiles(directory.fullPath)
      .then((result: Array<Node>) => {
        setPreviewNodes(result)
        setIsPreviewLoading(() => false)
      })
      .catch(() => {
        setIsPreviewLoading(() => false)
      })
  }

  useEffect(() => {
    if (currentNode?.isDirectory) {
      loadPreviewDir(currentNode)
    }
  }, [currentNode])

  const loadCurrentDir = (directory: string) => {
    setIsLoading(true)
    window.electron.listFiles(directory)
      .then((result: Array<Node>) => {
        setNodes(result)
        generateNodeImageUrls(result)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const openDirectory = useEvent(() => {
    if (currentNode && currentNode.isDirectory) {
      if (!(Object.prototype.hasOwnProperty
        .call(selectedNodes[currentDir] ?? {}, currentNode.fullPath))) {
        const newNodes = previewNodes

        setDirLastNode({
          ...dirLastNode,
          [currentDir]: {
            lastNode: currentNode,
            firstScreenIndex: filterValue ? null : firstScreenItemIndex,
          },
        })
        clearFilterInput()
        setNodes(newNodes)
        generateNodeImageUrls(newNodes)
        setCurentDir(currentNode.fullPath)
        setParentDir(currentNode.parentDir)
      }
    }
  })

  const goBack = useEvent(() => {
    const lastNodes = dirLastNode

    delete lastNodes[currentDir]
    setDirLastNode(lastNodes)

    setCurentDir(parentDir)
    setParentDir(parentDir.split('/').slice(0,-1)
      .join('/'))

    clearFilterInput()
    loadCurrentDir(parentDir)
  })

  const moveUp = useEvent(() => {
    if (currentNode) {
      if (currentNodeIndex > 0) {
        const newIndex = currentNodeIndex - 1

        const next = filteredNodes[newIndex]

        if (next) {
          setCurrentNode(next)
          setCurrentNodeIndex(newIndex)
        }

        if (firstScreenItemIndex > newIndex) {
          setFirstScreenItemIndex(newIndex)
        }
      }
    }
  })

  const moveToStart = useEvent(() => {
    if (filteredNodes.length) {
      const lastIndex = filteredNodes.length - 1

      setCurrentNodeIndex(lastIndex)
      setCurrentNode(filteredNodes[lastIndex]!)

      setFirstScreenItemIndex(filteredNodes.length - itemsInViewPort)
    }
  })

  const moveToEnd = useEvent(() => {
    if (filteredNodes.length) {
      setCurrentNode(filteredNodes.at(0)!)
      setCurrentNodeIndex(0)
      setFirstScreenItemIndex(0)
    }
  })

  const openNextScreen = useEvent(() => {
    const newIndex = currentNodeIndex + itemsInViewPort < filteredNodes.length
      ? currentNodeIndex + itemsInViewPort
      : filteredNodes.length - 1

    setCurrentNodeIndex(newIndex)
    setCurrentNode(filteredNodes[newIndex]!)

    if (lastScreenItemIndex + itemsInViewPort > filteredNodes.length) {
      setFirstScreenItemIndex(filteredNodes.length - itemsInViewPort)
    }
    else {
      setFirstScreenItemIndex(firstScreenItemIndex + itemsInViewPort)
    }
  })

  const openPreviousScreen = useEvent(() => {
    const newIndex = currentNodeIndex - itemsInViewPort >= 0
      ? currentNodeIndex - itemsInViewPort
      : 0

    setCurrentNodeIndex(newIndex)
    setCurrentNode(filteredNodes[newIndex]!)

    if (firstScreenItemIndex - itemsInViewPort < 0) {
      setFirstScreenItemIndex(0)
    }
    else {
      setFirstScreenItemIndex(firstScreenItemIndex - itemsInViewPort)
    }
  })

  const clearAndExit = useEvent(() => {
    clearFilterInput()
    onExit()
  })

  const screenNodes = useMemo(
    () => filteredNodes.slice(firstScreenItemIndex, lastScreenItemIndex + 1),
    [
      filteredNodes,
      firstScreenItemIndex,
      lastScreenItemIndex,
    ],
  )

  const preview = useMemo(() => {
    if (!currentNode) {
      return <div />
    }

    return currentNode.isDirectory
      ? <DirPreview
        key={currentNode.id}
        isLoading={isPreviewLoading}
        dirFiles={previewNodes}
      />
      : <Preview
        key={currentNode.id}
        file={currentNode}
        imageUrl={currentDirImages[currentNode.id]}
      />
  }, [
    currentNode,
    previewNodes,
    isPreviewLoading,
    currentDirImages,
  ])

  const nodeComponents = useMemo(() => screenNodes.map((node: Node) => {
    const isSelected = Object.prototype.hasOwnProperty
      .call(selectedNodes[currentDir] ?? {}, node.fullPath)
    const isCurrent = currentNode?.fullPath === node.fullPath

    return <LoaderListItem
      file={node}
      isSelected={isSelected}
      isCurrent={isCurrent}
      key={node.id}
      imageUrl={currentDirImages[node.id]}
    />
  }), [
    currentNode,
    selectedNodes,
    currentDirImages,
    screenNodes,
    currentDir,
  ])

  const component = useMemo(() => isLoading
    ? <Loader />
    : nodeComponents,
  [
    screenNodes,
    selectedNodes,
    currentDir,
    currentNode,
    isLoading,
    nodes,
  ])

  useEffect(() => {
    if (filteredNodes.length) {
      const lastNodes = dirLastNode

      const { lastNode, firstScreenIndex } = lastNodes[currentDir] ?? {
        lastNode: null,
        firstScreenItemIndex: null,
      }

      delete lastNodes[currentDir]
      setDirLastNode(lastNodes)

      if (lastNode) {
        const lastNodeIndex = filteredNodes.findIndex((node) => node.fullPath === lastNode.fullPath)

        if (lastNodeIndex > -1) {
          setCurrentNode(lastNode)

          setCurrentNodeIndex(lastNodeIndex)

          if (firstScreenIndex === null) {
            setFirstScreenItemIndex(lastNodeIndex)
          }
          else {
            setFirstScreenItemIndex(firstScreenIndex)
          }
        }
      }
      else {
        setCurrentNodeIndex(0)
        setCurrentNode(filteredNodes[0]!)
        setFirstScreenItemIndex(0)
      }
    }
    else {
      setCurrentNode(null)
    }
  }, [
    filteredNodes,
    currentDir,
    dirLastNode,
  ])

  useEffect(() => {
    loadCurrentDir(initailPath)
  }, [initailPath])

  useEffect(() => {
    const shortcutNotifer = ShortcutNotifier.getInstance()

    shortcutNotifer.subscribe(SHORTCUT_SUBSCRIBERS.fileLoader, [
      {
        condition: singleKey('KeyK'),
        callback: moveUp,
      },
      {
        condition: singleKey('ArrowUp'),
        callback: moveUp,
      },
      {
        condition: singleKey('KeyJ'),
        callback: moveDown,
      },
      {
        condition: singleKey('ArrowDown'),
        callback: moveDown,
      },
      {
        condition: singleKey('KeyH'),
        callback: goBack,
      },
      {
        condition: singleKey('ArrowLeft'),
        callback: goBack,
      },
      {
        condition: singleKey('KeyL'),
        callback: openDirectory,
      },
      {
        condition: singleKey('ArrowRight'),
        callback: openDirectory,
      },
      {
        condition: singleKey('KeyI'),
        callback: selectNode,
      },
      {
        condition: singleKey('Space'),
        callback: selectNode,
      },
      {
        condition: singleKey('KeyQ'),
        callback: clearAndExit,
      },
      {
        condition: singleKey('KeyU'),
        callback: clearFilterInput,
      },
      {
        condition: singleKey('Escape'),
        callback: onExit,
      },
      {
        condition: singleKey('Enter'),
        callback: selectFiles,
      },
      {
        condition: singleKey('KeyO'),
        callback: selectFiles,
      },
      {
        condition: keyWithControl('KeyB'),
        callback: openPreviousScreen,
      },
      {
        condition: keyWithShift('KeyG'),
        callback: moveToStart,
      },
      {
        condition: singleKey('KeyG'),
        callback: (payload) => {
          if (payload.isRepeated) {
            moveToEnd()
          }
        },
      },
      {
        condition: singleKey('Slash'),
        callback: showFilterInput,
      },
      {
        condition: keyWithControl('KeyF'),
        callback: openNextScreen,
      },
    ])

    shortcutNotifer.addActive(SHORTCUT_SUBSCRIBERS.fileLoader)

    return () => {
      shortcutNotifer.deleteActive(SHORTCUT_SUBSCRIBERS.fileLoader)
      shortcutNotifer.unsubscribe(SHORTCUT_SUBSCRIBERS.fileLoader)
    }
  }, [])

  const filter = useMemo(() => {
    if (isFilterInputShown) {
      return <div className='filter-container w-full transition-[width]'>
        <BashInput store={useFilterStore} /> </div>
    }

    return filterValue
      ? <div className='filter-container w-content transition-[width] ml-4'>
        <Chip value={filterValue} className='bg-gray-700'/>
      </div>
      : <div className='filter-container w-1 transition-[width]'></div>
  }, [isFilterInputShown, filterValue])

  return (
    <div className='h-screen relative'>
      <div className='flex p-2 gap-2'>
        <div className="flex gap-1 flex-col w-1/2">
          {component}
        </div>
        <div className='w-1/2'>
          {preview}
        </div>
      </div>

      {filter}
    </div>
  )
}
