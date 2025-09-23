// renderer.d.ts
export interface IElectronAPI {
  saveFile: (data: { nodes: any[]; edges: any[] }) => void;
  loadFile: () => Promise<{ nodes: any[]; edges: any[] } | null>;
  onFileLoaded: (callback: (data: { nodes: any[], edges: any[] }) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}