import { useNodeActions } from "@/hooks/use-node-actions";
import { useMindMapStore } from "@/store/store";
import type { Node as NodeType } from "@/type/common";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function ({ node }: { node: NodeType }) {
  const {
    setDraggingNodeId,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeDimension,
    editingNodeId,
    setEditingNodeId,
    updateNodeLabel,
    deleteNode,
  } = useMindMapStore();

  const nodeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSelected = selectedNodeId === node.id;
  const isEditing = editingNodeId === node.id;

  const [tempLabel, setTempLabel] = useState<string>(node.data.label);

  const { createChildNode, createSiblingNode, removeNode } = useNodeActions();

  const nodeColorClass = node.color || 'bg-white';
  const selectedRingClass = isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : 'border border-gray-300';

  useLayoutEffect(() => {
    if (nodeRef.current) {
      const width = nodeRef.current.offsetWidth;
      const height = nodeRef.current.offsetHeight;
      if (node.width !== width || node.height !== height) updateNodeDimension(node.id, { width, height });
    }
  }, [node.data.label, node.width, node.height, updateNodeDimension]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId || !selectedNodeId) return;

      // Tab 키로 자식 노드 생성
      if (e.key === 'Tab') {
        e.preventDefault();
        createChildNode();
      }

      // Enter 키로 형제 노드 생성 (부모가 있을 경우)
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        createSiblingNode();
      }


      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeNode();
      }

    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNodeId, selectedNodeId, createChildNode, createSiblingNode, deleteNode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingNodeId(node.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempLabel(node.data.label);
    setEditingNodeId(node.id);
  };

  const handleBlur = () => {
    if (tempLabel.trim() !== "") updateNodeLabel(node.id, tempLabel);
    setEditingNodeId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) handleBlur();
    if (e.key === 'Escape') {
      setTempLabel(node.data.label);
      setEditingNodeId(null);
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`
        absolute rounded-xl px-5 py-3 cursor-grab select-none active:cursor-grabbing
        font-semibold text-gray-800 shadow-md hover:shadow-xl
        transition duration-200 ease-in-out
        w-48 break-words text-center
        flex items-center justify-center
        ${nodeColorClass} ${selectedRingClass}
      `}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {node.data.label}

      {isEditing && (
        <textarea
          ref={textareaRef}
          value={tempLabel}
          onChange={(e) => setTempLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`
            absolute inset-0 w-full h-full border-none outline-none resize-none
            font-semibold text-gray-800 text-center
            px-5 py-3 leading-tight
            rounded-xl
            ${isSelected ? 'bg-purple-100' : 'bg-white'}
          `}
        />
      )}
    </div>
  );
}