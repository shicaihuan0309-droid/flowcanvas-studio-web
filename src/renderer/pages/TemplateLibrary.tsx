import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronLeft, Loader2, Search, LayoutGrid } from 'lucide-react'
import { templateAPI } from '../lib/api'
import type { WorkflowTemplate } from '@shared'

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'storyboard', label: '故事板' },
  { key: 'concept', label: '概念设计' },
  { key: 'social', label: '社交媒体' },
  { key: 'other', label: '其他' }
]

export default function TemplateLibrary() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)

  const [, setFormData] = useState({
    title: '',
    category: 'storyboard',
    description: ''
  })

  const loadTemplates = useCallback(async () => {
    const data = await templateAPI.list()
    setTemplates(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const filteredTemplates = templates.filter(t =>
    (category === 'all' || t.category === category) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) ||
     (t.description || '').toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('确定删除此模板？')) return
    await templateAPI.delete(id)
    loadTemplates()
  }, [loadTemplates])

  return (
    <div className="flex h-full flex-col bg-canvas-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-panel-border bg-panel-bg px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg hover:bg-panel-header text-text-muted hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium text-text-primary">模板库</h1>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', category: 'storyboard', description: '' })
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-running/20 text-status-running hover:bg-status-running/30 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          保存当前为模板
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Categories */}
        <div className="w-48 border-r border-panel-border bg-panel-bg p-3 space-y-1">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                category === key
                  ? 'bg-panel-header text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-panel-header hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索模板..."
                className="w-full rounded-lg border border-input-border bg-input-bg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-running"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无工作流模板</p>
                <p className="text-sm mt-1">在编辑器中保存画布为模板</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className="rounded-xl border border-node-border bg-node-bg p-4 hover:border-node-border-hover transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-text-primary">{template.title}</h3>
                          {template.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-panel-header text-text-muted">
                              {template.category}
                            </span>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-xs text-text-muted mb-2">{template.description}</p>
                        )}
                        <p className="text-xs text-text-muted">
                          {template.graph?.nodes?.length || 0} 节点 · {template.graph?.edges?.length || 0} 连接
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 rounded-lg hover:bg-status-failed/20 text-text-muted hover:text-status-failed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save as Template Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-panel-border bg-panel-bg p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-text-primary mb-4">保存为模板</h3>
            <p className="text-sm text-text-muted mb-4">
              此功能需要当前打开编辑器并选择项目后才能使用。请在编辑器中通过「保存为模板」按钮操作。
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-panel-header transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
