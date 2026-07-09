export type NodeType =
  | 'asset.image'
  | 'asset.video'
  | 'asset.audio'
  | 'asset.text'
  | 'generate.text'
  | 'generate.image'
  | 'generate.video'
  | 'generate.audio'
  | 'process.image'
  | 'group'
  | 'note'
  | 'comfyui.workflow'

export type ProviderType = 'openai-compatible' | 'ollama' | 'comfyui' | 'sd-webui'

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

export type Theme = 'dark' | 'light' | 'system'

export interface CanvasNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  size?: { width: number; height: number }
  data: Record<string, any>
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  thumbnailPath?: string
  createdAt: string
  updatedAt: string
}

export interface Asset {
  id: string
  projectId?: string
  type: string
  name: string
  mimeType?: string
  filePath?: string
  thumbnailPath?: string
  metadata?: Record<string, any>
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  projectId: string
  nodeId: string
  type: string
  provider: string
  model: string
  status: TaskStatus
  progress: number
  input?: Record<string, any>
  output?: Record<string, any>
  errorMessage?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface ModelProvider {
  id: string
  name: string
  type: ProviderType
  baseUrl?: string
  apiKey?: string
  config?: Record<string, any>
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface PromptTemplate {
  id: string
  title: string
  category?: string
  content: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface WorkflowTemplate {
  id: string
  title: string
  category?: string
  description?: string
  graph: { nodes: CanvasNode[]; edges: CanvasEdge[] }
  thumbnailPath?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  theme: Theme
  language: string
  autoSave: boolean
  autoSaveInterval: number
}

export interface ImageGenerationParams {
  ratio: 'auto' | '1:1' | '2:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9' | '9:21' | '360panorama'
  resolution: '1K' | '2K' | '4K'
  quality: 'low' | 'standard' | 'high'
  count: number
  size?: string
}

export interface TextGenerationParams {
  temperature: number
  maxTokens: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export type GenerationParams = ImageGenerationParams | TextGenerationParams
