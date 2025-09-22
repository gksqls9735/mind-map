import { useMindMapStore } from "@/store/store";
import type { Node as NodeType } from "@/type/common";

export default function ({ node }: { node: NodeType }) {
  const { setDraggingNodeId, selectedNodeId, setSelectedNodeId } = useMindMapStore();

  const isSelected = selectedNodeId === node.id;  // 현재 노드가 선택되었는지 확인

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingNodeId(node.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
  };

  return (
    <div
      className={`absolute bg-white rounded-lg shadow-lg px-4 py-2 cursor-grab select-none active:cursor-grabbing
        ${isSelected ? 'border-4 border-purple-500' : 'border-2 border-blue-500'} 
      `}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {node.data.label}
    </div>
  );
}