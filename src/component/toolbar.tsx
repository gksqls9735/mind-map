import { availableColors } from "@/constants";
import { useMindMapStore } from "@/store/store";

export default function Toolbar() {
  const { selectedNodeId, updateNodeColor, deleteNode } = useMindMapStore();

  const handleColorChange = (color: string) => {
    if (selectedNodeId) updateNodeColor(selectedNodeId, color);
  };

  const handleDelete = () => {
    if (selectedNodeId) deleteNode(selectedNodeId);
  };

  return (
    <div className="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-lg flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-sm mb-2 px-1">Actions</h3>
        <button
          onClick={handleDelete}
          disabled={!selectedNodeId}
          className="w-fit px-3 py-2 text-sm text-left bg-gray-100 hover:bg-red-200 rounded-md disabled:opacity-50 cursor-pointer"
        >
          Delete
        </button>
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
    </div>
  );
};