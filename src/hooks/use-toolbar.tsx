import { useMindMapStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, Minimize2 } from "lucide-react";

type ViewMode = 'expanded' | 'summary' | 'collapsed';

export function useToolbar() {
  const { selectedNodeId, updateNodeColor, autoLayout, layoutMode, setMindMap, nodes, edges } = useMindMapStore();

  const [viewMode, setViewMode] = useState<ViewMode>('expanded');

  const [position, setPosition] = useState<{ x: number; y: number; }>({ x: window.innerWidth - 300, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ mouseX: number, mouseY: number, toolbarX: number, toolbarY: number } | null>(null);
  const toolbarRef = useRef<HTMLElement>(null);
  const didDragRef = useRef<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !toolbarRef.current) return;
      didDragRef.current = true;

      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      let newX = dragStartRef.current.toolbarX + dx;
      let newY = dragStartRef.current.toolbarY + dy;

      const toolbarWidth = toolbarRef.current.offsetWidth;
      const toolbarHeight = toolbarRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const PADDING = 10;

      newX = Math.max(PADDING, Math.min(newX, windowWidth - toolbarWidth - PADDING));
      newY = Math.max(PADDING, Math.min(newY, windowHeight - toolbarHeight - PADDING));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setTimeout(() => {
        didDragRef.current = false;
      }, 0);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleResize = () => {
      const toolbarElement = toolbarRef.current;
      if (!toolbarElement) return;

      const PADDING = 10;

      setPosition(prev => {
        const toolbarWidth = toolbarElement.offsetWidth;
        const toolbarHeight = toolbarElement.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const newX = Math.max(PADDING, Math.min(prev.x, windowWidth - toolbarWidth - PADDING));
        const newY = Math.max(PADDING, Math.min(prev.y, windowHeight - toolbarHeight - PADDING));

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!toolbarRef.current) return;

    const PADDING = 10;

    setPosition(prevPos => {
      const toolbarWidth = toolbarRef.current!.offsetWidth;
      const toolbarHeight = toolbarRef.current!.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const newX = Math.max(PADDING, Math.min(prevPos.x, windowWidth - toolbarWidth - PADDING));
      const newY = Math.max(PADDING, Math.min(prevPos.y, windowHeight - toolbarHeight - PADDING));

      return { x: newX, y: newY };
    });
  }, [viewMode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      toolbarX: position.x,
      toolbarY: position.y,
    };
  };

  const handleColorChange = (color: string) => {
    if (selectedNodeId) updateNodeColor(selectedNodeId, color);
  };

  const handleToggleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (didDragRef.current) return;
    if (viewMode === 'expanded') {
      setViewMode('summary');
    } else if (viewMode === 'summary') {
      setViewMode('collapsed');
    } else {
      setViewMode('expanded');
    }
  };

  const getToggleIcon = () => {
    switch (viewMode) {
      case 'expanded': return <ChevronsUpDown size={20} />;
      case 'summary': return <Minimize2 size={20} />;
      case 'collapsed': return <ChevronsDownUp size={20} />;
    }
  };

  const getToggleTitle = () => {
    switch (viewMode) {
      case 'expanded': return "Summarize Toolbar";
      case 'summary': return "Collapse Toolbar";
      case 'collapsed': return "Expand Toolbar";
    }
  };

  const handleSave = () => {
    const mindMapData = { nodes, edges };
    window.electronAPI.saveFile(mindMapData);
  };

  const handleLoad = async () => {
    const mindMapData = await window.electronAPI.loadFile();
    if (mindMapData) {
      setMindMap(mindMapData);
    }
  };


  return {
    autoLayout, layoutMode,
    handleMouseDown, handleColorChange, handleToggleView,
    getToggleIcon, getToggleTitle,
    viewMode, position,
    toolbarRef, selectedNodeId,
    handleSave, handleLoad,
  };
};