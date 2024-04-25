import type { AudioFile } from '@/domain/types/audioFile'
import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'
import type { Directory } from '@/domain/types/directory'
import type { MetaInfo } from '@/domain/types/metaInfo'

import type { Preferences } from '@/application/types/preferences'

declare global {
  interface Window {
    electron: {
      listFiles: (path: string) => Promise<
        Array<AudioFileWithMetaInfo | Directory>
      >
      parseFileMeta: (path: string) => Promise<MetaInfo>
      readFile: (path: string) => Promise<ArrayBuffer>
      readAudioFile: (path: string) => Promise<Uint8Array>
      savePreferences: (preferences: Preferences) =>
        Promise<void>
      loadPreferences: () => Promise<Preferences>
      createCacheDir: () => Promise<void>
      getCover: (path: string) => Promise<ArrayBuffer | undefined>
      extractFilesFromDirectories: (
        files: Array<Directory | AudioFile>
      ) => Promise<Array<AudioFileWithMetaInfo>>
      notifyNextTrack: (path: string) => void
      onPauseOrPlay: (callback: () => void) => void
      onIncreaseVolume: (callback: () => void) => void
      onDecreaseVolume: (callback: () => void) => void
      onPlayNext: (callback: () => void) => void
      onPlayPrevious: (callback: () => void) => void
      onSwitchMute: (callback: () => void) => void
      savePlaylist: (
        files: Array<AudioFileWithMetaInfo | AudioFile>
      ) => Promise<void>
    }
  }
}
