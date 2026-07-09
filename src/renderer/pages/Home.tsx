import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Clock } from 'lucide-react'
import { projectAPI } from '../lib/api'
import type { Project } from '@shared'
import { formatDate } from '../lib/utils'

export default function Home() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectAPI.list()
      setProjects(data)
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleCreateProject = useCallback(async () => {
    setCreating(true)
    try {
      const project = await projectAPI.create('未命名项目')
      navigate(`/editor/${project.id}`)
    } finally {
      setCreating(false)
    }
  }, [navigate])

  const handleDeleteProject = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('确定要删除这个项目吗？此操作不可恢复。')) return
    await projectAPI.delete(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas-bg text-text-muted">
        <div className="animate-spin w-8 h-8 border-2 border-status-running border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-start p-8 overflow-y-auto">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-4xl font-bold text-text-primary">FlowCanvas Studio</h1>
        <p className="text-text-secondary">本地 AI 工作流画布软件</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel-bg border border-panel-border text-sm text-text-secondary hover:text-text-primary hover:border-node-border-hover transition-colors"
          >
            🎨 模板库
          </button>
          <button
            onClick={() => navigate('/prompts')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel-bg border border-panel-border text-sm text-text-secondary hover:text-text-primary hover:border-node-border-hover transition-colors"
          >
            📋 提示词库
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel-bg border border-panel-border text-sm text-text-secondary hover:text-text-primary hover:border-node-border-hover transition-colors"
          >
            ⚙️ 设置
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <h2 className="mb-4 text-lg font-medium text-text-primary">最近项目</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* New Project Card */}
          <button
            onClick={handleCreateProject}
            disabled={creating}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-node-border bg-node-bg/50 p-8 transition-all hover:border-node-border-hover hover:bg-node-bg min-h-[180px]"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-panel-header group-hover:bg-panel-border transition-colors">
              <Plus className="h-7 w-7 text-text-muted group-hover:text-text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              {creating ? '创建中...' : '新建项目'}
            </span>
          </button>

          {/* Project Cards */}
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/editor/${project.id}`)}
              className="group relative flex flex-col rounded-xl border border-node-border bg-node-bg p-4 cursor-pointer transition-all hover:border-node-border-hover hover:shadow-lg min-h-[180px]"
            >
              <div className="mb-3 aspect-video rounded-lg bg-panel-header flex items-center justify-center">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="mb-1 text-sm font-medium text-text-primary truncate">
                {project.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Clock className="w-3 h-3" />
                {formatDate(project.updatedAt)}
              </div>
              <button
                onClick={(e) => handleDeleteProject(project.id, e)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-status-failed/20 text-text-muted hover:text-status-failed transition-all"
                title="删除项目"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="mt-8 text-center text-text-muted">
            <p>暂无项目，点击上方「新建项目」开始创作</p>
          </div>
        )}
      </div>
    </div>
  )
}
