"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import type { Layer as LayerType } from "konva/lib/Layer";

import { 
  BoardElement, 
  ElementType, 
  StickyNoteContent, 
  ShapeContent, 
  TextContent
} from "@/types";
import { elementsApi } from "@/services/api";

// Import Konva components
import { 
  Stage, 
  Layer, 
  Rect, 
  Text, 
  Circle, 
  RegularPolygon, 
  Arrow, 
  Star
} from "@/components/KonvaComponents";

interface BoardCanvasProps {
  boardId: string;
}

type ToolType = 'select' | 'pan' | 'sticky' | 'shape' | 'text' | 'ai';
type ShapeType = 'rectangle' | 'ellipse' | 'triangle' | 'star' | 'diamond' | 'arrow';

export default function BoardCanvas({ boardId }: BoardCanvasProps) {
  // Core state
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Canvas state
  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Tool state
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle');
  const [isDraggable, setIsDraggable] = useState(false);
  
  // Advanced features
  const [history, setHistory] = useState<BoardElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboardElements, setClipboardElements] = useState<BoardElement[]>([]);
  
  // Refs
  const stageRef = useRef<StageType | null>(null);
  const layerRef = useRef<LayerType | null>(null);
  
  // Load elements
  useEffect(() => {
    const fetchElements = async () => {
      try {
        setIsLoading(true);
        const data = await elementsApi.getBoardElements(boardId);
        setElements(data);
        setHistory([data]);
        setHistoryIndex(0);
        setError(null);
      } catch (err) {
        console.error("Failed to load elements:", err);
        setError("Failed to load board elements");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchElements();
  }, [boardId]);

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        setStageSize({
          width: window.innerWidth,
          height: window.innerHeight - 80, // Account for header
        });
      }
    };
    
    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Update draggable based on tool
  useEffect(() => {
    setIsDraggable(activeTool === 'pan');
  }, [activeTool]);

  // Save to history
  const saveToHistory = useCallback((currentElements: BoardElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...currentElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  // Element creation
  const createStickyNote = useCallback(async (x: number, y: number) => {
    const element = {
      type: ElementType.STICKY_NOTE,
      position: { x, y },
      size: { width: 200, height: 200 },
      content: { text: "Double-click to edit" } as StickyNoteContent,
      style: {
        fill: "#fef3c7",
        stroke: "#f59e0b",
        strokeWidth: 2,
        cornerRadius: 12,
      },
      zIndex: elements.length,
      boardId,
    };
    
    try {
      saveToHistory(elements);
      const created = await elementsApi.createElement(element);
      setElements(prev => [...prev, created]);
      setSelectedElement(created.id);
      setActiveTool('select');
    } catch (err) {
      console.error("Failed to create sticky note:", err);
      setError("Failed to create sticky note");
    }
  }, [elements, boardId, saveToHistory]);

  const createShape = useCallback(async (x: number, y: number, shapeType: ShapeType) => {
    const baseElement = {
      type: ElementType.SHAPE,
      position: { x, y },
      size: { width: 120, height: 120 },
      content: { shapeType } as ShapeContent,
      zIndex: elements.length,
      boardId,
    };

    const shapeStyles = {
      rectangle: { fill: "#3b82f6", stroke: "#1d4ed8", cornerRadius: 8 },
      ellipse: { fill: "#8b5cf6", stroke: "#7c3aed" }, // Changed from circle to ellipse
      triangle: { fill: "#ec4899", stroke: "#be185d" },
      star: { fill: "#f59e0b", stroke: "#d97706" },
      diamond: { fill: "#10b981", stroke: "#047857" },
      arrow: { fill: "#6366f1", stroke: "#4338ca" },
    };

    const element = {
      ...baseElement,
      style: {
        ...shapeStyles[shapeType],
        strokeWidth: 2,
      },
    };
    
    try {
      saveToHistory(elements);
      const created = await elementsApi.createElement(element);
      setElements(prev => [...prev, created]);
      setSelectedElement(created.id);
      setActiveTool('select');
    } catch (err) {
      console.error("Failed to create shape:", err);
      setError("Failed to create shape");
    }
  }, [elements, boardId, saveToHistory]);

  const createText = useCallback(async (x: number, y: number) => {
    const element = {
      type: ElementType.TEXT,
      position: { x, y },
      size: { width: 250, height: 80 },
      content: { text: "Double-click to edit text" } as TextContent,
      style: {
        fontSize: 18,
        fill: "#1f2937",
        fontFamily: "Inter, sans-serif",
        fontWeight: "500",
      },
      zIndex: elements.length,
      boardId,
    };
    
    try {
      saveToHistory(elements);
      const created = await elementsApi.createElement(element);
      setElements(prev => [...prev, created]);
      setSelectedElement(created.id);
      setActiveTool('select');
    } catch (err) {
      console.error("Failed to create text:", err);
      setError("Failed to create text");
    }
  }, [elements, boardId, saveToHistory]);

  // Handle stage click
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const x = (pointer.x - position.x) / scale;
    const y = (pointer.y - position.y) / scale;

    // If clicking on stage background
    if (e.target === e.currentTarget) {
      // Create elements based on active tool
      switch (activeTool) {
        case 'sticky':
          createStickyNote(x, y);
          break;
        case 'shape':
          createShape(x, y, activeShape);
          break;
        case 'text':
          createText(x, y);
          break;
        case 'select':
          setSelectedElement(null);
          setSelectedElements([]);
          break;
      }
    }
  }, [activeTool, activeShape, position, scale, createStickyNote, createShape, createText]);

  // Handle element selection
  const handleElementSelect = useCallback((elementId: string, ctrlKey: boolean = false) => {
    if (activeTool !== 'select') return;

    if (ctrlKey) {
      // Multi-selection
      if (selectedElements.includes(elementId)) {
        setSelectedElements(prev => prev.filter(id => id !== elementId));
      } else {
        setSelectedElements(prev => [...prev, elementId]);
        setSelectedElement(null);
      }
    } else {
      // Single selection
      if (selectedElements.length > 0) {
        setSelectedElements([]);
      }
      setSelectedElement(elementId === selectedElement ? null : elementId);
    }
  }, [activeTool, selectedElement, selectedElements]);

  // Handle element drag
  const handleElementDrag = useCallback((elementId: string, newPos: { x: number; y: number }) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, position: newPos } : el
    ));
    
    // Debounced update to server
    const timeoutId = setTimeout(async () => {
      try {
        await elementsApi.updateElement(elementId, { position: newPos });
      } catch (err) {
        console.error("Failed to update position:", err);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  // Delete elements
  const deleteSelectedElements = useCallback(async () => {
    const toDelete = selectedElement ? [selectedElement] : selectedElements;
    if (toDelete.length === 0) return;

    try {
      saveToHistory(elements);
      await Promise.all(toDelete.map(id => elementsApi.deleteElement(id)));
      setElements(prev => prev.filter(el => !toDelete.includes(el.id)));
      setSelectedElement(null);
      setSelectedElements([]);
    } catch (err) {
      console.error("Failed to delete elements:", err);
      setError("Failed to delete elements");
    }
  }, [selectedElement, selectedElements, elements, saveToHistory]);

  // Copy/Paste functionality
  const copyElements = useCallback(() => {
    const toCopy = selectedElement 
      ? elements.filter(el => el.id === selectedElement)
      : elements.filter(el => selectedElements.includes(el.id));
    setClipboardElements(toCopy);
  }, [selectedElement, selectedElements, elements]);

  const pasteElements = useCallback(async () => {
    if (clipboardElements.length === 0) return;

    try {
      saveToHistory(elements);
      const created = await Promise.all(
        clipboardElements.map(async (element) => {
          // Extract fields to avoid destructuring warnings
          const elementData: Omit<BoardElement, 'id' | 'createdAt' | 'updatedAt'> = {
            boardId: element.boardId,
            type: element.type,
            position: {
              x: element.position.x + 20,
              y: element.position.y + 20,
            },
            size: element.size,
            content: element.content,
            style: element.style,
            zIndex: element.zIndex,
          };
          return await elementsApi.createElement(elementData);
        })
      );
      
      setElements(prev => [...prev, ...created]);
      if (created.length === 1) {
        setSelectedElement(created[0].id);
        setSelectedElements([]);
      } else {
        setSelectedElements(created.map(el => el.id));
        setSelectedElement(null);
      }
    } catch (err) {
      console.error("Failed to paste elements:", err);
      setError("Failed to paste elements");
    }
  }, [clipboardElements, elements, saveToHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'c':
            e.preventDefault();
            copyElements();
            break;
          case 'v':
            e.preventDefault();
            pasteElements();
            break;
          case 'a':
            e.preventDefault();
            setSelectedElements(elements.map(el => el.id));
            setSelectedElement(null);
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            deleteSelectedElements();
            break;
          case 'Escape':
            setSelectedElement(null);
            setSelectedElements([]);
            break;
          case '1':
            setActiveTool('select');
            break;
          case '2':
            setActiveTool('pan');
            break;
          case 's':
            setActiveTool('sticky');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'r':
            setActiveTool('shape');
            setActiveShape('rectangle');
            break;
          case 'c':
            setActiveTool('shape');
            setActiveShape('ellipse'); // Changed from circle to ellipse
            break;
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleUndo, handleRedo, copyElements, pasteElements, deleteSelectedElements, elements]);

  // Zoom and pan
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  // Render elements
  const renderElement = useCallback((element: BoardElement) => {
    const isSelected = element.id === selectedElement || selectedElements.includes(element.id);
    
    const commonProps = {
      key: element.id,
      onClick: (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        handleElementSelect(element.id, e.evt.ctrlKey || e.evt.metaKey);
      },
      draggable: activeTool === 'select',
      onDragEnd: (e: KonvaEventObject<DragEvent>) => {
        const newPos = { x: Math.round(e.target.x()), y: Math.round(e.target.y()) };
        handleElementDrag(element.id, newPos);
      },
      stroke: isSelected ? '#3b82f6' : undefined,
      strokeWidth: isSelected ? 3 : undefined,
    };

    switch (element.type) {
      case ElementType.STICKY_NOTE: {
        const content = element.content as StickyNoteContent;
        return (
          <React.Fragment key={element.id}>
            <Rect
              {...commonProps}
              x={element.position.x}
              y={element.position.y}
              width={element.size?.width || 200}
              height={element.size?.height || 200}
              fill={element.style?.fill as string || '#fef3c7'}
              stroke={isSelected ? '#3b82f6' : (element.style?.stroke as string || '#f59e0b')}
              strokeWidth={isSelected ? 3 : (element.style?.strokeWidth as number || 2)}
              cornerRadius={element.style?.cornerRadius as number || 12}
            />
            <Text
              x={element.position.x + 10}
              y={element.position.y + 10}
              text={content.text || 'Double-click to edit'}
              width={(element.size?.width || 200) - 20}
              fontSize={14}
              fill="#1f2937"
              wrap="word"
              onClick={commonProps.onClick}
              onDblClick={() => {
                const newText = prompt('Edit text:', content.text || '');
                if (newText !== null) {
                  const updatedContent = { ...content, text: newText };
                  setElements(prev => prev.map(el => 
                    el.id === element.id ? { ...el, content: updatedContent } : el
                  ));
                  elementsApi.updateElement(element.id, { content: updatedContent });
                }
              }}
            />
          </React.Fragment>
        );
      }
      
      case ElementType.SHAPE: {
        const content = element.content as ShapeContent;
        const shapeProps = {
          ...commonProps,
          fill: element.style?.fill as string || '#3b82f6',
          stroke: isSelected ? '#3b82f6' : (element.style?.stroke as string || '#1d4ed8'),
          strokeWidth: isSelected ? 3 : (element.style?.strokeWidth as number || 2),
        };

        switch (content.shapeType) {
          case 'ellipse': // Changed from 'circle' to match the ShapeContent type
            return (
              <Circle
                {...shapeProps}
                x={element.position.x + (element.size?.width || 120) / 2}
                y={element.position.y + (element.size?.height || 120) / 2}
                radius={(element.size?.width || 120) / 2}
              />
            );
          case 'triangle':
            return (
              <RegularPolygon
                {...shapeProps}
                x={element.position.x + (element.size?.width || 120) / 2}
                y={element.position.y + (element.size?.height || 120) / 2}
                sides={3}
                radius={(element.size?.width || 120) / 2}
              />
            );
          case 'star':
            return (
              <Star
                {...shapeProps}
                x={element.position.x + (element.size?.width || 120) / 2}
                y={element.position.y + (element.size?.height || 120) / 2}
                numPoints={5}
                innerRadius={(element.size?.width || 120) / 4}
                outerRadius={(element.size?.width || 120) / 2}
              />
            );
          case 'diamond':
            return (
              <RegularPolygon
                {...shapeProps}
                x={element.position.x + (element.size?.width || 120) / 2}
                y={element.position.y + (element.size?.height || 120) / 2}
                sides={4}
                radius={(element.size?.width || 120) / 2}
                rotation={45}
              />
            );
          case 'arrow':
            return (
              <Arrow
                {...shapeProps}
                points={[
                  element.position.x,
                  element.position.y + (element.size?.height || 60) / 2,
                  element.position.x + (element.size?.width || 150),
                  element.position.y + (element.size?.height || 60) / 2,
                ]}
                pointerLength={20}
                pointerWidth={20}
              />
            );
          default: // rectangle
            return (
              <Rect
                {...shapeProps}
                x={element.position.x}
                y={element.position.y}
                width={element.size?.width || 120}
                height={element.size?.height || 120}
                cornerRadius={element.style?.cornerRadius as number || 8}
              />
            );
        }
      }
      
      case ElementType.TEXT: {
        const content = element.content as TextContent;
        return (
          <Text
            {...commonProps}
            x={element.position.x}
            y={element.position.y}
            text={content.text || 'Double-click to edit text'}
            width={element.size?.width || 250}
            fontSize={element.style?.fontSize as number || 18}
            fill={element.style?.fill as string || '#1f2937'}
            fontFamily={element.style?.fontFamily as string || 'Inter, sans-serif'}
            fontWeight={element.style?.fontWeight as string || '500'}
            onDblClick={() => {
              const newText = prompt('Edit text:', content.text || '');
              if (newText !== null) {
                const updatedContent = { ...content, text: newText };
                setElements(prev => prev.map(el => 
                  el.id === element.id ? { ...el, content: updatedContent } : el
                ));
                elementsApi.updateElement(element.id, { content: updatedContent });
              }
            }}
          />
        );
      }
      
      default:
        return null;
    }
  }, [selectedElement, selectedElements, activeTool, handleElementSelect, handleElementDrag]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-white text-lg">Loading canvas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl max-w-md">
          <div className="text-red-400 text-lg font-medium mb-2">Error</div>
          <div className="text-red-300">{error}</div>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-700/50">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'select' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
            }`}
            title="Select (1)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
            </svg>
          </button>
          
          <button
            onClick={() => setActiveTool('pan')}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'pan' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
            }`}
            title="Pan (2)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </button>

          <div className="h-px bg-slate-600/50 my-1" />
          
          <button
            onClick={() => setActiveTool('sticky')}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'sticky' 
                ? 'bg-yellow-600 text-white shadow-lg' 
                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
            }`}
            title="Sticky Note (S)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
          
          <button
            onClick={() => setActiveTool('text')}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'text' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
            }`}
            title="Text (T)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          
          <button
            onClick={() => setActiveTool('shape')}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'shape' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
            }`}
            title="Shape (R)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Shape selector */}
      {activeTool === 'shape' && (
        <div className="absolute top-4 left-24 z-10 bg-slate-800/90 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-700/50">
          <div className="flex gap-2">
            {(['rectangle', 'ellipse', 'triangle', 'star', 'diamond', 'arrow'] as ShapeType[]).map((shape) => (
              <button
                key={shape}
                onClick={() => setActiveShape(shape)}
                className={`p-2 rounded-lg transition-all text-xs ${
                  activeShape === shape 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                }`}
                title={shape}
              >
                {shape.charAt(0).toUpperCase() + shape.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="absolute top-4 right-4 z-10 bg-slate-800/90 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-700/50">
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span>Elements: {elements.length}</span>
          <span>Zoom: {Math.round(scale * 100)}%</span>
          <span>Tool: {activeTool}</span>
          {selectedElement && <span>Selected: 1</span>}
          {selectedElements.length > 0 && <span>Selected: {selectedElements.length}</span>}
        </div>
      </div>

      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={isDraggable}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDragEnd={(e) => {
          if (isDraggable) {
            setPosition({ x: e.target.x(), y: e.target.y() });
          }
        }}
        className="cursor-crosshair"
      >
        <Layer ref={layerRef}>
          {/* Grid background */}
          <Rect
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill="#f8fafc"
          />
          
          {/* Elements */}
          {elements.map(renderElement)}
        </Layer>
      </Stage>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-700/50">
        <div className="text-xs text-slate-400">
          <div>Click to create • Drag to move • Ctrl+Click for multi-select</div>
          <div>Ctrl+Z/Y: Undo/Redo • Ctrl+C/V: Copy/Paste • Del: Delete</div>
        </div>
      </div>
    </div>
  );
}
