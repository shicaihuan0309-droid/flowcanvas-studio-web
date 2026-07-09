import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  },
  root: path.resolve(__dirname, '.'),
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  css: {
    postcss: './postcss.config.js'
  },
  base: './'
})
