import type { SubscriptionCondition } from '@/ui/types/shortcutService/subscriptionCondition'

import { constructCondition } from './constructCondition'

export function singleKey(code?: SubscriptionCondition['code']): SubscriptionCondition {
  return constructCondition([], code)
}
