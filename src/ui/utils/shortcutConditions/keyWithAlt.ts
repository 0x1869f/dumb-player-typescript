import type { SubscriptionCondition } from '@/ui/types/shortcutService/subscriptionCondition'

import { constructCondition } from './constructCondition'

export function keyWithAlt(code?: KeyboardEvent['code']): SubscriptionCondition {
  return constructCondition(['altKey'], code)
}
