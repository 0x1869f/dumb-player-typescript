import type { Writable } from '@/domain/utilityTypes/writable'

import type { KeyboardEventPickedKeys } from './KeyboardEventPickedKeys'

export type SubscriptionCondition = Partial<Writable<Omit<
  Pick<KeyboardEvent, KeyboardEventPickedKeys>, 'code'>>> & {
  code?: KeyboardEvent['code'] | RegExp
}

