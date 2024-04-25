import { useCallback, useLayoutEffect, useRef } from 'react'

// The useEvent API has not yet been added to React,
// so this is a temporary shim to make this sandbox work.
// You're not expected to write code like this yourself.

// export function useEvent<T extends (...args: any) => any>(fn: T) {
//   const ref = useRef<T | null>(null)
//
//   useInsertionEffect(() => {
//     ref.current = fn
//   }, [fn])
//
//   return useCallback((...args: Parameters<T>) => {
//     const f = ref.current
//
//     return f!(...args)
//   }, [])
// }
/* eslint-disable */
// https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#internal-implementation
export function useEvent<T extends (...args: any[]) => any>(handler: T) {
  const handlerRef = useRef<T | null>(null)

  useLayoutEffect(() => {
    handlerRef.current = handler
  });

  return useCallback((...args: any[]) => {
    const fn = handlerRef.current;
    return fn!(...args);
  }, []);
}
