import { useCallback } from 'react'
import type { XYPosition } from '@xyflow/react'

interface AddNodeMenuProps {
  position: XYPosition
  onSelect: (type: string) => void
  onClose: () => void
}

const NODE_CATEGORIES = [
  {
    label: '🤖 AI 节点',
    items: [
      { type: 'generate.text', label: '文本生成' },
      { type: 'generate.image', label: '图像生成' },
      { type: 'generate.video', label: '视频生成（后续）', disabled: true },
      { type: 'generate.audio', label: '音频生成（后续）', disabled: true }
    ]
  },
  {
    label: '📁 资源节点',
    items: [
      { type: 'asset.image', label: '图片' },
      { type: 'asset.video', label: '视频', disabled: true },
      { type: 'asset.audio', label: '音频', disabled: true },
      { type: 'asset.text', label: '文本' }
    ]
  },
  {
    label: '🛠️ 辅助工具',
    items: [
      { type: 'group', label: '分组' },
      { type: 'note', label: '便签' }
    ]
  }
]

export default function AddNodeMenu({ position, onSelect, onClose }: AddNodeMenuProps) {
  const handleSelect = useCallback((type: string) => {
    onSelect(type)
    onClose()
  }, [onSelect, onClose])

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="absolute z-50 min-w-[200px] rounded-xl border border-panel-border bg-panel-bg shadow-2xl overflow-hidden"
        style={{
          left: position.x,
          top: position.y
        }}
      >
        <div className="px-3 py-2 border-b border-panel-border bg-panel-header">
          <span className="text-sm font-medium text-text-primary">✨ 添加节点</span>
        </div>
        {NODE_CATEGORIES.map((category) => (
          <div key={category.label} className="py-1">
            <div className="px-3 py-1 text-xs font-medium text-text-muted">{category.label}</div>
            {category.items.map((item) => (
              <button
                key={item.type}
                disabled={item.disabled}
                onClick={() => !item.disabled && handleSelect(item.type)}
                className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                  item.disabled
                    ? 'text-text-muted cursor-not-allowed'
                    : 'text-text-secondary hover:bg-node-bg hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
