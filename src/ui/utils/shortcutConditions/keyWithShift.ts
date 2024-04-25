import type { SubscriptionCondition } from '@/ui/types/shortcutService/subscriptionCondition'

import { constructCondition } from './constructCondition'

export function keyWithShift(code?: SubscriptionCondition['code']): SubscriptionCondition {
  return constructCondition(['shiftKey'], code)
}
