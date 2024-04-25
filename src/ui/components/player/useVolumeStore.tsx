import { create } from 'zustand'

const MAX_VOLUME = 1
const MIN_VOLUME = 0
const VOLUME_STEP = 0.05
const DEFAULT_VOLUME = 0.2

type State = {
  volume: number
  isMuted: boolean
}

type Actions = {
  setIsMuted: (value: boolean) => void
  switchMute: () => void
  setVolume: (value: number) => void
  decreaseVolume: () => void
  increaseVolume: () => void
  decreaseVolumeDouble: () => void
  increaseVolumeDouble: () => void
}

const calculateIncreasedVolume = (volume: number, step: number): number => {
  if (volume < MAX_VOLUME) {
    return volume + step > MAX_VOLUME
      ? MAX_VOLUME
      : volume + step
  }

  return volume
}

const calculateDecreasedVolume = (volume: number, step: number): number => {
  if (volume > MIN_VOLUME) {
    return volume - step > MIN_VOLUME
      ? volume - step
      : MIN_VOLUME
  }

  return volume
}

export const useVolumeStore = create<State & Actions>((set) => ({
  volume: DEFAULT_VOLUME,
  isMuted: false,

  setVolume: (value: number) => {
    set({ volume: value })
  },

  increaseVolume: () => {
    set((state) => (
      { volume: calculateIncreasedVolume(state.volume, VOLUME_STEP) }))
  },
  increaseVolumeDouble: () => {
    set((state) => ({ volume: calculateIncreasedVolume(state.volume, VOLUME_STEP * 2) }))
  },

  decreaseVolume: () => {
    set((state) => ({ volume: calculateDecreasedVolume(state.volume, VOLUME_STEP) }))
  },
  decreaseVolumeDouble: () => {
    set((state) => ({ volume: calculateDecreasedVolume(state.volume, VOLUME_STEP * 2) }))
  },

  switchMute: () => {
    set((state) => ({ isMuted: !state.isMuted }))
  },

  setIsMuted: (value: boolean) => {
    set({ isMuted: value })
  },
}))
