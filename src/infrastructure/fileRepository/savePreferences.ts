import { writeFile } from 'fs/promises'

import type { Preferences } from '@/application/types/preferences'

import { CACHE_PATH } from '../../application/constants/cachePath'
import { mapToFiles } from '../../application/mappers/mapToFiles'
import { PREFERENCES_FILE } from '../constats/preferencesFile'
import type { PreferencesData } from '../types/preferencesData'

export async function savePreferences(preferences: Preferences): Promise<void> {
  const playlist = mapToFiles(preferences.playlist)
  const path = `${CACHE_PATH}/${PREFERENCES_FILE}`
  const prefirencesData: PreferencesData = {
    ...preferences,
    playlist,
  }
  const json = JSON.stringify(prefirencesData)

  return writeFile(path, json)
}
