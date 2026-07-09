import type { Project, Asset, Task, ModelProvider, PromptTemplate, WorkflowTemplate } from '@shared'

const API_BASE = import.meta.env.VITE_API_BASE || ''

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// Projects
export const projectAPI = {
  list: () => fetchAPI<Project[]>('/api/projects'),
  create: (name?: string, description?: string) =>
    fetchAPI<Project>('/api/projects', { method: 'POST', body: JSON.stringify({ name, description }) }),
  get: (id: string) => fetchAPI<Project>(`/api/projects/${id}`),
  update: (id: string, data: Partial<Project>) =>
    fetchAPI<Project>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/api/projects/${id}`, { method: 'DELETE' }),
  saveCanvas: (id: string, nodes: unknown[], edges: unknown[], viewport?: unknown) =>
    fetchAPI<{ snapshotId: string; version: number }>(`/api/projects/${id}/save-canvas`, {
      method: 'POST',
      body: JSON.stringify({ nodes, edges, viewport })
    }),
  loadCanvas: (id: string) =>
    fetchAPI<{ nodes: unknown[]; edges: unknown[]; viewport: unknown | null }>(`/api/projects/${id}/canvas`)
}

// Assets
export const assetAPI = {
  list: (params?: { projectId?: string; type?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return fetchAPI<Asset[]>(`/api/assets${qs}`)
  },
  get: (id: string) => fetchAPI<Asset>(`/api/assets/${id}`),
  delete: (id: string) => fetchAPI<void>(`/api/assets/${id}`, { method: 'DELETE' }),
  restore: (id: string) => fetchAPI<{ id: string; restored: boolean }>(`/api/assets/${id}/restore`, { method: 'POST' })
}

// Tasks
export const taskAPI = {
  list: (projectId: string) => fetchAPI<Task[]>(`/api/tasks/project/${projectId}`),
  create: (data: { projectId: string; nodeId: string; type: string; provider: string; model: string; input?: unknown }) =>
    fetchAPI<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) => fetchAPI<Task>(`/api/tasks/${id}`),
  cancel: (id: string) => fetchAPI<Task>(`/api/tasks/${id}/cancel`, { method: 'POST' })
}

// Providers
export const providerAPI = {
  list: () => fetchAPI<ModelProvider[]>('/api/providers'),
  create: (data: Omit<ModelProvider, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<ModelProvider>('/api/providers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ModelProvider>) =>
    fetchAPI<ModelProvider>(`/api/providers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/api/providers/${id}`, { method: 'DELETE' }),
  test: (id: string) => fetchAPI<{ connected: boolean; message: string }>(`/api/providers/${id}/test`, { method: 'POST' }),
  getModels: (id: string) => fetchAPI<{ models: Array<{ id: string; name: string }> }>(`/api/providers/${id}/models`)
}

// Prompts
export const promptAPI = {
  list: (category?: string) =>
    fetchAPI<PromptTemplate[]>(`/api/prompts${category ? `?category=${category}` : ''}`),
  create: (data: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<PromptTemplate>('/api/prompts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<PromptTemplate>) =>
    fetchAPI<PromptTemplate>(`/api/prompts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/api/prompts/${id}`, { method: 'DELETE' })
}

// Templates
export const templateAPI = {
  list: () => fetchAPI<WorkflowTemplate[]>('/api/templates'),
  get: (id: string) => fetchAPI<WorkflowTemplate>(`/api/templates/${id}`),
  create: (data: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<WorkflowTemplate>('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<WorkflowTemplate>) =>
    fetchAPI<WorkflowTemplate>(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/api/templates/${id}`, { method: 'DELETE' }),
  apply: (id: string, projectId: string, position?: { x: number; y: number }) =>
    fetchAPI<{ applied: boolean; nodes: unknown[]; edges: unknown[] }>(`/api/templates/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify({ projectId, position })
    })
}
