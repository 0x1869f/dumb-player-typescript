import { create } from 'zustand'

import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'

import { getRandomInt } from '../../utils/getRandomInt'

type State = {
  files: Array<AudioFileWithMetaInfo>
  randomOrderPrevTracks: Array<AudioFileWithMetaInfo>
  randomOrderNextTracks: Array<AudioFileWithMetaInfo>
  isRandom: boolean
  currentFile: AudioFileWithMetaInfo | null
}

type Actions = {
  currentFile: AudioFileWithMetaInfo | null
  isRandom: boolean
  setFiles: (fileList: Array<AudioFileWithMetaInfo>) => void
  addFiles: (fileList: Array<AudioFileWithMetaInfo>) => void
  selectNext: () => void
  selectPrev: () => void
  moveUp: (index: number) => void
  moveDown: (index: number) => void
  deleteFile: (deletedFile: AudioFileWithMetaInfo) => void
  setCurrent: (file: AudioFileWithMetaInfo) => void
  clearFiles: () => void
  switchRandom: () => void
  setIsRandom: (value: boolean) => void
}

function chooseRandomTrack(
  files: Array<AudioFileWithMetaInfo>,
  current?: AudioFileWithMetaInfo,
): AudioFileWithMetaInfo {
  const index = getRandomInt(0, files.length - 1)
  const newFile = files.at(index)!

  if (!current) {
    return newFile
  }

  return newFile.id === current.id
    ? chooseRandomTrack(files, current)
    : newFile
}

function chooseNextTrack(
  files: Array<AudioFileWithMetaInfo>,
  currentFile: AudioFileWithMetaInfo,
) {
  const currentIndex = files.findIndex((file) => file.id === currentFile.id)
  const nextIndex = currentIndex + 1

  if (currentIndex !== -1) {
    return nextIndex < files.length
      ? files.at(nextIndex)
      : files.at(0)
  }

  return files.at(0)
}

function choosePrevTrack(
  files: Array<AudioFileWithMetaInfo>,
  currentFile: AudioFileWithMetaInfo,
) {
  const currentIndex = files.findIndex((file) => file.id === currentFile.id)
  const prevIndex = currentIndex - 1

  if (currentIndex !== -1) {
    return prevIndex < 0
      ? files.at(-1)
      : files.at(prevIndex)
  }

  return files.at(0)
}

export const usePlaylistStore = create<State & Actions>((set) => ({
  isRandom: false,
  currentFile: null,
  files: [],
  randomOrderPrevTracks: [],
  randomOrderNextTracks: [],

  setFiles: (fileList) => {
    set({
      files: fileList,
      randomOrderPrevTracks: [],
      randomOrderNextTracks: [],
    })
  },

  addFiles: (fileList) => {
    set((state) => ({ files: [...state.files, ...fileList] }))
  },

  setCurrent: (file: AudioFileWithMetaInfo) => {
    set({
      currentFile: file,
      randomOrderNextTracks: [],
      randomOrderPrevTracks: [],
    })
  },

  clearFiles: () => {
    set(() => ({
      files: [],
      randomOrderPrevTracks: [],
      randomOrderNextTracks: [],
    }))
  },

  moveUp: (index: number) => {
    set((state) => {
      if (index > 0) {
        const prevIndex = index - 1
        const file = state.files[index]
        const prev = state.files[prevIndex]

        const newFileList = [
          ...state.files.slice(0, prevIndex),
          file,
          prev,
          ...state.files.slice(index + 1),
        ] as Array<AudioFileWithMetaInfo>

        return { files: newFileList }
      }

      return { files: state.files }
    })
  },

  moveDown: (index: number) => {
    set((state) => {
      if (index < state.files.length - 1) {
        const nextIndex = index + 1
        const file = state.files[index]
        const next = state.files[nextIndex]

        const newFileList = [
          ...state.files.slice(0, index),
          next,
          file,
          ...state.files.slice(nextIndex + 1),
        ] as Array<AudioFileWithMetaInfo>

        return { files: newFileList }
      }

      return { files: state.files }
    })
  },

  selectNext: () => {
    set((state) => {
      if (!state.files.length) {
        return {}
      }

      if (state.isRandom) {
        if (state.randomOrderNextTracks.length) {
          const next = state.randomOrderNextTracks.at(-1)
          const rest = state.randomOrderNextTracks
            .slice(0, state.randomOrderNextTracks.length - 1)

          return {
            // eslit-disable-next-line
            randomOrderPrevTracks: [
              ...state.randomOrderPrevTracks,
              state.currentFile
            ] as Array<AudioFileWithMetaInfo>,
            randomOrderNextTracks: rest,
            currentFile: next,
          }
        }

        const next = state.currentFile
          ? chooseRandomTrack(state.files, state.currentFile)
          : chooseRandomTrack(state.files)

        return {
          randomOrderPrevTracks: [...state.randomOrderPrevTracks, state.currentFile] as Array<AudioFileWithMetaInfo>,
          currentFile: next,
        }
      }

      // window.electron.notifyNextTrack(file?.fullPath || '')
      const newFile = state.currentFile
        ? chooseNextTrack(state.files, state.currentFile)
        : state.files[0]

      return { currentFile: newFile }
    })
  },

  selectPrev: () => {
    set((state) => {
      if (!state.files.length) {
        return {}
      }

      if (state.isRandom) {
        if (state.randomOrderPrevTracks.length) {
          const nextToPlay = state.randomOrderPrevTracks.at(-1)
          const rest = state.randomOrderPrevTracks
            .slice(0, state.randomOrderPrevTracks.length - 1)

          return {
            randomOrderNextTracks: [...state.randomOrderNextTracks, state.currentFile] as Array<AudioFileWithMetaInfo>,
            randomOrderPrevTracks: rest,
            currentFile: nextToPlay,
          }
        }

        const next = state.currentFile
          ? chooseRandomTrack(state.files, state.currentFile)
          : chooseRandomTrack(state.files)

        return {
          randomOrderNextTracks: [...state.randomOrderNextTracks, state.currentFile] as Array<AudioFileWithMetaInfo>,
          currentFile: next,
        }
      }

      const newFile = state.currentFile
        ? choosePrevTrack(state.files, state.currentFile)
        : state.files[0]

      return { currentFile: newFile }

      // window.electron.notifyNextTrack(file?.fullPath || '')
    })
  },

  deleteFile: (deletedFile: AudioFileWithMetaInfo) => {
    set((state) => {
      const index = state.files.findIndex((file) => file.id === deletedFile.id)

      if (index > -1) {
        const file = state.files.at(index)!

        const newFilesList = [...state.files.slice(0, index), ...state.files.slice(index + 1)]

        return {
          files: newFilesList,
          randomOrderPrevTracks: state.randomOrderPrevTracks
            .filter((track) => track.id !== file.id),
          randomOrderNextTracks: state.randomOrderNextTracks
            .filter((track) => track.id !== file.id),
        }
      }

      return { files: state.files }
    })
  },

  switchRandom: () => {
    set((state) => {
      if (state.isRandom) {
        return {
          randomOrderNextTracks: [],
          randomOrderPrevTracks: [],
          isRandom: false,
        }
      }

      return { isRandom: true }
    })
  },

  setIsRandom: (value: boolean) => {
    set({ isRandom: value })
  },
}))
