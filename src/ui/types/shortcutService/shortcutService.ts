import type { Subscriber } from './subscriber'
import type { SubscriptionInfo } from './subscriptionInfo'

export interface ShortcutService {
  subscribe: (
    subscriber: Subscriber,
    conditions: Array<SubscriptionInfo>,
  ) => void

  unsubscribe: (subscriber: Subscriber) => void

  addActive: (subscriber: Subscriber) => void

  deleteActive: (subscriber: Subscriber) => void

  backupActiveSubs: () => void

  recoverActiveSubs: () => void

  stop: () => void
}
