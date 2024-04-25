import {
  useEffect, useMemo, useRef, useState,
} from 'react'
import { type ReactNode } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'

import { ShortcutNotifier } from '@/infrastructure/shortcutNotifier/shortcutNotifier'

import { SHORTCUT_SUBSCRIBERS } from '@/ui/constants/shortcut/shortcutSubscribers'
import { useEvent } from '@/ui/hooks/useEvent'
import { keyWithAlt } from '@/ui/utils/shortcutConditions/keyWithAlt'
import { keyWithControl } from '@/ui/utils/shortcutConditions/keyWithControl'
import { keyWithShift } from '@/ui/utils/shortcutConditions/keyWithShift'
import { singleKey } from '@/ui/utils/shortcutConditions/singleKey'

import type { BashInputStore } from './generateBashInputStore'

type Props = {
  store: UseBoundStore<StoreApi<BashInputStore>>
  background?: string
}

const SPACE = ' '

export const BashInput = ({ store }: Props): ReactNode => {
  const bufferRef = useRef('')

  const setValue = store((state) => state.setValue)
  const value = store((state) => state.value)
  const hide = store((state) => state.hide)
  const clear = store((state) => state.clear)
  const history = store((state) => state.history)
  const addToHistory = store((state) => state.addToHistory)
  const historyPosition = useRef<number | null>(null)
  const inputBeforeHistoryScroll = useRef<string>(SPACE)

  const [inputValue, setInputValue ] = useState(`${value}${SPACE}`)

  useEffect(() => {
    setValue(inputValue.trim())
  }, [inputValue])

  const [cursorPostion, setCursorPostion] = useState<number>(
    inputValue.length > 1 ? inputValue.length - 1 : 0,
  )

  function addChar(characters: string, position: number): void {
    setInputValue(inputValue.slice(0, position) + characters + inputValue.slice(position))
  }

  const deleteCharBeforeCursor = useEvent(() => {
    if (cursorPostion > 0) {
      setInputValue(inputValue.slice(0, cursorPostion - 1)
        + inputValue.slice(cursorPostion))
      setCursorPostion((oldValue) => oldValue > 0 ? oldValue - 1 : 0)
    }
  })

  const deleteCharOnCursor = useEvent(() => {
    if (cursorPostion < inputValue.length - 1) {
      setInputValue(inputValue.slice(0, cursorPostion)
        + inputValue.slice(cursorPostion + 1))
    }
  })

  const pasteToCursorPosition = useEvent((characters: string): void => {
    addChar(characters, cursorPostion)

    setCursorPostion((value) => characters.length + value)
  })

  const pasteFromBuffer = useEvent(() => {
    pasteToCursorPosition(bufferRef.current)
  })

  const cutBeforeCursorPostion = useEvent(() => {
    bufferRef.current = inputValue.slice(0, cursorPostion)
    setInputValue(inputValue.slice(cursorPostion))
    setCursorPostion(0)
  })

  const cutFromCursorPostion = useEvent(() => {
    bufferRef.current = inputValue.slice(cursorPostion, -1)
    setInputValue(`${inputValue.slice(0, cursorPostion)} `)
  })

  const moveCursorBack = useEvent(() => {
    setCursorPostion((oldValue) => oldValue > 0 ? oldValue - 1 : 0)
  })

  const jumpForward = useEvent((): void => {
    const cursor = cursorPostion
    const input = inputValue

    if (!input.length || cursor === input.length - 1) {
      return
    }

    let spaceWasMet: boolean = false
    let charWasMet: boolean = false
    let endPostion = cursor + 1

    while ((!spaceWasMet || !charWasMet) && endPostion < input.length - 1) {
      if (!charWasMet) {
        if (input[endPostion] !== ' ') {
          charWasMet = true
        }
      }
      else if (input[endPostion] === ' ') {
        spaceWasMet = true
      }

      if (!spaceWasMet) {
        endPostion += 1
      }
    }

    setCursorPostion(() => endPostion)
  })

  const jumpBackward = useEvent((): void => {
    const cursor = cursorPostion
    const input = inputValue

    if (!cursor || !input.length) {
      return
    }

    let spaceWasMet: boolean = false
    let charWasMet: boolean = false
    let startPostion = cursor - 1

    while ((!spaceWasMet || !charWasMet) && startPostion > 0) {
      if (!charWasMet) {
        if (input[startPostion] !== ' ') {
          charWasMet = true
        }
      }
      else if (input[startPostion] === ' ') {
        spaceWasMet = true
        startPostion += 1
      }

      if (!spaceWasMet && startPostion > 0) {
        startPostion -= 1
      }
    }

    setCursorPostion(() => startPostion)
  })

  const cutToWordStart = useEvent((isRepeted: boolean): void => {
    const cursor = cursorPostion
    const input = inputValue

    if (!cursor || !input.length) {
      return
    }

    let spaceWasMet: boolean = false
    let charWasMet: boolean = false
    let startPostion = cursor - 1

    while ((!spaceWasMet || !charWasMet) && startPostion > 0) {
      if (!charWasMet) {
        if (input[startPostion] !== ' ') {
          charWasMet = true
        }
      }
      else if (input[startPostion] === ' ') {
        spaceWasMet = true
        startPostion += 1
      }

      if (!spaceWasMet && startPostion > 0) {
        startPostion -= 1
      }
    }

    const cutValue = input.slice(startPostion, cursor)

    bufferRef.current = isRepeted
      ? cutValue + bufferRef.current
      : cutValue

    setInputValue(input.slice(0, startPostion) + input.slice(cursor))
    setCursorPostion(() => startPostion)
  })

  const jumpToTheEnd = useEvent(() => {
    setCursorPostion(inputValue.length - 1)
  })

  function jumpToTheStart() {
    setCursorPostion(0)
  }

  const moveCursorForward = useEvent(() => {
    setCursorPostion((oldValue) => oldValue + 1 < inputValue.length - 1
      ? oldValue + 1
      : inputValue.length - 1)
  })

  const clearAndClose = () => {
    clear()
    hide()
  }

  const saveAndClose = useEvent(() => {
    const trimedValue = inputValue.trim()

    if (trimedValue.trim().length && trimedValue !== history.at(-1)) {
      addToHistory(trimedValue)
    }

    hide()
  })

  const historyPrev = useEvent(() => {
    if (!history.length || historyPosition.current === 0) {
      return
    }

    let newInputValue = SPACE

    if (historyPosition.current) {
      historyPosition.current -= 1
      newInputValue = history.at(historyPosition.current)! + SPACE
    }
    else {
      historyPosition.current = history.length - 1
      inputBeforeHistoryScroll.current = inputValue
      newInputValue = history.at(-1)! + SPACE
    }

    setInputValue(newInputValue)
    setCursorPostion(newInputValue.length - 1)
  })

  const historyNext = useEvent(() => {
    if (!history.length || historyPosition.current === null) {
      return
    }

    let newInputValue = ' '

    if (historyPosition.current < history.length - 1) {
      historyPosition.current += 1
      newInputValue = history.at(historyPosition.current)! + SPACE
    }
    else {
      newInputValue = inputBeforeHistoryScroll.current
      inputBeforeHistoryScroll.current = SPACE
      historyPosition.current = null
    }

    setInputValue(newInputValue)
    setCursorPostion(() => newInputValue.length - 1)
  })

  useEffect(() => {
    const shortcutNotifer = ShortcutNotifier.getInstance()

    shortcutNotifer.backupActiveSubs()
    shortcutNotifer.subscribe(SHORTCUT_SUBSCRIBERS.filter, [
      {
        condition: { key: 'Enter' },
        callback: saveAndClose,
      },
      {
        condition: keyWithControl('KeyF'),
        callback: moveCursorForward,
      },
      {
        condition: singleKey('ArrowRight'),
        callback: moveCursorForward,
      },
      {
        condition: singleKey('ArrowLeft'),
        callback: moveCursorBack ,
      },
      {
        condition: keyWithControl('KeyB'),
        callback: moveCursorBack,
      },
      {
        condition: keyWithControl('ArrowRight'),
        callback: jumpForward,
      },
      {
        condition: keyWithAlt('KeyF'),
        callback: jumpForward,
      },
      {
        condition: keyWithControl('ArrowLeft'),
        callback: jumpBackward,
      },
      {
        condition: keyWithAlt('KeyB'),
        callback: jumpBackward,
      },
      {
        condition: keyWithControl('KeyC'),
        callback: clearAndClose,
      },
      {
        condition: singleKey('Escape'),
        callback: clearAndClose,
      },
      {
        condition: keyWithControl('KeyW'),
        callback: (payload) => {
          cutToWordStart(payload.isRepeated)
          payload.event.preventDefault()
        },
      },
      {
        condition: keyWithControl('KeyY'),
        callback: pasteFromBuffer,
      },
      {
        condition: keyWithControl('KeyK'),
        callback: cutFromCursorPostion,
      },
      {
        condition: keyWithControl('KeyA'),
        callback: jumpToTheStart,
      },
      {
        condition: singleKey('Delete'),
        callback: deleteCharOnCursor,
      },
      {
        condition: keyWithControl('KeyD'),
        callback: deleteCharOnCursor,
      },
      {
        condition: singleKey('Backspace'),
        callback: deleteCharBeforeCursor,
      },
      {
        condition: keyWithControl('KeyH'),
        callback: deleteCharBeforeCursor,
      },
      {
        condition: keyWithControl('KeyE'),
        callback: jumpToTheEnd,
      },
      {
        condition: keyWithControl('KeyU'),
        callback: cutBeforeCursorPostion,
      },
      {
        condition: keyWithControl('KeyP'),
        callback: historyPrev,
      },
      {
        condition: keyWithControl('KeyN'),
        callback: historyNext,
      },
      {
        condition: [
          singleKey(/Digit|Key|Space|Equal|Minus|Period|Comma/u),
          keyWithShift(/Digit|Key|Equal|Minus/u)
        ],
        callback: (payload) => {
          pasteToCursorPosition(payload.event.key)
        },
      },
    ])
    shortcutNotifer.addActive(SHORTCUT_SUBSCRIBERS.filter)

    return () => {
      shortcutNotifer.unsubscribe(SHORTCUT_SUBSCRIBERS.filter)
      shortcutNotifer.recoverActiveSubs()
    }
  }, [])

  const bashInput = useMemo((): ReactNode => {
    const containerStyle = `search-input w-full flex items-center search-input
      pl-2 ma-0 h-10 max-w-full bg-gray-700 border-0 text-lg font-medium text-white`

    const result = []

    const elementStyle = 'flex items-center justify-center h-6 w-3 '
    const cursorStyle = 'bg-green-500'

    for (let index = 0; index < inputValue.length; index++) {
      const charStyle = index === cursorPostion
        ? `${elementStyle} ${cursorStyle}`
        : elementStyle

      result.push(<div key={index} className={charStyle}>{inputValue[index]}</div>)
    }

    return <div className={containerStyle}>
      {result}
    </div>
  }, [cursorPostion, inputValue])

  return bashInput
}
