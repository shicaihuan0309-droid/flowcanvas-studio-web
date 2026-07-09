import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useThemeStore } from './stores/theme'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Settings from './pages/Settings'
import PromptLibrary from './pages/PromptLibrary'
import TemplateLibrary from './pages/TemplateLibrary'

function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
  }, [theme])

  return (
    <div className="h-screen w-screen overflow-hidden bg-canvas-bg text-text-primary transition-colors">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:projectId" element={<Editor />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/prompts" element={<PromptLibrary />} />
        <Route path="/templates" element={<TemplateLibrary />} />
      </Routes>
    </div>
  )
}

export default App
