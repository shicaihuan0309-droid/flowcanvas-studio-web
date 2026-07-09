import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Dialogs
  selectProjectDirectory: () => ipcRenderer.invoke('dialog:selectProjectDirectory'),
  selectFiles: (options: { filters?: { name: string; extensions: string[] }[] }) => 
    ipcRenderer.invoke('dialog:selectFiles', options),
  saveFile: (options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => 
    ipcRenderer.invoke('dialog:saveFile', options),

  // File operations
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, data: string) => ipcRenderer.invoke('file:write', filePath, data),
  fileExists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),
  openPath: (filePath: string) => ipcRenderer.invoke('file:openPath', filePath),
  getAppPath: (name: string) => ipcRenderer.invoke('app:getPath', name)
})

export type ElectronAPI = typeof window.electronAPI

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
