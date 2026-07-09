import { create } from 'zustand'

interface ProjectState {
  projects: Array<{ id: string; name: string; updatedAt: string }>
  currentProjectId: string | null
  setCurrentProject: (id: string | null) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProjectId: null,
  setCurrentProject: (id) => set({ currentProjectId: id })
}))
