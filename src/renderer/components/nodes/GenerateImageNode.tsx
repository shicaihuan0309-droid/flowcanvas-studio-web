import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Sparkles, Plus } from 'lucide-react'

function GenerateImageNode({ data, selected }: NodeProps) {
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
      className={`relative w-[300px] rounded-xl border bg-node-bg shadow-lg transition-all ${
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
          <Sparkles className="w-4 h-4 text-status-running" />
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
        {data.outputUrl ? (
          <img
            src={data.outputUrl as string}
            alt="Generated"
            className="w-full h-auto rounded-lg object-contain"
            style={{ maxHeight: '260px' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed border-node-border text-text-muted">
            <Sparkles className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs">点击编辑提示词</span>
            {status === 'running' && (
              <div className="mt-2 w-full max-w-[200px]">
                <div className="h-1 bg-panel-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-status-running rounded-full transition-all"
                    style={{ width: `${(data.progress as number) || 0}%` }}
                  />
                </div>
                <span className="text-xs mt-1">{String((data.progress as number) || 0)}%</span>
              </div>
            )}
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

export default memo(GenerateImageNode)
