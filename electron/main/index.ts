/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import type { Socket } from 'node:net'
import { createServer } from 'node:net'
import { release } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  app, BrowserWindow, ipcMain, shell,
} from 'electron'

import { createCacheDir } from
  '../../src/infrastructure/fileRepository/createCacheDir'
import { extractFilesFromDirectories } from
  '../../src/infrastructure/fileRepository/extractFiles'
import { getCover } from '../../src/infrastructure/fileRepository/getCover'
import { listFiles } from '../../src/infrastructure/fileRepository/listFiles'
import { loadPreferences } from
  '../../src/infrastructure/fileRepository/loadPreferences'
import { parseFileMeta } from
  '../../src/infrastructure/fileRepository/parseFileMeta'
import { readAudioFile } from
  '../../src/infrastructure/fileRepository/readAudioFile'
import { readFile } from '../../src/infrastructure/fileRepository/readFile'
import { savePreferences } from
  '../../src/infrastructure/fileRepository/savePreferences'
import { update } from './update'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) {
  app.disableHardwareAcceleration()
}

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName())
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.mjs')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable
      // contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on
      // https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  // disable menu
  win.setMenu(null)

  // electron-vite-vue#298
  if (url) {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }
  else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url: externalUrl }) => {
    if (externalUrl.startsWith('https:')) {
      shell.openExternal(externalUrl)
    }

    return { action: 'deny' }
  })

  // Apply electron-updater
  update(win)
}

app.whenReady()
  .then(createWindow)

// socket initialization
const fd = `${process.env.XDG_RUNTIME_DIR}/dumb-player`
const server = createServer()

server.on('connection', (socket: Socket) => {
  socket.setEncoding('utf8')
  socket.on('data', (data: string) => {
    if (win) {
      const trimedData = data.trim()

      if (trimedData === 'pause-or-play') {
        win.webContents.send('pause-or-play')
      }

      if (trimedData === 'increase-volume') {
        win.webContents.send('increase-volume')
      }

      if (trimedData === 'decrease-volume') {
        win.webContents.send('decrease-volume')
      }

      if (trimedData === 'play-next') {
        win.webContents.send('play-next')
      }

      if (trimedData === 'play-previous') {
        win.webContents.send('play-previous')
      }

      if (trimedData === 'switch-mute') {
        win.webContents.send('switch-mute')
      }
    }
  })
})

server.listen(fd)

app.on('quit', () => {
  server.close()
})

app.on('window-all-closed', () => {
  win = null

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) {
      win.restore()
    }

    win.focus()
  }
})

app.on('activate', () => {
  const allWindows: Array<BrowserWindow> = BrowserWindow.getAllWindows()
  const win = allWindows.at(0)

  // if (allWindows.length) {
  //   allWindows[0].focus()
  // }
  if (win) {
    win.focus()
  }
  else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  }
  else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle('list-files', async(_, args) => listFiles(args))

ipcMain.handle('parse-file-meta', async(_, args) => parseFileMeta(args))

ipcMain.handle('read-file', async(_, args) => readFile(args))

ipcMain.handle('read-audio-file', async(_, args) => readAudioFile(args))

ipcMain.handle('save-preferences', async(_, args) => {
  await savePreferences(args)
})
ipcMain.handle('load-preferences', async(_) => loadPreferences())

ipcMain.handle('create-cache-dir', async(_) => {
  createCacheDir()
})

ipcMain.handle(
  'extract-files-from-directories',
  async(_, args) => extractFilesFromDirectories(args),
)

ipcMain.handle('get-cover', async(_, args) => getCover(args))

ipcMain.handle('notify-next-track', async(_) => {
  // socket.write(args)
})
