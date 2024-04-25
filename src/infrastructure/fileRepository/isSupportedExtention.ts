import { extname } from 'node:path'

import type { SupportedExtention } from '@/domain/types/supportedExtention'

import { SUPPORTED_EXTENTION } from '../../domain/constants/supportedExtention'

export function isSupportedExtention(fileName: string): boolean {
  return Object.values(SUPPORTED_EXTENTION)
    .includes(extname(fileName) as SupportedExtention)
}
