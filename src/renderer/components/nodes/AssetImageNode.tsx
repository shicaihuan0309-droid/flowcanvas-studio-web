import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Image, Plus } from 'lucide-react'

function AssetImageNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`relative w-[280px] rounded-xl border bg-node-bg shadow-lg transition-all ${
        selected
          ? 'border-status-running shadow-[0_0_0_2px_rgba(59,130,246,0.3)]'
          : 'border-node-border hover:border-node-border-hover'
      }`}
      style={{ borderRadius: '12px' }}
    >
      {/* Left Handle (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-6 !h-6 !bg-node-bg !border-node-border hover:!border-status-running transition-colors"
      >
        <Plus className="w-3 h-3 text-text-muted" />
      </Handle>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-primary">{data.label as string}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {data.url ? (
          <img
            src={data.url as string}
            alt={data.label as string}
            className="w-full h-auto rounded-lg object-contain"
            style={{ maxHeight: '240px' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 rounded-lg border-2 border-dashed border-node-border text-text-muted">
            <Image className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs">双击上传图片</span>
          </div>
        )}
      </div>

      {/* Right Handle (Output) */}
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

export default memo(AssetImageNode)
