import { useMindMapStore } from "@/store/store";
import type { Node as NodeType, Edge as EdgeType } from "@/type/common";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function ({ node }: { node: NodeType }) {
  const {
    nodes,
    edges,
    setDraggingNodeId,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeDimension,
    editingNodeId,
    setEditingNodeId,
    updateNodeLabel,
    addNode,
    addEdge,
    deleteNode,
  } = useMindMapStore();

  const nodeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSelected = selectedNodeId === node.id;
  const isEditing = editingNodeId === node.id;

  const [tempLabel, setTempLabel] = useState<string>(node.data.label);

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

      const selectedNode = nodes.find(n => n.id === selectedNodeId);
      if (!selectedNode) return;


      let newNode: NodeType | null = null;
      let newEdge: EdgeType | null = null;
      const newNodeId = `${Date.now()}`;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        console.log("삭제")
        e.preventDefault();
        console.log("삭제");
        deleteNode(selectedNodeId);
        setSelectedNodeId(null);
      }

      // Tab 키로 자식 노드 생성
      if (e.key === 'Tab') {
        e.preventDefault();
        newNode = {
          id: newNodeId,
          position: { x: selectedNode.position.x + (selectedNode.width ?? 150) + 50, y: selectedNode.position.y },
          data: { label: '새 주제' },
        };
        newEdge = { id: `e${selectedNodeId}-${newNodeId}`, source: selectedNodeId, target: newNodeId };
      }

      // Enter 키로 형제 노드 생성 (부모가 있을 경우)
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const parentEdge = useMindMapStore.getState().edges.find(edge => edge.target === selectedNodeId);
        if (parentEdge) {
          newNode = {
            id: newNodeId,
            position: { x: selectedNode.position.x, y: selectedNode.position.y + (selectedNode.height ?? 50) + 30 },
            data: { label: '새 주제' },
          };
          newEdge = { id: `e${parentEdge.source}-${newNodeId}`, source: parentEdge.source, target: newNodeId };
        }
      }

      if (newNode && newEdge) {
        addNode(newNode);
        addEdge(newEdge);
        setSelectedNodeId(newNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNodeId, selectedNodeId, nodes, edges, addNode, addEdge, setSelectedNodeId, deleteNode]);

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