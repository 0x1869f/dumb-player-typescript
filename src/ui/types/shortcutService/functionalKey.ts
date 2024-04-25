import type { KeysByType } from '@/domain/utilityTypes/keysByType'

import type { SubscriptionCondition } from './subscriptionCondition'

export type FunctionalKey = KeysByType<Required<SubscriptionCondition>, boolean>
