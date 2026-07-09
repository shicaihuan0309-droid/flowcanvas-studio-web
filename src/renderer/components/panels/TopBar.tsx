import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/theme'
import { List, LayoutGrid, Download } from 'lucide-react'

interface TopBarProps {
  projectName?: string
  onSave?: () => void
  saving?: boolean
  onToggleTaskLog?: () => void
  taskLogOpen?: boolean
  onSaveAsTemplate?: () => void
  onExport?: () => void
}

export default function TopBar({ projectName, onSave, saving, onToggleTaskLog, taskLogOpen, onSaveAsTemplate, onExport }: TopBarProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useThemeStore()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex h-12 items-center justify-between border-b border-panel-border bg-panel-bg px-4 select-none">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-lg font-bold text-text-primary hover:text-status-running transition-colors"
        >
          🎨 FlowCanvas
        </button>
        {projectName && (
          <>
            <span className="text-text-muted">|</span>
            <span className="text-text-primary">{projectName}</span>
            <span className="text-xs text-text-muted">v0.1.0</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-text-secondary hover:bg-panel-header disabled:opacity-50 transition-colors"
          >
            {saving ? '💾 保存中...' : '💾 保存'}
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        )}
        {onSaveAsTemplate && (
          <button
            onClick={onSaveAsTemplate}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            存为模板
          </button>
        )}
        <button className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors">
          ↩ 撤销
        </button>
        <button className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors">
          ↪ 重做
        </button>
        <span className="mx-2 h-4 w-px bg-panel-border" />
        {onToggleTaskLog && (
          <button
            onClick={onToggleTaskLog}
            className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors ${
              taskLogOpen
                ? 'bg-status-running/20 text-status-running'
                : 'text-text-secondary hover:bg-panel-header'
            }`}
          >
            <List className="w-4 h-4" />
            任务
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors"
        >
          ⚙️
        </button>
        <button className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors">
          ❓
        </button>
      </div>
    </div>
  )
}
