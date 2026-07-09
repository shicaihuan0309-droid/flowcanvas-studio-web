import { spawn, ChildProcess } from 'node:child_process'
import path from 'node:path'
import { app } from 'electron'

let backendProcess: ChildProcess | null = null

export async function launchBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    const isDev = !!process.env.VITE_DEV_SERVER_URL
    
    if (isDev) {
      // In dev mode, backend is started separately via pnpm dev:backend
      console.log('[Main] Backend should be started via pnpm dev:backend')
      resolve()
      return
    }

    const backendPath = path.join(process.resourcesPath, 'backend', 'server.js')
    const userDataPath = app.getPath('userData')

    backendProcess = spawn('node', [backendPath, '--data-dir', userDataPath], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    backendProcess.stdout?.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`)
    })

    backendProcess.stderr?.on('data', (data) => {
      console.error(`[Backend] ${data.toString().trim()}`)
    })

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend:', err)
      reject(err)
    })

    backendProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Backend exited with code ${code}`)
      }
    })

    // Give backend a moment to start
    setTimeout(() => resolve(), 1000)
  })
}

export function stopBackend(): void {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
}
