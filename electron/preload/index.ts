/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge,ipcRenderer } from 'electron'

import type { AudioFile } from '@/domain/types/audioFile'
import type { AudioFileWithMetaInfo } from '@/domain/types/audioFileWithMetaInfo'
import type { Directory } from '@/domain/types/directory'
import type { MetaInfo } from '@/domain/types/metaInfo'

import type { DirectoryContent } from '@/application/types/directoryContent'
import type { Preferences } from '@/application/types/preferences'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer))

// `exposeInMainWorld` can't detect attributes
// and methods of `prototype`, manually patching it.
function withPrototype(obj: Record<string, any>) {
  const protos = Object.getPrototypeOf(obj)

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      continue
    }

    if (typeof value === 'function') {
      // Some native APIs, like `NodeJS.EventEmitter['on']`,
      // don't work in the Renderer process. Wrapping them into a function.
      obj[key] = function(...args: any) {
        return value.call(obj, ...args)
      }
    }
    else {
      obj[key] = value
    }
  }

  return obj
}

// --------- Preload scripts loading ---------
function domReady(condition: Array<DocumentReadyState> = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    }
    else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  // @ts-expect-error
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child)
    }
  },
  // @ts-expect-error
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = 'loaders-css__square-spin'
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()

domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)

contextBridge.exposeInMainWorld('electron', {
  listFiles: async(path: string): Promise<Array<DirectoryContent>> => ipcRenderer.invoke('list-files', path),
  parseFileMeta: async(path: string): Promise<MetaInfo> => ipcRenderer.invoke('get-file-metadata', path),
  readFile: async(path: string): Promise<ArrayBuffer> => ipcRenderer.invoke('read-file', path),
  readAudioFile: async(path: string): Promise<AudioBuffer> => ipcRenderer.invoke('read-audio-file', path),
  loadPreferences: async(): Promise<Preferences> => ipcRenderer.invoke('load-preferences'),
  createCacheDir: async(): Promise<void> => ipcRenderer.invoke('create-cache-dir'),
  getCover: async(path: string): Promise<ArrayBuffer | void> => ipcRenderer.invoke('get-cover', path),
  getHomedir: (): Promise<string> => ipcRenderer.invoke('get-homedir'),
  extractFilesFromDirectories: (files: Array<Directory | AudioFile>): Promise<Array<AudioFileWithMetaInfo>> => ipcRenderer.invoke('extract-files-from-directories', files),
  notifyNextTrack: (path: string) => ipcRenderer.invoke('notify-next-track', path),
  onPauseOrPlay: (callback: () => void) => ipcRenderer.on('pause-or-play', (_event) => {
    callback()
  }),
  onIncreaseVolume: (callback: () => void) => ipcRenderer.on('increase-volume', (_event) => {
    callback()
  }),
  onDecreaseVolume: (callback: () => void) => ipcRenderer.on('decrease-volume', (_event) => {
    callback()
  }),
  onPlayNext: (callback: () => void) => ipcRenderer.on('play-next', (_event) => {
    callback()
  }),
  onPlayPrevious: (callback: () => void) => ipcRenderer.on('play-previous', (_event) => {
    callback()
  }),
  onSwitchMute: (callback: () => void) => ipcRenderer.on('switch-mute', (_event) => {
    callback()
  }),
  savePreferences: (preferences: Preferences) => ipcRenderer.invoke('save-preferences', preferences),
})
