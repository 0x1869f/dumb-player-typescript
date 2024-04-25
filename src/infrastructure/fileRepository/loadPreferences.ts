import { readFile } from 'fs/promises'

import type { Preferences } from '@/application/types/preferences'

import { CACHE_PATH } from '../../application/constants/cachePath'
import { asyncMapper } from '../../application/mappers/asyncMapper'
import { getDefaultPreferences } from
  '../../application/utils/getDefaultPreferences'
import { PREFERENCES_FILE } from '../constats/preferencesFile'
import type { PreferencesData } from '../types/preferencesData'
import { addMetaInfoToFile } from './addMetaInfoToFile'

export async function loadPreferences(): Promise<Preferences> {
  try {
    const file = await readFile(`${CACHE_PATH}/${PREFERENCES_FILE}`)
    const preferencesData: PreferencesData = JSON.parse(file.toString())

    const playlist = await asyncMapper(
      addMetaInfoToFile,
    )(preferencesData.playlist)

    return {
      ...preferencesData,
      playlist,
    }
  }
  catch {
    return getDefaultPreferences()
  }
}
