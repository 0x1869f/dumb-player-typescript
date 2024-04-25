import type { SubscriptionCondition } from './subscriptionCondition'
import type { SubscriptionFunction } from './subscriptionFunction'

export type SubscriptionInfo = {
  callback: SubscriptionFunction
  condition: SubscriptionCondition | Array<SubscriptionCondition>
}

