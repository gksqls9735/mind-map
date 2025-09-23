import { availableColors } from "@/constants/constants";
import { RadialIcon } from "@/constants/icon";
import { useNodeActions } from "@/hooks/use-node-actions";
import { useMindMapStore } from "@/store/store";
import { Network } from 'lucide-react';

export default function Toolbar() {
  const { selectedNodeId, updateNodeColor, autoLayout, layoutMode } = useMindMapStore();
  const { createChildNode, createSiblingNode, removeNode, canAddSibling } = useNodeActions();

  const handleColorChange = (color: string) => {
    if (selectedNodeId) updateNodeColor(selectedNodeId, color);
  };

  return (
    <div className="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-lg flex flex-col gap-4">
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