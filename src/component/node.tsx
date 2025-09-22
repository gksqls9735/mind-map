import { useMindMapStore } from "@/store/store";
import type { Node as NodeType } from "@/type/common";
import { useLayoutEffect, useRef } from "react";

export default function ({ node }: { node: NodeType }) {
  const { setDraggingNodeId, selectedNodeId, setSelectedNodeId, updateNodeDimension } = useMindMapStore();
  const nodeRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedNodeId === node.id;  // 현재 노드가 선택되었는지 확인

  useLayoutEffect(() => {
    if (nodeRef.current) {
      const width = nodeRef.current.offsetWidth;
      const height = nodeRef.current.offsetHeight;
      if (node.width !== width || node.height !== height) updateNodeDimension(node.id, { width, height });
    }
  }, [node.data.label, node.width, node.height, updateNodeDimension]);

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
      ref={nodeRef}
      className={`
        absolute rounded-xl px-5 py-3 cursor-grab select-none active:cursor-grabbing
        font-semibold text-gray-800 shadow-md hover:shadow-xl
        transition duration-200 ease-in-out
        w-48 break-words
        ${isSelected
          ? 'bg-purple-100 ring-2 ring-purple-500 ring-offset-2'
          : 'bg-white border border-gray-300'
        }
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