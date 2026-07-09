import { useEffect, useState, useCallback, useRef } from 'react'
import { Search, Image, FileText, Trash2, Upload, FolderOpen } from 'lucide-react'
import { assetAPI } from '../../lib/api'
import type { Asset } from '@shared'
import type { FlowCanvasRef } from '../canvas/FlowCanvas'

interface AssetPanelProps {
  projectId?: string
  canvasRef?: React.RefObject<FlowCanvasRef | null>
}

export default function AssetPanel({ projectId, canvasRef }: AssetPanelProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!projectId) return
    loadAssets()
  }, [projectId])

  const loadAssets = useCallback(() => {
    assetAPI.list({ projectId })
      .then(setAssets)
      .catch(() => setAssets([]))
  }, [projectId])

  const filteredAssets = assets.filter(asset => {
    const matchesFilter = filter === 'all' || asset.type === filter
    const matchesSearch = !searchQuery || asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleDragStart = useCallback((asset: Asset) => (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset))
    e.dataTransfer.effectAllowed = 'copy'
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !projectId) return

    for (const file of Array.from(files)) {
      const type = getFileType(file)
      if (!type) continue

      // Read file content (for preview, currently unused)
      await readFileContent(file, type)

      // Create asset via API (placeholder - would need multipart upload endpoint)
      // For now, just add to local state
      const newAsset: Asset = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        type,
        name: file.name,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setAssets(prev => [newAsset, ...prev])
    }

    // Reset input
    e.target.value = ''
  }, [projectId])

  const handleInsertToCanvas = useCallback((asset: Asset) => {
    if (!canvasRef?.current) return
    canvasRef.current.addNodeFromAsset(asset, {
      x: Math.random() * 100,
      y: Math.random() * 100
    })
  }, [canvasRef])

  const handleDeleteAsset = useCallback(async (id: string) => {
    if (!window.confirm('确定要删除这个资产吗？')) return
    await assetAPI.delete(id)
    setAssets(prev => prev.filter(a => a.id !== id))
  }, [])

  return (
    <div className="flex w-64 flex-col border-r border-panel-border bg-panel-bg">
      <div className="border-b border-panel-border p-3">
        <div className="mb-2 font-medium text-text-primary">📁 资产</div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索资产..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-input-border bg-input-bg pl-8 pr-2 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-running"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'image', label: '图片', icon: Image },
            { key: 'text', label: '文本', icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
                filter === key
                  ? 'bg-status-running/20 text-status-running'
                  : 'text-text-muted hover:text-text-secondary hover:bg-panel-header'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {label}
            </button>
          ))}
        </div>

        {/* View mode + Import */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-0.5 rounded text-xs ${viewMode === 'list' ? 'bg-panel-header text-text-primary' : 'text-text-muted'}`}
            >
              列表
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-0.5 rounded text-xs ${viewMode === 'grid' ? 'bg-panel-header text-text-primary' : 'text-text-muted'}`}
            >
              网格
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-status-running/20 text-status-running hover:bg-status-running/30 transition-colors"
          >
            <Upload className="w-3 h-3" />
            导入
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.txt,.json,.md"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredAssets.length === 0 ? (
          <div className="text-center text-sm text-text-muted py-8">
            {searchQuery ? '未找到匹配的资产' : (
              <>
                暂无资产
                <br />
                <span className="text-xs">拖入文件或点击导入</span>
              </>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                draggable
                onDragStart={handleDragStart(asset)}
                className="group relative rounded-lg border border-node-border bg-node-bg hover:border-node-border-hover cursor-grab active:cursor-grabbing transition-all overflow-hidden"
              >
                {viewMode === 'grid' && asset.type === 'image' ? (
                  <div className="aspect-square bg-panel-header flex items-center justify-center">
                    <Image className="w-8 h-8 text-text-muted" />
                  </div>
                ) : null}
                <div className="flex items-center gap-2 p-2">
                  {asset.type === 'image' ? (
                    <Image className="w-4 h-4 text-status-running flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-status-queued flex-shrink-0" />
                  )}
                  <span className="flex-1 text-xs text-text-primary truncate">{asset.name}</span>
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-panel-bg/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                  <button
                    onClick={() => handleInsertToCanvas(asset)}
                    className="p-1.5 rounded bg-status-running/20 text-status-running hover:bg-status-running/30 transition-colors"
                    title="插入画布"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="p-1.5 rounded bg-status-failed/20 text-status-failed hover:bg-status-failed/30 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-panel-border p-2 flex items-center justify-between">
        <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs text-text-muted hover:text-text-secondary hover:bg-panel-header transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
          回收站
        </button>
        <button
          onClick={async () => {
            if (assets.length === 0) return
            const assetList = assets.map(a => a.name).join('\n')
            const blob = new Blob([assetList], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'assets-list.txt'
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-status-completed hover:bg-status-completed/20 transition-colors"
          title="导出资产列表"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          导出
        </button>
      </div>
    </div>
  )
}

function getFileType(file: File): 'image' | 'text' | null {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md')) return 'text'
  return null
}

function readFileContent(file: File, type: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (type === 'image') {
        resolve(result)
      } else {
        resolve(result)
      }
    }
    reader.onerror = reject
    if (type === 'image') {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
  })
}
