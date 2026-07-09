import { create } from 'zustand'
import type { Node, Edge } from '@xyflow/react'

interface CanvasState {
  nodes: Node[]
  edges: Edge[]
  selectedNodeIds: string[]
  viewport: { x: number; y: number; zoom: number }

  // Actions
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
  addNode: (node: Node) => void
  updateNode: (id: string, data: Partial<Node>) => void
  removeNode: (id: string) => void
  addEdge: (edge: Edge) => void
  removeEdge: (id: string) => void
  setSelectedNodeIds: (ids: string[]) => void
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
  resetCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },

  setNodes: (nodes) => {
    set((state) => ({
      nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
    }))
  },

  setEdges: (edges) => {
    set((state) => ({
      edges: typeof edges === 'function' ? edges(state.edges) : edges
    }))
  },

  addNode: (node) => {
    set((state) => ({ nodes: [...state.nodes, node] }))
  },

  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, ...data } : n
      )
    }))
  },

  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id)
    }))
  },

  addEdge: (edge) => {
    set((state) => ({ edges: [...state.edges, edge] }))
  },

  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id)
    }))
  },

  setSelectedNodeIds: (ids) => {
    set({ selectedNodeIds: ids })
  },

  setViewport: (viewport) => {
    set({ viewport })
  },

  resetCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeIds: [], viewport: { x: 0, y: 0, zoom: 1 } })
  }
}))
