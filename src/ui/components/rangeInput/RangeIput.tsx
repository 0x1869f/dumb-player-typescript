import './RangeInput.css'

type Props = {
  value: number
  max: number
  min: number
  step: number
  onChange: (e: number) => void 
  className: string
}

export function RangeInput({
  onChange,
  value,
  min,
  max,
  step,
  className,
}: Props) {
  return <input
    className={className}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    type="range"
    step={step}
    max={max}
    min={min}
  />
}
