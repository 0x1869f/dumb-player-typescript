import type { FunctionalKey } from '@/ui/types/shortcutService/functionalKey'

export const FUNCTIONAL_KEY: Record<FunctionalKey, FunctionalKey> = {
  altKey: 'altKey',
  ctrlKey: 'ctrlKey',
  shiftKey: 'shiftKey',
  metaKey: 'metaKey',
} as const
