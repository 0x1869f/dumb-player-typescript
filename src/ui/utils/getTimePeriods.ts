const SECONDS_IN_MINUTE = 60
const SECONDS_IN_HOUR = 60 * 60

type DurationInfo = {
  hours: number
  minutes: number
  seconds: number
}

export function getTimePeriods(seconds: number): DurationInfo {
  const duration: DurationInfo = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }

  const hours = seconds / SECONDS_IN_HOUR

  if (hours >= 1) {
    duration.hours = Math.floor(hours)
    seconds -= duration.hours * SECONDS_IN_HOUR
  }

  const minutes = seconds / SECONDS_IN_MINUTE

  if (minutes >= 1) {
    duration.minutes = Math.floor(minutes)
    seconds -= duration.minutes * SECONDS_IN_MINUTE
  }

  duration.seconds = seconds

  return duration
}
