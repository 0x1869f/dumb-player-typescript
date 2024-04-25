import { access, mkdir } from 'fs/promises'

import { CACHE_PATH } from '../../application/constants/cachePath'

export async function createCacheDir(): Promise<void> {
  try {
    await access(CACHE_PATH)
  }
  catch (e) {
    await mkdir(CACHE_PATH)
  }
}
