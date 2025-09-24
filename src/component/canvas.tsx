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
    handleMouseMove, handleMouseUp, handleCanvasClick,
    handleCanvasDoubleClick,
    handleCanvasMouseDown, handleWheel,
    edges, nodes,
    viewOffset, isPannable, isPanning, zoom
  } = useCanvas();

  return (
    <div>

      <Toolbar />

      <div
        className={`canvas w-screen h-screen bg-slate-100 relative overflow-hidden
          ${isPannable && 'cursor-grab'}
          ${isPanning && 'cursor-grabbing'}
        `}
        style={canvasBackgroundStyle}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <svg
            className="absolute top-0 left-0"
            width="10000"
            height="10000"
            style={{
              pointerEvents: 'none',
            }}
          >
            {edges.map((edge) => (
              <Edge key={edge.id} edge={edge} />
            ))}
          </svg>
          {nodes.map((node) => (
            <Node key={node.id} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}