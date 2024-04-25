import type { SUPPORTED_EXTENTION } from '../constants/supportedExtention'

export type SupportedExtention =
  typeof SUPPORTED_EXTENTION[keyof typeof SUPPORTED_EXTENTION]
