import {
  Music,Pause, Play, Shuffle,
  SkipBack, SkipForward, Volume, VolumeX,
} from 'lucide-react'
import {
  forwardRef,
  useEffect, useImperativeHandle, useMemo, useState,
} from 'react'

import type { AudioFileWithMetaInfo } from
  '@/domain/types/audioFileWithMetaInfo'

import { ShortcutNotifier } from '@/infrastructure/shortcutNotifier/shortcutNotifier'

import { SHORTCUT_SUBSCRIBERS } from '@/ui/constants/shortcut/shortcutSubscribers'
import { useEvent } from '@/ui/hooks/useEvent'
import { useStateRef } from '@/ui/hooks/useStateRef'
import { keyWithShift } from '@/ui/utils/shortcutConditions/keyWithShift'
import { singleKey } from '@/ui/utils/shortcutConditions/singleKey'

import { useDecoder } from '../../hooks/useDecoder'
import { Duration } from '../Duration'
import { Image } from '../Image'
import { usePlaylistStore } from '../playlist/usePlaylistStore'
import { RangeInput } from '../rangeInput/RangeIput'
import { useVolumeStore } from './useVolumeStore'

const REWIND_STEP = 5000
const MILLISECONDS_IN_SECOND = 1000

const audioContext = new AudioContext()
const gain = audioContext.createGain()
let source = audioContext.createBufferSource()
let audioBuffer: AudioBuffer | null = null

gain.connect(audioContext.destination)
source.connect(gain)
let controller = new AbortController()

/* eslint-disable react/display-name */
// @ts-expect-error
export const Player = forwardRef((props, ref) => {
  const [
    doesPlay,
    setDoesPlay,
    doesPlayRef,
  ] = useStateRef<boolean>(false)
  const [
    startTime,
    setStartTime,
    startTimeRef,
  ] = useStateRef<number>(0)
  const [
    currentTime,
    setCurrentTime,
    currentTimeRef,
  ] = useStateRef<number>(0)
  const [lastPosition, setLastPosition] = useState<number>(0)
  const [imageUrl, setImageUrl] = useState<string>('')

  const file = usePlaylistStore((state) => state.currentFile)
  const isRandom = usePlaylistStore((state) => state.isRandom)
  const switchRandom = usePlaylistStore((state) => state.switchRandom)
  const selectNext = usePlaylistStore((state) => state.selectNext)
  const selectPrev = usePlaylistStore((state) => state.selectPrev)

  const volume = useVolumeStore((state) => state.volume)
  const isMuted = useVolumeStore((state) => state.isMuted)
  const switchMute = useVolumeStore((state) => state.switchMute)
  const setVolume = useVolumeStore((state) => state.setVolume)
  const increaseVolume = useVolumeStore((state) => state.increaseVolume)
  const increaseVolumeDouble = useVolumeStore(
    (state) => state.increaseVolumeDouble,
  )
  const decreaseVolume = useVolumeStore((state) => state.decreaseVolume)
  const decreaseVolumeDouble = useVolumeStore((state) => state.decreaseVolumeDouble)

  const decoder = useDecoder()

  function time() {
    return new Date().getTime()
  }

  function calculatePosition(current: number, start: number): number {
    return current - start
  }

  const currentPosition: number = useMemo(
    () => calculatePosition(currentTime, startTime)
    ,
    [currentTime, startTime],
  )

  function handleOnStop() {
    setDoesPlay(false)
    selectNext()
    setLastPosition(0)
  }

  const stop = () => {
    setDoesPlay(false)
    controller.abort()
    const last = calculatePosition(currentTimeRef.current, startTimeRef.current)

    setLastPosition(last)
    try {
      source.stop()
    }
    catch {
      //
    }

    return last
  }

  function play(position: number) {
    if (!audioBuffer) {
      return
    }

    setDoesPlay(true)
    controller = new AbortController()
    source = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer })
    source.connect(gain)
    source.start(0, position)
    source.addEventListener('ended', handleOnStop, { signal: controller.signal })
  }

  const stopOrPlay = useEvent(() => {
    if (doesPlayRef.current) {
      stop()
    }
    else {
      setStartTime(currentTimeRef.current - lastPosition)
      setCurrentTime(time())
      play(lastPosition / MILLISECONDS_IN_SECOND)
    }
  })

  const playOrStop = () => {
    if (doesPlay) {
      stop()
    }
    else {
      setStartTime(currentTimeRef.current - lastPosition)
      setCurrentTime(time())
      play(lastPosition / MILLISECONDS_IN_SECOND)
    }
  }

  const rewindForward = useEvent(() => {
    if (!audioBuffer) {
      return
    }

    const last = stop()
    const trackTime = last + REWIND_STEP

    setStartTime(time() - trackTime)
    setCurrentTime(time())
    play(trackTime / MILLISECONDS_IN_SECOND)
  })

  function rewindToPosition(position: number) {
    if (!audioBuffer) {
      return
    }

    stop()
    setStartTime(time() - (position * MILLISECONDS_IN_SECOND))
    setCurrentTime(time())
    play(position)
  }

  const rewindBackward = useEvent(() => {
    if (!audioBuffer) {
      return
    }

    const current = stop()

    if (current > REWIND_STEP) {
      const trackTime = current - REWIND_STEP

      setStartTime(time() - trackTime)
      play(Math.floor(trackTime / MILLISECONDS_IN_SECOND))
    }
    else {
      setCurrentTime(time())
      setStartTime(time())
      play(0)
    }
  })

  async function loadBuffer(newFile: AudioFileWithMetaInfo) {
    const buffer = await window.electron.readAudioFile(newFile.fullPath)
    const {
      channelData, samplesDecoded, sampleRate,
    } = await decoder(
      buffer,
      newFile.extention,
      newFile.metaInfo.container,
    )

    audioBuffer = audioContext.createBuffer(channelData.length, samplesDecoded, sampleRate)
    channelData.forEach((data, idx) => {
      audioBuffer?.getChannelData(idx).set(data)
    })
  }

  useEffect(
    () => {
      if (isMuted) {
        gain.gain.value = 0
      }
      else {
        gain.gain.value = volume
      }
    },
    [volume, isMuted],
  )

  useEffect(
    () => {
      if (file) {
        loadBuffer(file).then(() => {
          stop()
          setLastPosition(0)
          setStartTime(time())
          setCurrentTime(time())
          play(0)
        })

        if (imageUrl) {
          URL.revokeObjectURL(imageUrl)
          setImageUrl('')
        }

        if (file.metaInfo.image) {
          const url = URL.createObjectURL(new Blob([file.metaInfo.image]))

          setImageUrl(url)
        }
      }

      return () => {
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl)
        }
      }
    },
    [file],
  )

  const playTime = useMemo(() => doesPlay
    ? Math.floor(currentPosition / MILLISECONDS_IN_SECOND)
    : Math.floor(lastPosition / MILLISECONDS_IN_SECOND),
  [
    doesPlay,
    currentPosition,
    lastPosition,
  ])

  function PlayTime() {
    return <Duration seconds={playTime} />
  }

  const image = useMemo(() => {
    if (imageUrl) {
      return <Image className='rounded w-14 h-14' url={imageUrl} />
    }

    return file
      ? <Music className='w-12 h-12 opacity-20 rounded bg-gray-500 p-1' />
      : <div className="w-14 h-14"></div>
  }, [file, imageUrl])

  const trackDuration = useMemo(() => file?.metaInfo.duration
    ? Math.floor(file.metaInfo.duration)
    : 0
  , [file])

  const TrackInfo = useMemo(() => {
    if (file?.metaInfo.artist && file.metaInfo.title) {
      return <div className='flex flex-col justify-center'>
        <span className='text-sm'>
          {file.metaInfo.artist}
        </span>
        <span className='text-purple-300'>
          {file.metaInfo.title}
        </span>
      </div>
    }

    return <div className='flex items-center'>
      {file?.name ?? ''}
    </div>
  }, [file])

  const clearPositionAndPlayNext = useEvent(() => {
    stop()
    setLastPosition(0)
    selectNext()
  })

  const playPrev = () => {
    stop()
    setLastPosition(0)
    selectPrev()
  }

  const playNext = () => {
    stop()
    setLastPosition(0)
    selectNext()
  }

  const clearPositionAndPlayPrev = useEvent(() => {
    stop()
    setLastPosition(0)
    selectPrev()
  })

  const Controls = useMemo(() => {
    const playOrPause = doesPlay
      ? <Pause />
      : <Play />

    const buttonClass = `bg-transparent rounded border-none 
      text-white`

    return <div className="flex gap-1 justify-center">
      <button className={buttonClass} onClick={playPrev}>
        <SkipBack />
      </button>

      <button className={buttonClass} onClick={playOrStop}>
        {playOrPause}
      </button>

      <button className={buttonClass} onClick={playNext}>
        <SkipForward />
      </button>
    </div>
  }, [doesPlay])

  const volumeButton = useMemo(() => {
    const buttonClass = 'bg-transparent rounded border-none text-white'
    const icon = isMuted
      ? <VolumeX />
      : <Volume />

    return <button className={buttonClass} onClick={() => switchMute}>
      {icon}
    </button>
  }, [isMuted])

  useImperativeHandle(ref, () => ({
    stopOrResume: () => {
      stopOrPlay()
    },
  }))

  const shuffle = useMemo(() => {
    let buttonClass = 'bg-transparent rounded border-none text-white'
    let iconClass = isRandom
      ? 'text-green-500'
      : ''

    return <button className={buttonClass} onClick={switchRandom}>
      <Shuffle className={iconClass} />
    </button>
  }, [isRandom])

  useEffect(() => {
    const shortcutNotifier = ShortcutNotifier.getInstance()

    shortcutNotifier.subscribe(SHORTCUT_SUBSCRIBERS.player, [
      {
        condition: singleKey('KeyN'),
        callback: clearPositionAndPlayNext,
      },
      {
        condition: singleKey('KeyC'),
        callback: stopOrPlay,
      },
      {
        condition: keyWithShift('KeyL'),
        callback: rewindForward,
      },
      {
        condition: keyWithShift('KeyH'),
        callback: rewindBackward,
      },
      {
        condition: singleKey('Equal'),
        callback: increaseVolume,
      },
      {
        condition: keyWithShift('Equal'),
        callback: increaseVolumeDouble,
      },
      {
        condition: singleKey('Minus'),
        callback: decreaseVolume,
      },
      {
        condition: singleKey('KeyM'),
        callback: switchMute,
      },
      {
        condition: singleKey('KeyR'),
        callback: switchRandom,
      },
      {
        condition: keyWithShift('Minus'),
        callback: decreaseVolumeDouble,
      },
      {
        condition: singleKey('KeyP'),
        callback: clearPositionAndPlayPrev,
      },
    ])
    shortcutNotifier.addActive(SHORTCUT_SUBSCRIBERS.player)

    return () => {
      shortcutNotifier.deleteActive(SHORTCUT_SUBSCRIBERS.player)
      shortcutNotifier.unsubscribe(SHORTCUT_SUBSCRIBERS.player)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(time())
    }, 500)

    return () => {
      clearInterval(id)
      try {
        source.stop()
      }
      catch {
        //
      }
    }
  }, [])

  return (
    <div className='p-4 flex items-center justify-between gap-2 border-solid border-0 border-t-2 border-gray-500/20'>
      <div className='flex gap-2 min-w-60'>
        {image}
        {TrackInfo}
      </div>

      <div>
        <div className='flex gap-1'>
          <PlayTime />

          <RangeInput
            className='w-48'
            onChange={rewindToPosition}
            value={playTime}
            step={1}
            min={0}
            max={trackDuration}
          />
          <Duration seconds={trackDuration} />
        </div>

        {Controls}
      </div>

      <div className='flex gap-1 items-center'>
        {shuffle}
        {volumeButton}
        <RangeInput
          className='w-20'
          onChange={setVolume}
          value={volume}
          step={0.01}
          min={0}
          max={1}
        />
        <span>{(volume * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
})
