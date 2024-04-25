import * as mousetrap from 'mousetrap'
import { useEffect, useRef } from 'react'

/**
 * Use mousetrap hook
 *
 * @param  {(string | string[])} handlerKey - A key, key combo or array of combos according to Mousetrap documentation.
 * @param  { function } handlerCallback - A function that is triggered on key combo catch.
 * @param  { string } evtType - A string that specifies the type of event to listen for. It can be 'keypress', 'keydown' or 'keyup'.
 */
type EventType = 'keypress' | 'keydown' | 'keyup'

type HandlerCallback = (evt: mousetrap.ExtendedKeyboardEvent, combo: string) => void

export function useTrap(
  handlerKey: string | Array<string>,
  handlerCallback: HandlerCallback,
  evtType: EventType = 'keypress',
) {
  let actionRef = useRef<HandlerCallback>(null)
  // @ts-expect-error

  actionRef.current = handlerCallback

  useEffect(() => {
    mousetrap.bind(handlerKey, (evt: mousetrap.ExtendedKeyboardEvent, combo: string) => {
      typeof actionRef.current === 'function' && actionRef.current(evt, combo)
    }, evtType)

    return () => {
      mousetrap.unbind(handlerKey)
    }
  }, [handlerKey])

  return () => {
    mousetrap.unbind(handlerKey)
  }
}
