export const APP_NAME = 'FlowCanvas Studio'
export const APP_VERSION = '0.1.0'
export const DEFAULT_PROJECT_NAME = '未命名项目'

export const NODE_CATALOG: Record<string, { label: string; icon: string; defaultWidth: number; defaultHeight: number }> = {
  'asset.image': { label: '图片', icon: 'Image', defaultWidth: 320, defaultHeight: 320 },
  'asset.video': { label: '视频', icon: 'Video', defaultWidth: 320, defaultHeight: 240 },
  'asset.audio': { label: '音频', icon: 'AudioLines', defaultWidth: 320, defaultHeight: 120 },
  'asset.text': { label: '文本', icon: 'FileText', defaultWidth: 320, defaultHeight: 200 },
  'generate.text': { label: '文本生成', icon: 'Type', defaultWidth: 320, defaultHeight: 200 },
  'generate.image': { label: '图像生成', icon: 'Sparkles', defaultWidth: 320, defaultHeight: 320 },
  'generate.video': { label: '视频生成', icon: 'Film', defaultWidth: 320, defaultHeight: 240 },
  'generate.audio': { label: '音频生成', icon: 'Music', defaultWidth: 320, defaultHeight: 120 },
  'group': { label: '分组', icon: 'Folder', defaultWidth: 400, defaultHeight: 300 },
  'note': { label: '便签', icon: 'StickyNote', defaultWidth: 240, defaultHeight: 160 }
}

export const ASSET_TYPES = ['image', 'video', 'audio', 'text'] as const
export const TASK_TYPES = ['text', 'image', 'video', 'audio'] as const

export const PROVIDER_TYPES = [
  { value: 'openai-compatible', label: 'OpenAI Compatible', description: '兼容 OpenAI API 的提供商' },
  { value: 'ollama', label: 'Ollama', description: '本地运行的大语言模型' },
  { value: 'comfyui', label: 'ComfyUI', description: '本地 ComfyUI 工作流' },
  { value: 'sd-webui', label: 'Stable Diffusion WebUI', description: '本地 SD WebUI' }
] as const

export const RATIOS = [
  { value: 'auto', label: '自适应', width: 0, height: 0 },
  { value: '1:1', label: '1:1', width: 1024, height: 1024 },
  { value: '2:1', label: '2:1', width: 1536, height: 768 },
  { value: '4:3', label: '4:3', width: 1024, height: 768 },
  { value: '3:4', label: '3:4', width: 768, height: 1024 },
  { value: '16:9', label: '16:9', width: 1024, height: 576 },
  { value: '9:16', label: '9:16', width: 576, height: 1024 },
  { value: '21:9', label: '21:9', width: 1344, height: 576 },
  { value: '9:21', label: '9:21', width: 576, height: 1344 }
] as const

export const RESOLUTIONS = [
  { value: '1K', label: '1K', maxDimension: 1024 },
  { value: '2K', label: '2K', maxDimension: 2048 },
  { value: '4K', label: '4K', maxDimension: 4096 }
] as const

export const QUALITY_LEVELS = [
  { value: 'low', label: '低画质' },
  { value: 'standard', label: '标准画质' },
  { value: 'high', label: '高画质' }
] as const
