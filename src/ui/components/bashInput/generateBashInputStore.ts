import { create } from 'zustand'

type State = {
  value: string
  isShown: boolean
  history: Array<string>
}

type Actions = {
  clear: () => void
  show: () => void
  hide: () => void
  setValue: (newValue: string) => void
  addToHistory: (value: string) => void
}

export type BashInputStore = State & Actions

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const generateBashImputStore = () => create<BashInputStore>((set) => ({
  value: '',
  isShown: false,
  history: [],

  clear: () => {
    set({ value: '' })
  },
  show: () => {
    set({ isShown: true })
  },
  hide: () => {
    set({ isShown: false })
  },
  setValue: (newValue) => {
    set({ value: newValue })
  },

  addToHistory: (value) => {
    set((state) => ({ history: [...state.history, value] }))
  },
}))
