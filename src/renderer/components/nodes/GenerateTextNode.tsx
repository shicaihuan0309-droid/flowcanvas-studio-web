import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Type, Plus } from 'lucide-react'

function GenerateTextNode({ data, selected }: NodeProps) {
  const status = (data.status as string) || 'idle'

  const statusColors: Record<string, string> = {
    idle: 'border-node-border',
    queued: 'border-status-queued border-dashed',
    running: 'border-status-running',
    completed: 'border-status-completed',
    failed: 'border-status-failed'
  }

  return (
    <div
      className={`relative w-[320px] rounded-xl border bg-node-bg shadow-lg transition-all ${
        selected
          ? 'border-status-running shadow-[0_0_0_2px_rgba(59,130,246,0.3)]'
          : statusColors[status] || 'border-node-border hover:border-node-border-hover'
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
          <Type className="w-4 h-4 text-status-running" />
          <span className="text-sm font-medium text-text-primary">{data.label as string}</span>
        </div>
        {status !== 'idle' && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            status === 'running' ? 'bg-status-running/20 text-status-running' :
            status === 'completed' ? 'bg-status-completed/20 text-status-completed' :
            status === 'failed' ? 'bg-status-failed/20 text-status-failed' :
            'bg-status-queued/20 text-status-queued'
          }`}>
            {status === 'running' ? '生成中' :
             status === 'completed' ? '已完成' :
             status === 'failed' ? '失败' : '排队中'}
          </span>
        )}
      </div>

      <div className="p-3">
        {data.output ? (
          <div className="max-h-[200px] overflow-y-auto text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {data.output as string}
          </div>
        ) : data.prompt ? (
          <div className="text-sm text-text-muted line-clamp-3">
            {data.prompt as string}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed border-node-border text-text-muted">
            <Type className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">点击编辑提示词</span>
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

export default memo(GenerateTextNode)
