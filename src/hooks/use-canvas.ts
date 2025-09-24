import { useMindMapStore } from "@/store/store";
import type { Edge as EdgeType, Node as NodeType } from "@/type/common";
import { useEffect, useRef, useState } from "react";


export function useCanvas() {
  const {
    nodes, edges, draggingNodeId, selectedNodeId,
    updateNodePosition, setDraggingNodeId,
    addNode, addEdge, setSelectedNodeId,
    viewOffset, panView,
    zoom, zoomToPoint
  } = useMindMapStore();

  const clickTimer = useRef<number | null>(null);

  const [isPannable, setIsPannable] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPannable(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPannable(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const point = { x: e.clientX, y: e.clientX };
    zoomToPoint(e.deltaY, point);
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isPannable && e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      panView({ dx: e.movementX, dy: e.movementY });
      return;
    }
    if (draggingNodeId) updateNodePosition(draggingNodeId, { x: e.movementX, y: e.movementY });
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  }

  const handleCanvasClick = () => {
    clickTimer.current = window.setTimeout(() => {
      setSelectedNodeId(null);
    }, 200);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (clickTimer.current) clearTimeout(clickTimer.current);

    const newNodeId = `${Date.now()}`;
    const newNode: NodeType = {
      id: newNodeId,
      position: { x: e.clientX - 80, y: e.clientY - 25 },
      data: { label: '새 주제' },
    };

    if (selectedNodeId) {
      const newEdge: EdgeType = {
        id: `e${selectedNodeId}-${newNodeId}`,
        source: selectedNodeId,
        target: newNodeId,
      };

      addNode(newNode);
      addEdge(newEdge);
    } else {
      addNode(newNode);
    }

    //setSelectedNodeId(newNodeId);
  };

  return {
    handleMouseMove, handleMouseUp, handleCanvasClick, handleCanvasDoubleClick, handleCanvasMouseDown, handleWheel,
    edges, nodes,
    viewOffset, isPannable, isPanning,
    zoom,
  };
}