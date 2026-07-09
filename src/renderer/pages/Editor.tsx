import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import TopBar from '../components/panels/TopBar'
import AssetPanel from '../components/panels/AssetPanel'
import CopilotPanel from '../components/panels/CopilotPanel'
import GenerationPanel from '../components/panels/GenerationPanel'
import TaskLogPanel from '../components/panels/TaskLogPanel'
import FlowCanvas, { type FlowCanvasRef } from '../components/canvas/FlowCanvas'
import { projectAPI, templateAPI } from '../lib/api'
import type { Project } from '@shared'
import type { Node, Edge } from '@xyflow/react'

interface ActiveGenNode {
  nodeId: string
  nodeType: 'generate.text' | 'generate.image'
}

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [canvasData, setCanvasData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const canvasRef = useRef<FlowCanvasRef>(null)
  const [showTaskLog, setShowTaskLog] = useState(false)
  const [activeGenNode, setActiveGenNode] = useState<ActiveGenNode | null>(null)
  const sseRef = useRef<EventSource | null>(null)

  // Save as template modal
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateForm, setTemplateForm] = useState({ title: '', category: 'storyboard', description: '' })

  useEffect(() => {
    if (!projectId) return

    Promise.all([
      projectAPI.get(projectId),
      projectAPI.loadCanvas(projectId).catch(() => null)
    ])
      .then(([projectData, canvas]) => {
        setProject(projectData)
        if (canvas) {
          setCanvasData({
            nodes: canvas.nodes as Node[],
            edges: canvas.edges as Edge[]
          })
        }
      })
      .catch(() => navigate('/'))
  }, [projectId, navigate])

  const handleSave = useCallback(async () => {
    if (!projectId || !canvasRef.current) return
    setSaving(true)
    try {
      const nodes = canvasRef.current.getNodes()
      const edges = canvasRef.current.getEdges()
      await projectAPI.saveCanvas(projectId, nodes, edges)
    } finally {
      setSaving(false)
    }
  }, [projectId])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!projectId) return
    const interval = setInterval(() => {
      handleSave()
    }, 30000)
    return () => clearInterval(interval)
  }, [projectId, handleSave])

  // SSE: listen for task updates
  useEffect(() => {
    if (!projectId) return

    const sse = new EventSource(`http://127.0.0.1:3001/api/tasks/stream?projectId=${projectId}`)
    sseRef.current = sse

    sse.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        if (!update.taskId) return

        if (canvasRef.current) {
          const nodeId = update.nodeId || findNodeIdByTask(canvasRef.current.getNodes(), update.taskId)
          if (nodeId) {
            const newData: Record<string, unknown> = {
              status: update.status,
              progress: update.progress ?? 0
            }

            if (update.status === 'completed' && update.output) {
              if (update.output.text !== undefined) {
                newData.output = update.output.text
              }
              if (update.output.images && update.output.images.length > 0) {
                newData.outputUrl = update.output.images[0].url
              }
            }

            if (update.status === 'failed' && update.errorMessage) {
              newData.error = update.errorMessage
            }

            canvasRef.current.updateNodeData(nodeId, newData)
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    sse.onerror = () => {
      // Auto-reconnect is handled by EventSource
    }

    return () => {
      sse.close()
    }
  }, [projectId])

  // Handle node click: open generation panel for generate nodes
  const handleNodeClick = useCallback((node: Node) => {
    if (node.type === 'generate.text') {
      setActiveGenNode({ nodeId: node.id, nodeType: 'generate.text' })
    } else if (node.type === 'generate.image') {
      setActiveGenNode({ nodeId: node.id, nodeType: 'generate.image' })
    }
  }, [])

  // When a task is created, mark the node as queued
  const handleTaskCreated = useCallback((taskId: string) => {
    if (activeGenNode && canvasRef.current) {
      canvasRef.current.updateNodeData(activeGenNode.nodeId, {
        status: 'queued',
        progress: 0,
        taskId
      })
    }
    setActiveGenNode(null)
    setShowTaskLog(true)
  }, [activeGenNode])

  // Save current canvas as template
  const handleSaveAsTemplate = useCallback(async () => {
    if (!canvasRef.current) return
    setTemplateForm({ title: project?.name ? `${project.name} 模板` : '未命名模板', category: 'storyboard', description: '' })
    setShowSaveTemplate(true)
  }, [project])

  const handleSubmitTemplate = useCallback(async () => {
    if (!canvasRef.current || !templateForm.title) return
    const nodes = canvasRef.current.getNodes()
    const edges = canvasRef.current.getEdges()
    await templateAPI.create({
      title: templateForm.title,
      category: templateForm.category,
      description: templateForm.description,
      graph: { nodes: nodes as any, edges: edges as any },
      tags: []
    })
    setShowSaveTemplate(false)
  }, [templateForm])

  // Export canvas as JSON
  const handleExport = useCallback(() => {
    if (!canvasRef.current || !project) return
    const nodes = canvasRef.current.getNodes()
    const edges = canvasRef.current.getEdges()
    const data = { project: { name: project.name, id: project.id }, nodes, edges, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name || 'flowcanvas'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [project])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault()
          handleSave()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas-bg text-text-muted">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-status-running border-t-transparent rounded-full mx-auto mb-3" />
          <p>加载项目中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar
        projectName={project.name}
        onSave={handleSave}
        saving={saving}
        onToggleTaskLog={() => setShowTaskLog((v) => !v)}
        taskLogOpen={showTaskLog}
        onSaveAsTemplate={handleSaveAsTemplate}
        onExport={handleExport}
      />
      <div className="flex flex-1 overflow-hidden">
        <AssetPanel projectId={projectId} canvasRef={canvasRef} />
        <div className="flex-1 relative">
          <FlowCanvas
            ref={canvasRef}
            initialNodes={canvasData?.nodes}
            initialEdges={canvasData?.edges}
            onNodeClick={handleNodeClick}
          />

          {/* Generation input panel */}
          {activeGenNode && projectId && (
            <GenerationPanel
              nodeId={activeGenNode.nodeId}
              nodeType={activeGenNode.nodeType}
              projectId={projectId}
              onClose={() => setActiveGenNode(null)}
              onTaskCreated={handleTaskCreated}
            />
          )}
        </div>
        {showTaskLog && projectId && (
          <TaskLogPanel
            projectId={projectId}
            onClose={() => setShowTaskLog(false)}
          />
        )}
        <CopilotPanel />
      </div>

      {/* Save as Template Modal */}
      {showSaveTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-panel-border bg-panel-bg p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-text-primary mb-4">保存为模板</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">标题</label>
                <input
                  type="text"
                  value={templateForm.title}
                  onChange={e => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="模板名称"
                  className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-running"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">分类</label>
                <select
                  value={templateForm.category}
                  onChange={e => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-status-running"
                >
                  <option value="storyboard">故事板</option>
                  <option value="concept">概念设计</option>
                  <option value="social">社交媒体</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">描述</label>
                <textarea
                  value={templateForm.description}
                  onChange={e => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="模板描述（可选）"
                  rows={3}
                  className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-running resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowSaveTemplate(false)}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-panel-header transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitTemplate}
                className="px-4 py-2 rounded-lg text-sm bg-status-running text-white hover:bg-status-running/90 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper: find node ID by task ID from node data
function findNodeIdByTask(nodes: Node[], taskId: string): string | undefined {
  return nodes.find((n) => n.data?.taskId === taskId)?.id
}
