import { useMindMapStore } from "@/store/store";
import type { Edge as EdgeType } from "@/type/common";

export default function Edge({ edge }: { edge: EdgeType }) {
  const nodes = useMindMapStore((state) => state.nodes);
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);

  if (!sourceNode || !targetNode) return null;

  const sourceWidth = sourceNode.width ?? 150;
  const sourceHeight = sourceNode.height ?? 50;
  const targetWidth = targetNode.width ?? 150;
  const targetHeight = targetNode.height ?? 50;

  const x1 = sourceNode.position.x + sourceWidth / 2;
  const y1 = sourceNode.position.y + sourceHeight / 2;
  const x2 = targetNode.position.x + targetWidth / 2;
  const y2 = targetNode.position.y + targetHeight / 2;

  return (
    <line 
      x1={x1} 
      y1={y1} 
      x2={x2} 
      y2={y2} 
      stroke="#9ca3af"
      strokeWidth="2" 
    />
  );
}