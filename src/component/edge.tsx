import { useMindMapStore } from "@/store/store";
import type { Edge as EdgeType } from "@/type/common";


export default function Edge({ edge }: { edge: EdgeType }) {
  const nodes = useMindMapStore((state) => state.nodes);
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);

  if (!sourceNode || !targetNode) return null;

  const x1 = sourceNode.position.x + 50;
  const y1 = sourceNode.position.y + 20;
  const x2 = targetNode.position.x + 50;
  const y2 = targetNode.position.y + 20;

  return (
    <svg className="absolute" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth="2" />
    </svg>
  );
}