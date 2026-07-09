import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronLeft, Loader2, Search, Tag, FileText } from 'lucide-react'
import { promptAPI } from '../lib/api'
import type { PromptTemplate } from '@shared'

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'text', label: '文本生成' },
  { key: 'image', label: '图像生成' },
  { key: 'character', label: '角色设定' },
  { key: 'coding', label: '代码' },
  { key: 'other', label: '其他' }
]

export default function PromptLibrary() {
  const navigate = useNavigate()
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    category: 'text',
    content: '',
    tags: ''
  })

  const loadPrompts = useCallback(async () => {
    const data = await promptAPI.list(category === 'all' ? undefined : category)
    setPrompts(data)
    setLoading(false)
  }, [category])

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = useCallback(async () => {
    if (!formData.title || !formData.content) return

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)

    if (editingPrompt) {
      await promptAPI.update(editingPrompt.id, {
        title: formData.title,
        category: formData.category,
        content: formData.content,
        tags
      })
    } else {
      await promptAPI.create({
        title: formData.title,
        category: formData.category,
        content: formData.content,
        tags
      })
    }

    setShowForm(false)
    setEditingPrompt(null)
    setFormData({ title: '', category: 'text', content: '', tags: '' })
    loadPrompts()
  }, [formData, editingPrompt, loadPrompts])

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('确定删除此提示词？')) return
    await promptAPI.delete(id)
    loadPrompts()
  }, [loadPrompts])

  const handleEdit = useCallback((prompt: PromptTemplate) => {
    setEditingPrompt(prompt)
    setFormData({
      title: prompt.title,
      category: prompt.category || 'text',
      content: prompt.content,
      tags: prompt.tags?.join(', ') || ''
    })
    setShowForm(true)
  }, [])

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
          <h1 className="text-lg font-medium text-text-primary">提示词库</h1>
        </div>
        <button
          onClick={() => {
            setEditingPrompt(null)
            setFormData({ title: '', category: 'text', content: '', tags: '' })
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-running/20 text-status-running hover:bg-status-running/30 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          新建提示词
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
                placeholder="搜索提示词..."
                className="w-full rounded-lg border border-input-border bg-input-bg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-running"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无提示词模板</p>
                <p className="text-sm mt-1">点击右上角添加</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPrompts.map(prompt => (
                  <div
                    key={prompt.id}
                    className="rounded-xl border border-node-border bg-node-bg p-4 hover:border-node-border-hover transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-text-primary">{prompt.title}</h3>
                          {prompt.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-panel-header text-text-muted">
                              {prompt.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted line-clamp-2 mb-2">{prompt.content}</p>
                        {prompt.tags && prompt.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Tag className="w-3 h-3 text-text-muted" />
                            {prompt.tags.map(tag => (
                              <span key={tag} className="text-xs text-text-muted">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button
                          onClick={() => handleEdit(prompt)}
                          className="p-1.5 rounded-lg hover:bg-panel-header text-text-muted hover:text-text-primary transition-colors text-xs"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(prompt.id)}
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-panel-border bg-panel-bg p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-text-primary mb-4">
              {editingPrompt ? '编辑提示词' : '新建提示词'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="提示词标题"
                  className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-running"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-running"
                >
                  <option value="text">文本生成</option>
                  <option value="image">图像生成</option>
                  <option value="character">角色设定</option>
                  <option value="coding">代码</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">内容</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="输入提示词内容..."
                  rows={6}
                  className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-running resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="标签1, 标签2, 标签3"
                  className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-running"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-panel-header transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg text-sm bg-status-running text-white hover:bg-status-running/90 transition-colors"
              >
                {editingPrompt ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
