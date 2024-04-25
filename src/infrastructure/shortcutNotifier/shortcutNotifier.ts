import { EVENT_KEYS } from '@/ui/constants/shortcut/eventKeys'
import type { CallbackPayload } from '@/ui/types/shortcutService/callbackPayload'
import type { KeyboardEventPickedKeys } from '@/ui/types/shortcutService/KeyboardEventPickedKeys'
import type { ShortcutService } from '@/ui/types/shortcutService/shortcutService'
import type { Subscriber } from '@/ui/types/shortcutService/subscriber'
import type { SubscriptionCondition } from '@/ui/types/shortcutService/subscriptionCondition'
import type { SubscriptionInfo } from '@/ui/types/shortcutService/subscriptionInfo'
import { singleKey } from '@/ui/utils/shortcutConditions/singleKey'

type Subscribers = Partial<Record<
    Subscriber,
    Array<SubscriptionInfo>
  >>

type ActiveSubscribers = Set<Subscriber>
type SubscriberPreviousInventsInfo = Partial<Record<Subscriber, {
  event: KeyboardEvent
}>>

export class ShortcutNotifier implements ShortcutService {
  // eslint-disable-next-line no-use-before-define
  private static instance?: ShortcutNotifier

  private subscribers: Subscribers = {}
  private activeSubscribers: ActiveSubscribers = new Set()
  private subscribersBackup: ActiveSubscribers = new Set()
  private readonly subscriberLastEvent: SubscriberPreviousInventsInfo = {}
  private enteredNumber: string | null = null

  // eslint-disable-next-line no-useless-constructor,no-empty-function
  private constructor() {}

  static getInstance(): ShortcutNotifier {
    if (!ShortcutNotifier.instance) {
      ShortcutNotifier.instance = new ShortcutNotifier()
      ShortcutNotifier.instance.init()
    }

    return ShortcutNotifier.instance
  }

  subscribe(
    subscriber: Subscriber,
    conditions: Array<SubscriptionInfo>,
  ): void {
    this.subscribers[subscriber] = conditions
  }

  unsubscribe(subscriber: Subscriber): void {
    delete this.subscribers[subscriber]
  }

  addActive(subscriber: Subscriber): void {
    this.activeSubscribers.add(subscriber)
  }

  deleteActive(subscriber: Subscriber): void {
    this.activeSubscribers.delete(subscriber)
  }

  backupActiveSubs(): void {
    this.subscribersBackup = this.activeSubscribers
    this.activeSubscribers = new Set()
  }

  recoverActiveSubs(): void {
    this.activeSubscribers = this.subscribersBackup
    this.subscribersBackup = new Set()
  }

  stop(): void {
    window.document.body.removeEventListener('keydown', this.notify)
  }

  private init(): void {
    window.document.body.addEventListener('keydown', (event) => {
      this.notify(event)
    })
  }

  private compareLastEventByCondition(
    condition: SubscriptionCondition | Array<SubscriptionCondition>,
    event: KeyboardEvent,
  ): boolean {
    if (Array.isArray(condition)) {
      return condition.some((rule) => this.compareLastEventByCondition(rule, event))
    }

    return Object.keys(condition)
      .every((key) => {
        const obj = condition as SubscriptionCondition

        if (key === 'code' && typeof condition.code === 'object') {
          return condition.code.test(event[key])
        }

        return obj[key as KeyboardEventPickedKeys] === event[key as KeyboardEventPickedKeys]
      })
  }

  private compareLastEvent(event: KeyboardEvent, previousEvent: KeyboardEvent): boolean {
    return Object.values(EVENT_KEYS)
      .every((key) => event[key] === previousEvent[key])
  }

  private getActiveSubs(): Partial<Record<Subscriber, Array<SubscriptionInfo>>> {
    return Object.keys(this.subscribers)
      .filter(
        (key) => this.activeSubscribers.has(key as Subscriber),
      )
      .reduce((obj: Partial<Record<Subscriber, Array<SubscriptionInfo>>>, sub) => {
        obj[sub as Subscriber] = this.subscribers[sub as Subscriber]!

        return obj
      }, {})
  }

  private preparePayload(
    subscriber: Subscriber,
    condition: SubscriptionCondition | Array<SubscriptionCondition>,
    event: KeyboardEvent,
  ): CallbackPayload | null {
    const previousEventsInfo = this.subscriberLastEvent[subscriber]

    const isMatched = this.compareLastEventByCondition(condition, event)

    if (!isMatched) {
      return null
    }

    const isRepeated = previousEventsInfo?.event
      ? this.compareLastEvent(event, previousEventsInfo.event)
      : false

    this.subscriberLastEvent[subscriber] = { event }

    const payload: CallbackPayload = {
      isRepeated,
      event,
    }

    if (this.enteredNumber) {
      payload.previousNumber = parseInt(this.enteredNumber, 10)
      this.enteredNumber = null
    }

    return payload
  }

  private notify(event: KeyboardEvent): void {
    const activeSubs = this.getActiveSubs()
    let subscriberWasNotified = false

    for (const [sub, conditions] of Object.entries(activeSubs)) {
      for (const condition of conditions!) {
        const payload = this.preparePayload(sub as Subscriber, condition.condition, event)

        if (payload) {
          condition.callback(payload)
          subscriberWasNotified = true

          break
        }
      }
    }

    if (this.compareLastEventByCondition(singleKey(/Digit/u), event)
      && !subscriberWasNotified) {
      this.enteredNumber = this.enteredNumber
        ? this.enteredNumber + event.key
        : event.key
    }
  }
}
