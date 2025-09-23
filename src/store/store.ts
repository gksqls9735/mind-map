import type { Edge, Node } from "@/type/common";
import { create } from "zustand";
import { stratify, tree } from 'd3-hierarchy';

type MindMapState = {
  nodes: Node[];
  edges: Edge[];
  draggingNodeId: string | null;
  selectedNodeId: string | null;
  editingNodeId: string | null;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNodePosition: (nodeId: string, movement: { x: number; y: number }) => void;
  updateNodeDimension: (nodeId: string, dimersion: { width: number; height: number }) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  setDraggingNodeId: (nodeId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setEditingNodeId: (node: string | null) => void;
  deleteNode: (nodeIdToDelete: string | null) => void;
  setMindMap: (data: { nodes: Node[]; edges: Edge[] }) => void;
  autoLayout: () => void;
}

export const useMindMapStore = create<MindMapState>((set, get) => ({
  nodes: [
    { id: '1', position: { x: 100, y: 100 }, data: { label: '중심 주제' }, color: 'bg-amber-200' },
    { id: '2', position: { x: 300, y: 100 }, data: { label: '하위 주제' }, color: 'bg-sky-200' },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
  ],
  draggingNodeId: null,
  selectedNodeId: null,
  editingNodeId: null,
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
  updateNodeDimension: (nodeId, dimension) =>
    set((state) => ({
      nodes: state.nodes.map((node) => node.id === nodeId ? { ...node, ...dimension } : node)
    })),
  updateNodeLabel: (nodeId, label) =>
    set((state) => ({
      nodes: state.nodes.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, label } } : node)
    })),
  updateNodeColor: (nodeId, color) =>
    set((state) => ({
      nodes: state.nodes.map((node) => node.id === nodeId ? { ...node, color } : node)
    })),
  setDraggingNodeId: (nodeId) => set({ draggingNodeId: nodeId }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  setEditingNodeId: (nodeId) => set({ editingNodeId: nodeId }),
  deleteNode: (nodeIdToDelete) => {
    if (!nodeIdToDelete) return;
    const currentEdges = get().edges;
    const currentNodes = get().nodes;

    const newEdges = currentEdges.filter(edge => edge.source !== nodeIdToDelete && edge.target !== nodeIdToDelete);

    const nodesToDelete = new Set<string>([nodeIdToDelete]);

    const findChildren = (nodeId: string) => {
      currentEdges.filter(edge => edge.source === nodeId).forEach(edge => {
        nodesToDelete.add(edge.target);
        findChildren(edge.target);
      })
    };
    findChildren(nodeIdToDelete);

    const newNodes = currentNodes.filter(node => !nodesToDelete.has(node.id));
    set({ nodes: newNodes, edges: newEdges, selectedNodeId: null })
  },
  setMindMap: (data) => set({ nodes: data.nodes, edges: data.edges }),
  autoLayout: () => {
    const currentNodes = get().nodes;
    const currentEdges = get().edges;

    if (currentNodes.length === 0) return;

    // 데이터 준비 및 레이아웃 계산
    const rootNodes = findRootNodes(currentNodes, currentEdges);
    const VIRTUAL_ROOT_ID = '__VIRTUAL_ROOT__';
    const virtualRootNode: Node = {
      id: VIRTUAL_ROOT_ID,
      position: { x: 0, y: 0 },
      data: { label: 'Virtual Root' },
    };
    const virtualEdges: Edge[] = rootNodes.map(rootNode => ({
      id: `v-${rootNode.id}`,
      source: VIRTUAL_ROOT_ID,
      target: rootNode.id,
    }));
    const allNodes = [...currentNodes, virtualRootNode];
    const allEdges = [...currentEdges, ...virtualEdges];
    const edgeMap = new Map(allEdges.map(edge => [edge.target, edge.source]));
    
    const root = stratify<Node>()
      .id(d => d.id)
      .parentId(d => edgeMap.get(d.id))
      (allNodes);
      
    const treeLayout = tree<Node>()
        .nodeSize([220, 120]); // 각 노드가 가로 220px, 세로 120px 공간을 차지하도록 설정
    const treeData = treeLayout(root);
    
    // 1. 계산된 실제 노드들의 위치 정보만 추출
    const calculatedNodes = treeData.descendants().filter(d3Node => d3Node.id !== VIRTUAL_ROOT_ID);
    if (calculatedNodes.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    calculatedNodes.forEach(d3Node => {
      if (d3Node.x < minX) minX = d3Node.x;
      if (d3Node.y < minY) minY = d3Node.y;
    });

    const PADDING = 50;
    const offsetX = PADDING - minX;
    const offsetY = PADDING - minY;

    const newNodes = calculatedNodes.map(d3Node => {
      const originalNode = d3Node.data;
      return {
        ...originalNode,
        position: { 
          x: d3Node.x + offsetX,
          y: d3Node.y + offsetY,
        },
      };
    });


    set({ nodes: newNodes });
  },
}));

// 루트 노드 찾기
function findRootNodes(nodes: Node[], edges: Edge[]): Node[] {
  const targetIds = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targetIds.has(n.id));
  // 만약 독립된 노드가 하나도 없다면 (순환 구조 등), 첫 노드를 루트로 반환
  return roots.length > 0 ? roots : (nodes.length > 0 ? [nodes[0]] : []);
}