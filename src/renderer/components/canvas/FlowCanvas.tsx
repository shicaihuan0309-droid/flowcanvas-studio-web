import { useCallback, useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  type Node,
  type Edge,
  type Connection,
  type XYPosition,
  type NodeTypes
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import DotGridBackground from './DotGridBackground'
import AddNodeMenu from './AddNodeMenu'
import AssetImageNode from '../nodes/AssetImageNode'
import AssetTextNode from '../nodes/AssetTextNode'
import GenerateImageNode from '../nodes/GenerateImageNode'
import GenerateTextNode from '../nodes/GenerateTextNode'
import NoteNode from '../nodes/NoteNode'
import { generateId, cn } from '../../lib/utils'
import type { Asset } from '@shared'

const nodeTypes: NodeTypes = {
  'asset.image': AssetImageNode,
  'asset.text': AssetTextNode,
  'generate.image': GenerateImageNode,
  'generate.text': GenerateTextNode,
  note: NoteNode
}

export interface FlowCanvasRef {
  getNodes: () => Node[]
  getEdges: () => Edge[]
  setNodesData: (nodes: Node[], edges: Edge[]) => void
  addNodeFromAsset: (asset: Asset, position?: XYPosition) => void
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void
}

interface FlowCanvasProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodeClick?: (node: Node) => void
}

const FlowCanvas = forwardRef<FlowCanvasRef, FlowCanvasProps>(
  ({ initialNodes = [], initialEdges = [], onNodeClick }, ref) => {
    const [nodes, setNodes, onNodesChangeInternal] = useNodesState<Node>(initialNodes)
    const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<Edge>(initialEdges)
    const [menuOpen, setMenuOpen] = useState(false)
    const [menuPosition, setMenuPosition] = useState<XYPosition>({ x: 0, y: 0 })
    const menuPositionRef = useRef<XYPosition>({ x: 0, y: 0 })
    const [isDragOver, setIsDragOver] = useState(false)

    useImperativeHandle(ref, () => ({
      getNodes: () => nodes,
      getEdges: () => edges,
      setNodesData: (newNodes, newEdges) => {
        setNodes(newNodes)
        setEdges(newEdges)
      },
      addNodeFromAsset: (asset, position) => {
        const id = generateId()
        const pos = position || { x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 }

        const newNode: Node = {
          id,
          type: asset.type === 'image' ? 'asset.image' : 'asset.text',
          position: pos,
          data: {
            label: asset.name,
            assetId: asset.id,
            url: asset.type === 'image' ? `http://127.0.0.1:3001/api/assets/${asset.id}/file` : undefined,
            content: asset.type === 'text' ? '文本内容...' : undefined
          }
        }
        setNodes((prev) => [...prev, newNode])
      },
      updateNodeData: (nodeId, newData) => {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
          )
        )
      }
    }), [nodes, edges, setNodes, setEdges])

    const onConnect = useCallback(
      (connection: Connection) => {
        const newEdges = addEdge(connection, edges)
        setEdges(newEdges)
      },
      [edges, setEdges]
    )

    const onPaneClick = useCallback(() => {
      setMenuOpen(false)
    }, [])

    const onPaneDoubleClick = useCallback(
      (event: React.MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect()
        const pos = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        }
        menuPositionRef.current = pos
        setMenuPosition(pos)
        setMenuOpen(true)
      },
      []
    )

    const handleNodeClick = useCallback(
      (_event: React.MouseEvent, node: Node) => {
        onNodeClick?.(node)
      },
      [onNodeClick]
    )

    const handleAddNode = useCallback(
      (type: string) => {
        const id = generateId()
        const position = menuPositionRef.current

        const newNode: Node = {
          id,
          type,
          position,
          data: { label: getDefaultLabel(type) }
        }

        setNodes((nds) => [...nds, newNode])
      },
      [setNodes]
    )

    const handleNodesDelete = useCallback(
      (deletedNodes: Node[]) => {
        const deletedIds = new Set(deletedNodes.map((n) => n.id))
        setNodes((prev) => prev.filter((n) => !deletedIds.has(n.id)))
        setEdges((prev) => prev.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)))
      },
      [setNodes, setEdges]
    )

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
    }, [])

    const handleDrop = useCallback(
      async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        // Get drop position in canvas coordinates
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        const dropX = e.clientX - rect.left
        const dropY = e.clientY - rect.top

        // Check if dropping an asset from AssetPanel
        const assetData = e.dataTransfer.getData('application/json')
        if (assetData) {
          try {
            const asset = JSON.parse(assetData)
            const newNode: Node = {
              id: generateId(),
              type: asset.type === 'image' ? 'asset.image' : 'asset.text',
              position: { x: dropX, y: dropY },
              data: {
                label: asset.name,
                assetId: asset.id,
                url: asset.type === 'image' ? `http://127.0.0.1:3001/api/assets/${asset.id}/file` : undefined,
                content: asset.type === 'text' ? '文本内容...' : undefined
              }
            }
            setNodes((prev) => [...prev, newNode])
            return
          } catch {
            // Not valid asset data, continue to file handling
          }
        }

        // Handle file drops from file system
        const files = Array.from(e.dataTransfer.files)
        if (files.length === 0) return

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const type = getFileType(file)
          if (!type) continue

          // Read file as base64
          const base64 = await readFileAsBase64(file)

          try {
            const id = generateId()
            const newNode: Node = {
              id,
              type: type === 'image' ? 'asset.image' : 'asset.text',
              position: { x: dropX + i * 40, y: dropY + i * 40 },
              data: {
                label: file.name,
                fileName: file.name,
                mimeType: file.type,
                url: type === 'image' ? `data:${file.type};base64,${base64}` : undefined,
                content: type === 'text' ? base64ToText(base64) : undefined
              }
            }
            setNodes((prev) => [...prev, newNode])
          } catch (err) {
            console.error('Failed to import file:', err)
          }
        }
      },
      [setNodes]
    )

    return (
      <div
        className={cn(
          'relative w-full h-full',
          isDragOver && 'ring-2 ring-status-running ring-inset'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeInternal}
          onEdgesChange={onEdgesChangeInternal}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onNodeDoubleClick={onPaneDoubleClick}
          onNodeClick={handleNodeClick}
          onNodesDelete={handleNodesDelete}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          selectNodesOnDrag={false}
          className="bg-canvas-bg"
          proOptions={{ hideAttribution: true }}
        >
          <DotGridBackground />
          <Controls
            className="!bg-panel-bg !border-panel-border !shadow-lg"
            style={{ color: 'var(--text-secondary)' }}
          />
          <MiniMap
            className="!bg-panel-bg !border-panel-border !rounded-lg"
            nodeColor={() => 'var(--node-border)'}
            maskColor="rgba(0,0,0,0.3)"
          />
          <Panel position="bottom-center">
            <BottomPanel />
          </Panel>
        </ReactFlow>

        {isDragOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-status-running/10 pointer-events-none">
            <div className="rounded-xl bg-panel-bg/90 border border-status-running px-6 py-3 shadow-lg">
              <p className="text-status-running font-medium">📁 释放以导入文件</p>
            </div>
          </div>
        )}

        {menuOpen && (
          <AddNodeMenu
            position={menuPosition}
            onSelect={handleAddNode}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
    )
  }
)

function BottomPanel() {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-1 rounded-full bg-panel-bg/85 px-4 py-2 backdrop-blur-md border border-panel-border shadow-lg">
      <button className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors">
        <span>◉</span> 选择
      </button>
      <button
        onClick={() => navigate('/templates')}
        className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors"
      >
        <span>🎨</span> 模板
      </button>
      <button
        onClick={() => navigate('/prompts')}
        className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-text-secondary hover:bg-panel-header transition-colors"
      >
        <span>📋</span> 提示词
      </button>
    </div>
  )
}

FlowCanvas.displayName = 'FlowCanvas'

export default FlowCanvas

function getDefaultLabel(type: string): string {
  const labels: Record<string, string> = {
    'asset.image': '图片',
    'asset.text': '文本',
    'generate.image': '图像生成',
    'generate.text': '文本生成',
    note: '便签'
  }
  return labels[type] || '节点'
}

function getFileType(file: File): 'image' | 'text' | null {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md')) return 'text'
  return null
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix if present
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function base64ToText(base64: string): string {
  try {
    return atob(base64)
  } catch {
    return ''
  }
}
