import { useMindMapStore } from "@/store/store";
import type { Edge as EdgeType, Node as NodeType } from "@/type/common";

export function useNodeActions() {
  const { nodes, edges, addNode, addEdge, selectedNodeId, setSelectedNodeId } = useMindMapStore();

  const createChildNode = () => {
    if (!selectedNodeId) return;

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (!selectedNode) return;

    const newNodeId = `${Date.now()}`;

    const newNode: NodeType = {
      id: newNodeId,
      position: {
        x: selectedNode.position.x + (selectedNode.width ?? 150) + 50,
        y: selectedNode.position.y,
      },
      data: { label: '새 주제' },
    };

    const newEdge: EdgeType = {
      id: `e${selectedNodeId}-${newNodeId}`,
      source: selectedNodeId,
      target: newNodeId,
    };

    addNode(newNode);
    addEdge(newEdge);
    setSelectedNodeId(newNodeId);
  };

  const createSiblingNode = () => {
    if (!selectedNodeId) return;

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (!selectedNode) return;

    const parentEdge = edges.find(edge => edge.target === selectedNodeId);
    if (!parentEdge) return;

    const parentId = parentEdge.source;
    const newNodeId = `${Date.now()}`;

    const newNode: NodeType = {
      id: newNodeId,
      position: {
        x: selectedNode.position.x,
        y: selectedNode.position.y + (selectedNode.height ?? 50) + 30,
      },
      data: { label: '새 주제' },
    };

    const newEdge: EdgeType = {
      id: `e${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
    };

    addNode(newNode);
    addEdge(newEdge);
    setSelectedNodeId(newNodeId);
  };

  const canAddSibling = !!selectedNodeId && edges.some(edge => edge.target === selectedNodeId);

  return { createChildNode, createSiblingNode, canAddSibling };
}