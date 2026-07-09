import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, TestTube, ChevronLeft, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { providerAPI } from '../lib/api'
import type { ModelProvider, ProviderType } from '@shared'

export default function Settings() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState<ModelProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Record<string, { connected: boolean; message?: string }>>({})

  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ModelProvider | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'openai-compatible',
    baseUrl: '',
    apiKey: ''
  })

  const loadProviders = useCallback(async () => {
    const data = await providerAPI.list()
    setProviders(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProviders()
  }, [loadProviders])

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.baseUrl) return

    if (editingProvider) {
      await providerAPI.update(editingProvider.id, {
        name: formData.name,
        baseUrl: formData.baseUrl,
        apiKey: formData.apiKey || undefined
      })
    } else {
      await providerAPI.create({
        name: formData.name,
        type: formData.type as ProviderType,
        baseUrl: formData.baseUrl,
        apiKey: formData.apiKey || undefined,
        isEnabled: true
      })
    }

    setShowForm(false)
    setEditingProvider(null)
    setFormData({ name: '', type: 'openai-compatible', baseUrl: '', apiKey: '' })
    loadProviders()
  }, [formData, editingProvider, loadProviders])

  const handleTest = useCallback(async (id: string) => {
    setTestingId(id)
    try {
      const result = await providerAPI.test(id)
      setTestResult(prev => ({ ...prev, [id]: result }))
    } catch (err) {
      setTestResult(prev => ({ ...prev, [id]: { connected: false, message: '测试失败' } }))
    }
    setTestingId(null)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('确定删除此 Provider？')) return
    await providerAPI.delete(id)
    loadProviders()
  }, [loadProviders])

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
          <h1 className="text-lg font-medium text-text-primary">设置</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-panel-border bg-panel-bg p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-panel-header text-text-primary text-sm font-medium">
            🤖 AI Provider
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-text-primary">AI Provider 配置</h2>
              <button
                onClick={() => {
                  setEditingProvider(null)
                  setFormData({ name: '', type: 'openai-compatible', baseUrl: '', apiKey: '' })
                  setShowForm(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-running/20 text-status-running hover:bg-status-running/30 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                添加 Provider
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <p>暂无 Provider 配置</p>
                <p className="text-sm mt-1">点击上方按钮添加</p>
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map(provider => (
                  <div
                    key={provider.id}
                    className="rounded-xl border border-node-border bg-node-bg p-4 hover:border-node-border-hover transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-panel-header flex items-center justify-center text-lg">
                          {provider.type === 'ollama' ? '🦙' : '🔑'}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-text-primary">{provider.name}</h3>
                          <p className="text-xs text-text-muted">{provider.type} · {provider.baseUrl}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {testResult[provider.id]?.connected && (
                          <CheckCircle className="w-4 h-4 text-status-completed" />
                        )}
                        {testResult[provider.id] && !testResult[provider.id].connected && (
                          <XCircle className="w-4 h-4 text-status-failed" />
                        )}
                        <button
                          onClick={() => handleTest(provider.id)}
                          disabled={testingId === provider.id}
                          className="p-1.5 rounded-lg hover:bg-panel-header text-text-muted hover:text-text-primary transition-colors"
                          title="测试连接"
                        >
                          {testingId === provider.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProvider(provider)
                            setFormData({
                              name: provider.name,
                              type: provider.type,
                              baseUrl: provider.baseUrl || '',
                              apiKey: provider.apiKey || ''
                            })
                            setShowForm(true)
                          }}
                          className="p-1.5 rounded-lg hover:bg-panel-header text-text-muted hover:text-text-primary transition-colors text-xs"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(provider.id)}
                          className="p-1.5 rounded-lg hover:bg-status-failed/20 text-text-muted hover:text-status-failed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {testResult[provider.id]?.message && (
                      <p className={`mt-2 text-xs ${testResult[provider.id].connected ? 'text-status-completed' : 'text-status-failed'}`}>
                        {testResult[provider.id].message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-md rounded-xl border border-panel-border bg-panel-bg p-6 shadow-2xl">
                  <h3 className="text-lg font-medium text-text-primary mb-4">
                    {editingProvider ? '编辑 Provider' : '添加 Provider'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">名称</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例如：OpenAI"
                        className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-running"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-secondary mb-1">类型</label>
                      <select
                        value={formData.type}
                        onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-running"
                      >
                        <option value="openai-compatible">OpenAI Compatible</option>
                        <option value="ollama">Ollama</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Base URL</label>
                      <input
                        type="text"
                        value={formData.baseUrl}
                        onChange={e => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                        placeholder="http://localhost:11434/v1"
                        className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-running"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-secondary mb-1">API Key（可选）</label>
                      <input
                        type="password"
                        value={formData.apiKey}
                        onChange={e => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="sk-..."
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
                      {editingProvider ? '保存' : '添加'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
