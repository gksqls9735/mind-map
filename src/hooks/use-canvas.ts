import { useMindMapStore } from "@/store/store";
import type { Edge as EdgeType, Node as NodeType } from "@/type/common";
import { useRef } from "react";


export function useCanvas() {
  const {
    nodes, edges, draggingNodeId, selectedNodeId,
    updateNodePosition, setDraggingNodeId,
    addNode, addEdge, setSelectedNodeId, setMindMap
  } = useMindMapStore();

  const clickTimer = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) updateNodePosition(draggingNodeId, { x: e.movementX, y: e.movementY });
  };

  const handleMouseUp = () => setDraggingNodeId(null);

  const handleCanvasClick = () => {
    clickTimer.current = window.setTimeout(() => {
      setSelectedNodeId(null);
    }, 200);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (clickTimer.current) clearTimeout(clickTimer.current);

    const newNodeId = `${Date.now()}`;
    const newNode: NodeType = {
      id: newNodeId,
      position: { x: e.clientX - 80, y: e.clientY - 25 },
      data: { label: '새 주제' },
    };

    if (selectedNodeId) {
      const newEdge: EdgeType = {
        id: `e${selectedNodeId}-${newNodeId}`,
        source: selectedNodeId,
        target: newNodeId,
      };

      addNode(newNode);
      addEdge(newEdge);
    } else {
      addNode(newNode);
    }

    //setSelectedNodeId(newNodeId);
  };

  const handleSave = () => {
    const mindMapData = { nodes, edges };
    window.electronAPI.saveFile(mindMapData);
  };

  const handleLoad = async () => {
    const mindMapData = await window.electronAPI.loadFile();
    if (mindMapData) {
      setMindMap(mindMapData);
    }
  };

  return {
    handleMouseMove, handleMouseUp,
    handleCanvasClick, handleCanvasDoubleClick,
    handleSave, handleLoad,
    edges, nodes
  };
}