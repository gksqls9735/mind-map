import type { Edge, Node } from "@/type/common";
import { create } from "zustand";
import { stratify, tree } from 'd3-hierarchy';

type LayoutMode = 'tree' | 'radial' | 'none';

type MindMapState = {
  nodes: Node[];
  edges: Edge[];
  draggingNodeId: string | null;
  selectedNodeId: string | null;
  editingNodeId: string | null;
  layoutMode: LayoutMode;
  viewOffset: { x: number; y: number };
  zoom: number;
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
  autoLayout: (layoutType: LayoutMode) => void;
  panView: (delta: { dx: number; dy: number }) => void;
  zoomToPoint: (delta: number, point: { x: number; y: number }) => void;
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
  layoutMode: 'none',
  viewOffset: { x: 0, y: 0 },
  zoom: 1,
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  updateNodePosition: (nodeId, movement) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, position: { x: node.position.x + movement.x, y: node.position.y + movement.y } }
          : node
      ),
      layoutMode: 'none',
    })),
  updateNodeDimension: (nodeId, dimension) =>
    set((state) => ({
      nodes: state.nodes.map((node) => node.id === nodeId ? { ...node, ...dimension } : node),
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
  autoLayout: (layoutType) => {
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

    const layoutGenerator = layoutType === 'radial'
      ? tree<Node>().size([2 * Math.PI, 350 * Math.ceil(rootNodes.length / 2)]) // 360도, 반지름
      : tree<Node>().nodeSize([220, 120]); // 기존 트리 레이아웃

    const treeData = layoutGenerator(root);

    const calcNodes = treeData.descendants().filter(d3Node => d3Node.id !== VIRTUAL_ROOT_ID);
    if (calcNodes.length === 0) return;

    const positions = calcNodes.map(d3Node => {
      if (layoutType === 'radial') {
        // 방사형 레이아웃: d3Node.x는 각도, d3Node.y는 반지름
        const angle = d3Node.x;
        const radius = d3Node.y;
        return {
          x: radius * Math.cos(angle - Math.PI / 2),
          y: radius * Math.sin(angle - Math.PI / 2),
        };
      } else {
        // 트리 레이아웃: d3Node.x, d3Node.y는 그대로 사용
        return { x: d3Node.x, y: d3Node.y };
      }
    });

    let minX = Infinity, minY = Infinity;
    positions.forEach(pos => {
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
    });

    const PADDING = 50;
    const offsetX = PADDING - minX;
    const offsetY = PADDING - minY;

    const newNodes = calcNodes.map((d3Node, i) => {
      const originalNode = d3Node.data;
      const pos = positions[i];
      return {
        ...originalNode,
        position: {
          x: pos.x + offsetX,
          y: pos.y + offsetY,
        },
      };
    });

    set({ nodes: newNodes, layoutMode: layoutType });
  },
  panView: (delta) => set((state) => ({
    viewOffset: {
      x: state.viewOffset.x + delta.dx,
      y: state.viewOffset.y + delta.dy,
    }
  })),
  zoomToPoint: (delta, point) => {
    const currentZoom = get().zoom;
    const currentViewOffset = get().viewOffset;
    const newZoom = Math.max(0.1, Math.min(currentZoom - delta * 0.001, 5));  // 줌 범위 제한 (10% ~ 500%)

    // 마우스 포인터를 기준으로 viewOffset을 재계산하여 확대/축소 효과를 만듦
    const newViewOffsetX = point.x - (point.x - currentViewOffset.x) * (newZoom / currentZoom);
    const newViewOffsetY = point.y - (point.y - currentViewOffset.y) * (newZoom / currentZoom);

    set({ zoom: newZoom, viewOffset: { x: newViewOffsetX, y: newViewOffsetY } });
  },
}));

// 루트 노드 찾기
function findRootNodes(nodes: Node[], edges: Edge[]): Node[] {
  const targetIds = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targetIds.has(n.id));
  // 만약 독립된 노드가 하나도 없다면 (순환 구조 등), 첫 노드를 루트로 반환
  return roots.length > 0 ? roots : (nodes.length > 0 ? [nodes[0]] : []);
}