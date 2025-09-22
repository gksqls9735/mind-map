import { useMindMapStore } from "@/store/store";
import type { Edge as EdgeType, Node as NodeType } from "@/type/common";
import Edge from "@/component/edge";
import Node from "@/component/node";

export default function Canvas() {
  const {
    nodes, edges, draggingNodeId, selectedNodeId,
    updateNodePosition, setDraggingNodeId,
    addNode, addEdge, setSelectedNodeId
  } = useMindMapStore();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) updateNodePosition(draggingNodeId, { x: e.movementX, y: e.movementY });
  };

  const handleMouseUp = () => setDraggingNodeId(null);

  const handleCanvasClick = () => setSelectedNodeId(null);

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (selectedNodeId) {
      const newNodeId = `${Date.now()}`;
      const newNode: NodeType = {
        id: newNodeId,
        position: { x: e.clientX, y: e.clientY },
        data: { label: '새 주제' },
      };

      const newEdge: EdgeType = {
        id: `e${selectedNodeId}-${newNodeId}`,
        source: selectedNodeId,
        target: newNodeId,
      };

      addNode(newNode);
      addEdge(newEdge);
    }
  };

  return (
    <div
      className="canvas w-screen h-screen bg-gray-100 relative overflow-hidden"
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