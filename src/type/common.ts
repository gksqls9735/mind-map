export interface Node {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
  width?: number;
  height?: number;
  color?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}
