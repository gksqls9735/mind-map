import { useMindMapStore } from "@/store/store";
import type { Edge as EdgeType, Node as NodeType } from "@/type/common";
import Edge from "@/component/edge";
import Node from "@/component/node";
import { useRef } from "react";

const canvasBackgroundStyle = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
  backgroundSize: '20px 20px',
};

export default function Canvas() {
  const {
    nodes, edges, draggingNodeId, selectedNodeId,
    updateNodePosition, setDraggingNodeId,
    addNode, addEdge, setSelectedNodeId
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

//    setSelectedNodeId(newNodeId);
  };

  return (
    <div
      className="canvas w-screen h-screen bg-slate-100 relative overflow-hidden"
      style={canvasBackgroundStyle}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
    >
      {edges.map((edge) => (
        <Edge key={edge.id} edge={edge} />
      ))}
      {nodes.map((node) => (
        <Node key={node.id} node={node} />
      ))}
    </div>
  );
}