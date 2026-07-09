import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FileText, Plus } from 'lucide-react'

function AssetTextNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`relative w-[280px] rounded-xl border bg-node-bg shadow-lg transition-all ${
        selected
          ? 'border-status-running shadow-[0_0_0_2px_rgba(59,130,246,0.3)]'
          : 'border-node-border hover:border-node-border-hover'
      }`}
      style={{ borderRadius: '12px' }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-6 !h-6 !bg-node-bg !border-node-border hover:!border-status-running transition-colors"
      >
        <Plus className="w-3 h-3 text-text-muted" />
      </Handle>

      <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-primary">{data.label as string}</span>
        </div>
      </div>

      <div className="p-3">
        {data.content ? (
          <div className="max-h-[200px] overflow-hidden text-sm text-text-secondary leading-relaxed">
            {(data.content as string).substring(0, 200)}
            {(data.content as string).length > 200 && '...'}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed border-node-border text-text-muted">
            <FileText className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">双击编辑文本</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-6 !h-6 !bg-node-bg !border-node-border hover:!border-status-running transition-colors"
      >
        <Plus className="w-3 h-3 text-text-muted" />
      </Handle>
    </div>
  )
}

export default memo(AssetTextNode)
