import type { Edge, Node } from "@/type/common";
import { create } from "zustand";

type MindMapState = {
  nodes: Node[];
  edges: Edge[];
  draggingNodeId: string | null;
  selectedNodeId: string | null;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNodePosition: (nodeId: string, movement: { x: number; y: number }) => void;
  setDraggingNodeId: (nodeId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
}

export const useMindMapStore = create<MindMapState>((set) => ({
  nodes: [
    { id: '1', position: { x: 100, y: 100 }, data: { label: '중심 주제' } },
    { id: '2', position: { x: 300, y: 100 }, data: { label: '하위 주제' } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
  ],
  draggingNodeId: null,
  selectedNodeId: null,
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  updateNodePosition: (nodeId, movement) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, position: { x: node.position.x + movement.x, y: node.position.y + movement.y } }
          : node
      ),
    })),
  setDraggingNodeId: (nodeId) => set({ draggingNodeId: nodeId }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
}));