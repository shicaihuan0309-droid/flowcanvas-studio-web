import { ipcMain, dialog, app, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

const userDataPath = app.getPath('userData')
const projectsPath = path.join(userDataPath, 'projects')

// Ensure projects directory exists
if (!fs.existsSync(projectsPath)) {
  fs.mkdirSync(projectsPath, { recursive: true })
}

export function registerIPCHandlers(): void {
  // Window controls
  ipcMain.handle('window:minimize', () => {
    const { BrowserWindow } = require('electron')
    const win = BrowserWindow.getFocusedWindow()
    win?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    const { BrowserWindow } = require('electron')
    const win = BrowserWindow.getFocusedWindow()
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    const { BrowserWindow } = require('electron')
    const win = BrowserWindow.getFocusedWindow()
    win?.close()
  })

  // Project file operations
  ipcMain.handle('dialog:selectProjectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: projectsPath
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:selectFiles', async (_, options: { filters?: { name: string; extensions: string[] }[] }) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: options?.filters
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:saveFile', async (_, options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => {
    const result = await dialog.showSaveDialog({
      defaultPath: options?.defaultPath,
      filters: options?.filters
    })
    return result.canceled ? null : result.filePath
  })

  ipcMain.handle('file:read', async (_, filePath: string) => {
    const buffer = await fs.promises.readFile(filePath)
    return buffer.toString('base64')
  })

  ipcMain.handle('file:write', async (_, filePath: string, data: string) => {
    await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'))
  })

  ipcMain.handle('file:exists', async (_, filePath: string) => {
    return fs.existsSync(filePath)
  })

  ipcMain.handle('file:openPath', async (_, filePath: string) => {
    await shell.openPath(filePath)
  })

  ipcMain.handle('app:getPath', (_, name: string) => {
    return app.getPath(name as any)
  })
}
