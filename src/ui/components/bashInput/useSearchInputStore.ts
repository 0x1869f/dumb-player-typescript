import { create } from 'zustand'

type State = {
  value: string
  isShown: boolean
}

type Actions = {
  clear: () => void
  show: () => void
  hide: () => void
  setValue: (newValue: string) => void
}

export const useSearchInputStore = create<State & Actions>((set) => ({
  value: '',
  isShown: false,
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
}))
