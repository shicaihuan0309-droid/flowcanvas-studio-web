import { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, nativeImage } from 'electron'
import path from 'node:path'
import { createWindow, getFocusedWindow, getAllWindows } from './window'
import { registerIPCHandlers } from './ipc-handlers'
import { launchBackend } from './backend-launcher'

let tray: Tray | null = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const focusedWindow = getFocusedWindow()
    if (focusedWindow) {
      focusedWindow.show()
      focusedWindow.focus()
    }
  })
}

app.whenReady().then(async () => {
  // Launch backend service
  await launchBackend()

  registerIPCHandlers()

  createWindow()

  app.on('activate', () => {
    if (getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  // Cleanup backend if needed
})
