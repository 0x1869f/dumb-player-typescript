import type { ReactNode } from 'react'

type Props = {
  value: string
  className?: string
}
export function Chip({ value, className }: Props): ReactNode {
  const style = `rounded h-10 px-2 flex items-center justify-content-center
    tracking-[.25em] ${className}`

  return <div className={style}>
    {value}
  </div>
}
