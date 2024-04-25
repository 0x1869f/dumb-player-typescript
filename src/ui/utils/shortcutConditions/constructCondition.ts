import { FUNCTIONAL_KEY } from '@/ui/constants/shortcut/functionalKey'
import type { FunctionalKey } from '@/ui/types/shortcutService/functionalKey'
import type { SubscriptionCondition } from '@/ui/types/shortcutService/subscriptionCondition'

export function constructCondition(
  functionalKeys: Array<FunctionalKey>,
  code?: SubscriptionCondition['code'],
): SubscriptionCondition {
  const condition: SubscriptionCondition = Object.keys(FUNCTIONAL_KEY)
    .reduce < SubscriptionCondition >((
      result,
      key,
    ): SubscriptionCondition => {
      result[key as FunctionalKey] = functionalKeys.includes(key as FunctionalKey)

      return result
    }, {})

  if (code) {
    condition.code = code
  }

  return condition
}

