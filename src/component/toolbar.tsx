import { availableColors } from "@/constants/constants";
import { RadialIcon } from "@/constants/icon";
import { useNodeActions } from "@/hooks/use-node-actions";
import { Network, PanelRightOpen } from 'lucide-react';
import { useToolbar } from "@/hooks/use-toolbar";

export default function Toolbar() {
  const {
    autoLayout, layoutMode,
    handleMouseDown, handleColorChange, handleToggleView,
    getToggleIcon, getToggleTitle,
    viewMode, position,
    toolbarRef, selectedNodeId,
    handleSave, handleLoad, canSave
  } = useToolbar();
  const { createChildNode, createSiblingNode, removeNode, canAddSibling } = useNodeActions();


  if (viewMode === 'collapsed') {
    return (
      <button
        ref={toolbarRef as React.RefObject<HTMLButtonElement>}
        onClick={handleToggleView}
        onMouseDown={handleMouseDown as React.MouseEventHandler<HTMLButtonElement>}
        className="absolute z-10 p-2 bg-white rounded-full shadow-xl cursor-move"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        title="Open Toolbar"
      >
        <PanelRightOpen size={24} className="text-gray-600" />
      </button>
    );
  }

  return (
    <div
      ref={toolbarRef as React.RefObject<HTMLDivElement>}
      className="absolute z-10 p-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl flex flex-col gap-6 w-60"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div
        className="flex items-center justify-between cursor-move h-8 -mt-1"
        onMouseDown={handleMouseDown as React.MouseEventHandler<HTMLDivElement>}
      >
        <div className="w-7" />

        <div className="flex items-center justify-center text-gray-400 font-bold">
          Toolbar
        </div>

        <button
          onClick={handleToggleView}
          onMouseDown={(e) => e.stopPropagation()}
          className="p-1 w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full cursor-pointer"
          title={getToggleTitle()}
        >
          {getToggleIcon()}
        </button>
      </div>

      <>
        <div>
          <h3 className="font-bold text-sm mb-2 px-1">File</h3>
          {viewMode === 'expanded' && (
            <div className="flex gap-2">
              <button onClick={handleSave}
                disabled={!canSave}
                className="flex-1 px-3 py-2 text-sm text-center bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50">
                Save
              </button>
              <button onClick={handleLoad} className="flex-1 px-3 py-2 text-sm text-center bg-gray-100 hover:bg-gray-200 rounded-md">
                Load
              </button>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-sm mb-2 px-1">Actions</h3>
          {viewMode === 'expanded' && (
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
          )}
        </div>

        {/* Colors 섹션 (기존 코드 유지) */}
        <div>
          <h3 className="font-bold text-sm mb-2 px-1">Colors</h3>
          {viewMode === 'expanded' && (
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
          )}
        </div>

        {/* Layout 섹션 (기존 코드 유지) */}
        <div>
          <h3 className="font-bold text-sm mb-2 px-1 text-gray-700">Layout</h3>
          {viewMode === 'expanded' && (
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
          )}
        </div>
      </>
    </div>
  );
};