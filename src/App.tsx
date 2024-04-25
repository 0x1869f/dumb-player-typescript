import './App.css'

import type { ReactNode } from 'react'
import {
  useEffect, useMemo, useRef, useState,
} from 'react'

import type { AudioFile } from '@/domain/types/audioFile'
import type { Directory } from '@/domain/types/directory'

import type { Preferences } from '@/application/types/preferences'

import { ShortcutNotifier } from '@/infrastructure/shortcutNotifier/shortcutNotifier'

import { FileLoader } from '@/ui/components/fileLoader/FileLoader'
import { Loader } from '@/ui/components/loader/Loader'
import { Player } from '@/ui/components/player/Player'
import { useVolumeStore } from '@/ui/components/player/useVolumeStore'
import { Playlist } from '@/ui/components/playlist/Playlist'
import { usePlaylistStore } from '@/ui/components/playlist/usePlaylistStore'
import { SHORTCUT_SUBSCRIBERS } from '@/ui/constants/shortcut/shortcutSubscribers'
import { useBeforeunload } from '@/ui/hooks/useBeforeUnload'
import { keyWithControl } from '@/ui/utils/shortcutConditions/keyWithControl'
import { keyWithShift } from '@/ui/utils/shortcutConditions/keyWithShift'

type PlayerRef = {
  stopOrResume: () => void
  subscribe: () => void
  unsubscribe: () => void
}

function App(): ReactNode {
  const files = usePlaylistStore((state) => state.files)
  const setFiles = usePlaylistStore((state) => state.setFiles)
  const addFiles = usePlaylistStore((state) => state.addFiles)
  const selectNext = usePlaylistStore((state) => state.selectNext)
  const selectPrev = usePlaylistStore((state) => state.selectPrev)
  const clearFiles = usePlaylistStore((state) => state.clearFiles)
  const isRandom = usePlaylistStore((state) => state.isRandom)
  const setIsRandom = usePlaylistStore((state) => state.setIsRandom)

  const increaseVolume = useVolumeStore((state) => state.increaseVolume)
  const decreaseVolume = useVolumeStore((state) => state.decreaseVolume)
  const setIsMuted = useVolumeStore((state) => state.setIsMuted)
  const setVolume = useVolumeStore((state) => state.setVolume)
  const volume = useVolumeStore((state) => state.volume)
  const isMuted = useVolumeStore((state) => state.isMuted)
  const switchMute = useVolumeStore((state) => state.switchMute)

  const [isFileLoaderShown, showFileLoader] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [initialPath, setInitalPath] = useState('')

  const playerRef = useRef<PlayerRef | null>(null)

  async function initPreferences(): Promise<void> {
    setIsLoading(true)
    window.electron.loadPreferences()
      .then((preferences: Preferences) => {
        setVolume(preferences.volume)
        setIsMuted(preferences.isMuted)
        setIsRandom(preferences.isRandom)
        setFiles(preferences.playlist)
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  async function savePreferences(): Promise<void> {
    setIsLoading(true)
    window.electron.savePreferences({
      isRandom,
      isMuted,
      volume,
      playlist: files,
    })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
  useBeforeunload((event) => savePreferences())

  function onPause() {
    if (playerRef.current) {
      playerRef.current.stopOrResume()
    }
  }

  function openFileLoader() {
    showFileLoader(true)
  }

  useEffect(() => {
    window.electron.getHomedir().then((path: string) => {setInitalPath(path)})

    initPreferences()
    const shortcutNotifer = ShortcutNotifier.getInstance()

    shortcutNotifer.subscribe(SHORTCUT_SUBSCRIBERS.app, [{
      condition: keyWithShift('KeyO'),
      callback: openFileLoader,
    },
    {
      condition: keyWithControl('KeyL'),
      callback: clearFiles,
    }])

    shortcutNotifer.addActive(SHORTCUT_SUBSCRIBERS.app)
    window.electron.createCacheDir()
    window.electron.onPauseOrPlay(onPause)
    window.electron.onPlayNext(selectNext)
    window.electron.onPlayPrevious(selectPrev)
    window.electron.onIncreaseVolume(increaseVolume)
    window.electron.onDecreaseVolume(decreaseVolume)
    window.electron.onSwitchMute(switchMute)

    return () => {
      shortcutNotifer.stop()
    }
  }
  , [])

  const onFileSelect = async(fileList: Array<AudioFile | Directory>) => {
    showFileLoader(false)
    setIsLoading(true)
    const result = await window.electron.extractFilesFromDirectories(fileList)

    setIsLoading(false)
    addFiles(result)
  }

  const hideFileLoader = () => {
    showFileLoader(false)
  }

  const TopSide = useMemo(() => {
    if (isLoading) {
      return <Loader />
    }

    return isFileLoaderShown
      ? <FileLoader
        onExit={hideFileLoader}
        onFileSelect={onFileSelect}
        initailPath={initialPath}
      />
      : <Playlist />
  }, [isFileLoaderShown, isLoading])

  return (
    <div className='app flex flex-col h-screen relative'>
      {TopSide}

      <div className='absolute w-full bottom-0 left-0'>
        <Player ref={playerRef} />
      </div>
    </div>
  )
}

export default App
