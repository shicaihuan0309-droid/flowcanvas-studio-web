/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: 'var(--canvas-bg)',
          dot: 'var(--canvas-dot)',
          grid: 'var(--canvas-grid)'
        },
        panel: {
          bg: 'var(--panel-bg)',
          border: 'var(--panel-border)',
          header: 'var(--panel-header)'
        },
        node: {
          bg: 'var(--node-bg)',
          border: 'var(--node-border)',
          'border-hover': 'var(--node-border-hover)',
          radius: 'var(--node-radius)'
        },
        status: {
          idle: 'var(--status-idle)',
          running: 'var(--status-running)',
          completed: 'var(--status-completed)',
          failed: 'var(--status-failed)',
          queued: 'var(--status-queued)'
        }
      }
    }
  },
  plugins: []
}
