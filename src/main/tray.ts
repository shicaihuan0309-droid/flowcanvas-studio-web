import { Tray, Menu, app, nativeImage, BrowserWindow } from 'electron'
import path from 'node:path'

let tray: Tray | null = null

export function createTray(): void {
  // Use a simple 16x16 icon or generate one programmatically
  const icon = nativeImage.createFromNamedImage('NSStatusIcon', 16)
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        const windows = BrowserWindow.getAllWindows()
        if (windows.length > 0) {
          windows[0].show()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('FlowCanvas Studio')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      windows[0].show()
    }
  })
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
