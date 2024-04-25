import { getTimePeriods } from '../utils/getTimePeriods'

type Props = {
  seconds: number,
  className?: string
}

function getTimeString(time: number): string {
  return time < 10
    ? `0${time}`
    : time.toString()
}

export function Duration ({seconds, className}: Props) {
  const duration = getTimePeriods (seconds)
  return duration.hours
    ? <span className={className}>
      {duration.hours}:{getTimeString(duration.minutes)}:{getTimeString(duration.seconds)}
    </span>
    : <span className={className}>
      {getTimeString(duration.minutes)}:{getTimeString(duration.seconds)}
    </span>
}
