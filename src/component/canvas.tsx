import Edge from "@/component/edge";
import Node from "@/component/node";
import Toolbar from "./toolbar";
import { useCanvas } from "@/hooks/use-canvas";

const canvasBackgroundStyle = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
  backgroundSize: '20px 20px',
};

export default function Canvas() {
  const {
    handleMouseMove, handleMouseUp,
    handleCanvasClick, handleCanvasDoubleClick,
    handleSave, handleLoad,
    edges, nodes
  } = useCanvas();

  return (
    <div>
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button onClick={handleSave} className="px-4 py-2 bg-white rounded-md shadow-md">
          Save
        </button>
        <button onClick={handleLoad} className="px-4 py-2 bg-white rounded-md shadow-md">
          Load
        </button>
      </div>

      <Toolbar />

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
    </div>
  );
}