import { BrowserWindow, screen } from 'electron'
import path from 'node:path'

const windows: Map<number, BrowserWindow> = new Map()

export function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    width: Math.min(1600, width - 100),
    height: Math.min(1000, height - 100),
    minWidth: 1024,
    minHeight: 768,
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  // Load renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  win.once('ready-to-show', () => {
    win.show()
    win.focus()
  })

  win.on('closed', () => {
    windows.delete(win.id)
  })

  windows.set(win.id, win)
  return win
}

export function getFocusedWindow(): BrowserWindow | undefined {
  return BrowserWindow.getFocusedWindow() || windows.values().next().value
}

export function getAllWindows(): BrowserWindow[] {
  return Array.from(windows.values())
}
