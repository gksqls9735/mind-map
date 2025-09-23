import { availableColors } from "@/constants/constants";
import { RadialIcon } from "@/constants/icon";
import { useNodeActions } from "@/hooks/use-node-actions";
import { useMindMapStore } from "@/store/store";
import { Network } from 'lucide-react';
import { useEffect, useRef, useState } from "react";

export default function Toolbar() {
  const { selectedNodeId, updateNodeColor, autoLayout, layoutMode } = useMindMapStore();
  const { createChildNode, createSiblingNode, removeNode, canAddSibling } = useNodeActions();

  const [position, setPosition] = useState<{ x: number; y: number; }>({ x: window.innerWidth - 300, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ mouseX: number, mouseY: number, toolbarX: number, toolbarY: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !toolbarRef.current) return;

      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      let newX = dragStartRef.current.toolbarX + dx;
      let newY = dragStartRef.current.toolbarY + dy;

      const toolbarWidth = toolbarRef.current.offsetWidth;
      const toolbarHeight = toolbarRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const PADDING = 10;

      newX = Math.max(PADDING, Math.min(newX, windowWidth - toolbarWidth - PADDING));
      newY = Math.max(PADDING, Math.min(newY, windowHeight - toolbarHeight - PADDING));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleResize = () => {
      const toolbarElement = toolbarRef.current;
      if (!toolbarElement) return;

      const PADDING = 10;

      setPosition(prev => {
        const toolbarWidth = toolbarElement.offsetWidth;
        const toolbarHeight = toolbarElement.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const newX = Math.max(PADDING, Math.min(prev.x, windowWidth - toolbarWidth - PADDING));
        const newY = Math.max(PADDING, Math.min(prev.y, windowHeight - toolbarHeight - PADDING));

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      toolbarX: position.x,
      toolbarY: position.y,
    }
  }

  const handleColorChange = (color: string) => {
    if (selectedNodeId) updateNodeColor(selectedNodeId, color);
  };

  return (
    <div
      ref={toolbarRef}
      className="absolute z-10 p-3 bg-white rounded-lg shadow-xl flex flex-col gap-4 w-60"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className="w-full text-center cursor-move text-gray-400"
        onMouseDown={handleMouseDown}
      >
        &#x2630; Drag Me
      </div>

      <div>
        <h3 className="font-bold text-sm mb-2 px-1">Actions</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={createChildNode}
            disabled={!selectedNodeId}
            className="w-full px-3 py-2 text-sm text-left bg-gray-100 hover:bg-sky-200 rounded-md disabled:opacity-50"
          >
            Add Child (Tab)
          </button>

          <button
            onClick={createSiblingNode}
            disabled={!canAddSibling}
            className="w-full px-3 py-2 text-sm text-left bg-gray-100 hover:bg-green-200 rounded-md disabled:opacity-50"
          >
            Add Sibling (Enter)
          </button>

          <button
            onClick={removeNode}
            disabled={!selectedNodeId}
            className="w-full px-3 py-2 text-sm text-left bg-gray-100 hover:bg-red-200 rounded-md disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm mb-2 px-1">Colors</h3>
        <div className="grid grid-cols-6 gap-2">
          {availableColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              disabled={!selectedNodeId}
              className={`w-6 h-6 rounded-full ${color} border border-gray-300 disabled:opacity-50 hover:ring-2 ring-blue-500 cursor-pointer`}
              aria-label={`Change color to ${color}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm mb-2 px-1 text-gray-700">Layout</h3>
        <div className="flex gap-2">
          <button
            onClick={() => autoLayout('tree')}
            className={`flex-1 p-3 rounded-lg transition-colors
              ${layoutMode === 'tree'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
              }
            `}
            title="Tree Layout"
          >
            <Network size={28} className="mx-auto" />
          </button>

          <button
            onClick={() => autoLayout('radial')}
            className={`flex-1 p-3 rounded-lg transition-colors
              ${layoutMode === 'radial'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
              }
            `}
            title="Radial Layout"
          >
            <RadialIcon size={28} className="mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};