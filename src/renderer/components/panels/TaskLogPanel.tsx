import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Loader2, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react'
import { taskAPI } from '../../lib/api'

interface TaskLog {
  id: string
  type: string
  model: string
  status: string
  progress: number
  error_message?: string
  created_at: string
}

interface TaskLogPanelProps {
  projectId?: string
  onClose: () => void
}

export default function TaskLogPanel({ projectId, onClose }: TaskLogPanelProps) {
  const [tasks, setTasks] = useState<TaskLog[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const sseRef = useRef<EventSource | null>(null)

  const loadTasks = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const data = await taskAPI.list(projectId)
      setTasks(data.map(t => ({
        id: t.id,
        type: t.type,
        model: t.model,
        status: t.status,
        progress: t.progress,
        error_message: t.errorMessage,
        created_at: t.createdAt
      })))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // SSE connection for real-time task updates
  useEffect(() => {
    if (!projectId) return

    const sse = new EventSource(`http://127.0.0.1:3001/api/tasks/stream?projectId=${projectId}`)
    sseRef.current = sse

    sse.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        setTasks(prev => prev.map(t =>
          t.id === update.taskId
            ? { ...t, status: update.status, progress: update.progress }
            : t
        ))
      } catch {
        // ignore parse errors
      }
    }

    return () => {
      sse.close()
    }
  }, [projectId])

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-status-running" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-status-completed" />
      case 'failed': return <XCircle className="w-4 h-4 text-status-failed" />
      case 'queued': return <Clock className="w-4 h-4 text-status-queued" />
      default: return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中'
      case 'completed': return '已完成'
      case 'failed': return '失败'
      case 'queued': return '排队中'
      default: return status
    }
  }

  const handleRetry = useCallback(async (_taskId: string) => {
    // For now, just reload tasks
    loadTasks()
  }, [loadTasks])

  return (
    <div className="flex w-80 flex-col border-l border-panel-border bg-panel-bg h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
        <h3 className="text-sm font-medium text-text-primary">📋 任务日志</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-panel-header text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-panel-border">
        {[
          { key: 'all', label: '全部' },
          { key: 'running', label: '运行中' },
          { key: 'completed', label: '成功' },
          { key: 'failed', label: '失败' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              filter === key
                ? 'bg-status-running/20 text-status-running'
                : 'text-text-muted hover:text-text-secondary hover:bg-panel-header'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-sm text-text-muted">
            暂无任务记录
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="rounded-lg border border-node-border bg-node-bg p-2.5 hover:border-node-border-hover transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(task.status)}
                  <span className="text-xs font-medium text-text-primary flex-1 truncate">
                    {task.type === 'text' ? '📝 文本生成' : '🎨 图像生成'}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    task.status === 'running' ? 'bg-status-running/20 text-status-running' :
                    task.status === 'completed' ? 'bg-status-completed/20 text-status-completed' :
                    task.status === 'failed' ? 'bg-status-failed/20 text-status-failed' :
                    'bg-status-queued/20 text-status-queued'
                  }`}>
                    {getStatusText(task.status)}
                  </span>
                </div>

                <p className="text-xs text-text-muted truncate mb-1">{task.model}</p>

                {task.status === 'running' && (
                  <div className="w-full bg-panel-header rounded-full h-1.5 mt-1">
                    <div
                      className="bg-status-running h-1.5 rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}

                {task.status === 'failed' && task.error_message && (
                  <p className="text-xs text-status-failed mt-1 truncate">{task.error_message}</p>
                )}

                {task.status === 'failed' && (
                  <button
                    onClick={() => handleRetry(task.id)}
                    className="flex items-center gap-1 mt-1 text-xs text-text-muted hover:text-status-running transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    重试
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
