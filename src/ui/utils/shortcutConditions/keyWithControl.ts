import type { SubscriptionCondition } from '@/ui/types/shortcutService/subscriptionCondition'

import { constructCondition } from './constructCondition'

export function keyWithControl(code?: SubscriptionCondition['code']): SubscriptionCondition {
  return constructCondition(['ctrlKey'], code)
}
