import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Send, Loader2, BookOpen } from 'lucide-react'
import { providerAPI, taskAPI, promptAPI } from '../../lib/api'
import type { ModelProvider, PromptTemplate } from '@shared'

interface GenerationPanelProps {
  nodeId: string
  nodeType: 'generate.text' | 'generate.image'
  projectId: string
  onClose: () => void
  onTaskCreated?: (taskId: string) => void
}

export default function GenerationPanel({ nodeId, nodeType, projectId, onClose, onTaskCreated }: GenerationPanelProps) {
  const navigate = useNavigate()
  const [providers, setProviders] = useState<ModelProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([])
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [size, setSize] = useState('1024x1024')
  const [submitting, setSubmitting] = useState(false)

  // Prompt library integration
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [showPromptPicker, setShowPromptPicker] = useState(false)

  useEffect(() => {
    providerAPI.list().then(data => {
      setProviders(data.filter(p => p.isEnabled !== false))
      if (data.length > 0) {
        setSelectedProvider(data[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedProvider) return
    providerAPI.test(selectedProvider).then(result => {
      if (result.connected) {
        providerAPI.getModels(selectedProvider).then(data => {
          setModels(data.models || [])
          if (data.models?.length > 0) {
            setSelectedModel(data.models[0].id)
          }
        }).catch(() => setModels([]))
      }
    })
  }, [selectedProvider])

  // Load prompts when picker opens
  useEffect(() => {
    if (!showPromptPicker) return
    const category = nodeType === 'generate.image' ? 'image' : 'text'
    promptAPI.list(category).then(data => {
      setPrompts(data)
    }).catch(() => setPrompts([]))
  }, [showPromptPicker, nodeType])

  const handleSelectPrompt = useCallback((template: PromptTemplate) => {
    setPrompt(template.content)
    setShowPromptPicker(false)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || !selectedProvider || !selectedModel) return

    setSubmitting(true)
    try {
      const input = nodeType === 'generate.text'
        ? { prompt, temperature, maxTokens }
        : { prompt, negativePrompt, size }

      const task = await taskAPI.create({
        projectId,
        nodeId,
        type: nodeType === 'generate.text' ? 'text' : 'image',
        provider: selectedProvider,
        model: selectedModel,
        input
      })

      onTaskCreated?.(task.id)
      setPrompt('')
    } finally {
      setSubmitting(false)
    }
  }, [prompt, selectedProvider, selectedModel, nodeType, projectId, nodeId, negativePrompt, temperature, maxTokens, size, onTaskCreated])

  const isImageGen = nodeType === 'generate.image'

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[600px] max-w-[90vw] rounded-xl border border-panel-border bg-panel-bg shadow-2xl z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {isImageGen ? '🎨 图像生成' : '📝 文本生成'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPromptPicker(v => !v)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-secondary hover:bg-panel-header transition-colors"
            title="提示词库"
          >
            <BookOpen className="w-3.5 h-3.5" />
            提示词
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-panel-header text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prompt picker dropdown */}
      {showPromptPicker && (
        <div className="border-b border-panel-border bg-panel-header/50 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-text-muted">选择提示词模板</span>
            <button
              onClick={() => navigate('/prompts')}
              className="text-xs text-status-running hover:underline"
            >
              管理提示词 →
            </button>
          </div>
          {prompts.length === 0 ? (
            <div className="px-4 py-3 text-xs text-text-muted">暂无提示词模板</div>
          ) : (
            <div className="px-2 pb-2 space-y-1">
              {prompts.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPrompt(p)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-panel-bg text-sm text-text-primary transition-colors"
                >
                  <span className="font-medium">{p.title}</span>
                  <span className="text-xs text-text-muted ml-2 line-clamp-1">{p.content.slice(0, 60)}...</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Provider & Model */}
        <div className="flex gap-2">
          <select
            value={selectedProvider}
            onChange={e => setSelectedProvider(e.target.value)}
            className="flex-1 rounded border border-input-border bg-input-bg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-status-running"
          >
            <option value="">选择 Provider</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="flex-1 rounded border border-input-border bg-input-bg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-status-running"
          >
            <option value="">选择模型</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Prompt */}
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={isImageGen ? '描述你想要生成的图像...' : '输入你的提示词...'}
          className="w-full h-20 rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-running resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />

        {/* Image-specific options */}
        {isImageGen && (
          <div className="flex gap-2">
            <input
              type="text"
              value={negativePrompt}
              onChange={e => setNegativePrompt(e.target.value)}
              placeholder="负面提示词（可选）"
              className="flex-1 rounded border border-input-border bg-input-bg px-2 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-running"
            />
            <select
              value={size}
              onChange={e => setSize(e.target.value)}
              className="rounded border border-input-border bg-input-bg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-status-running"
            >
              <option value="1024x1024">1024x1024</option>
              <option value="1024x1536">1024x1536</option>
              <option value="1536x1024">1536x1024</option>
            </select>
          </div>
        )}

        {/* Text-specific options */}
        {!isImageGen && (
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-text-muted">Temperature</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-text-muted w-8">{temperature}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-text-muted">Max Tokens</span>
              <input
                type="number"
                value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))}
                className="w-20 rounded border border-input-border bg-input-bg px-2 py-1 text-sm text-text-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-panel-border">
        <div className="text-xs text-text-muted">
          Enter 发送 · Shift+Enter 换行
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !prompt.trim() || !selectedProvider || !selectedModel}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-status-running text-white text-sm hover:bg-status-running/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {submitting ? '生成中...' : '生成'}
        </button>
      </div>
    </div>
  )
}
