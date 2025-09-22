export interface Node {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
  width?: number;
  height?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}
