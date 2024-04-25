import type { SHORTCUT_SUBSCRIBERS } from '@/ui/constants/shortcut/shortcutSubscribers'

export type Subscriber = typeof SHORTCUT_SUBSCRIBERS[keyof typeof SHORTCUT_SUBSCRIBERS]
