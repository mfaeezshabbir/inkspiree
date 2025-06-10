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
import Link from "next/link";
import Toolbar from "./Toolbar";

interface BoardCanvasProps {
  boardId: string;
}

type ToolType = 'select' | 'pan' | 'sticky' | 'shape' | 'text' | 'ai';
type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond' | 'arrow';

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
  
  // Utility function for debouncing
  function debounce(
    func: (elementId: string, updates: Partial<BoardElement>) => Promise<void>,
    delay: number
  ) {
    let timeoutId: NodeJS.Timeout;
    return (elementId: string, updates: Partial<BoardElement>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(elementId, updates), delay);
    };
  }
  
  // Debounced update function for smoother performance
  const debouncedUpdate = useCallback(
    (elementId: string, updates: Partial<BoardElement>) => {
      debounce(async (id: string, data: Partial<BoardElement>) => {
        try {
          await elementsApi.updateElement(id, data);
        } catch (error) {
          console.error('Failed to update element:', error);
          setError('Failed to update element');
        }
      }, 300)(elementId, updates);
    },
    []
  );
  
  // Calculate visible elements for better performance
  useEffect(() => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    const scaleX = stage.scaleX();
    const scaleY = stage.scaleY();
    const x = stage.x();
    const y = stage.y();
    
    // Calculate viewport bounds
    const viewportBounds = {
      x: -x / scaleX,
      y: -y / scaleY,
      width: stage.width() / scaleX,
      height: stage.height() / scaleY,
    };
    
    // Filter elements that are visible in viewport (with some padding)
    const padding = 100;
    const visible = elements.filter(element => {
      const elemRight = element.position.x + (element.size?.width || 0);
      const elemBottom = element.position.y + (element.size?.height || 0);
      
      return !(
        element.position.x > viewportBounds.x + viewportBounds.width + padding ||
        elemRight < viewportBounds.x - padding ||
        element.position.y > viewportBounds.y + viewportBounds.height + padding ||
        elemBottom < viewportBounds.y - padding
      );
    });
    
    setVisibleElements(visible);
  }, [elements, scale, position]);

  // Save to history for undo/redo functionality
  const saveToHistory = (currentElements: BoardElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...currentElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Enhanced keyboard shortcuts with multi-selection support
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
            // Copy selected elements
            if (selectedElement) {
              const elementToCopy = elements.find(el => el.id === selectedElement);
              if (elementToCopy) {
                setClipboardElements([elementToCopy]);
              }
            } else if (selectedElements.length > 0) {
              const elementsToCopy = elements.filter(el => selectedElements.includes(el.id));
              setClipboardElements(elementsToCopy);
            }
            break;
          case 'v':
            e.preventDefault();
            // Paste elements
            if (clipboardElements.length > 0) {
              pasteElements();
            }
            break;
          case 'a':
            e.preventDefault();
            // Select all elements
            setSelectedElements(elements.map(el => el.id));
            setSelectedElement(null);
            break;
          case 'd':
            e.preventDefault();
            // Duplicate selected elements
            if (selectedElement) {
              duplicateElement(selectedElement);
            } else if (selectedElements.length > 0) {
              duplicateElements(selectedElements);
            }
            break;
          case '0':
            e.preventDefault();
            // Reset zoom
            setScale(1);
            setPosition({ x: 0, y: 0 });
            break;
          case '+':
          case '=':
            e.preventDefault();
            // Zoom in
            setScale(prev => Math.min(prev * 1.2, 3));
            break;
          case '-':
            e.preventDefault();
            // Zoom out
            setScale(prev => Math.max(prev / 1.2, 0.1));
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            if (selectedElement) {
              deleteElement(selectedElement);
            } else if (selectedElements.length > 0) {
              deleteElements(selectedElements);
            }
            break;
          case 'Escape':
            setSelectedElement(null);
            setSelectedElements([]);
            break;
          case '1':
            e.preventDefault();
            setActiveTool('select');
            break;
          case '2':
            e.preventDefault();
            setActiveTool('pan');
            break;
          case 's':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              addElement(ElementType.STICKY_NOTE);
            }
            break;
          case 't':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              addElement(ElementType.TEXT);
            }
            break;
          case 'r':
            e.preventDefault();
            setActiveShape('rectangle');
            addElement(ElementType.SHAPE);
            break;
          case 'c':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              setActiveShape('circle');
              addElement(ElementType.SHAPE);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement, selectedElements, elements, clipboardElements, historyIndex, history]);

  // Enhanced element deletion with multi-selection support
  const deleteElements = async (elementIds: string[]) => {
    try {
      saveToHistory(elements);
      await Promise.all(elementIds.map(id => elementsApi.deleteElement(id)));
      setElements(prev => prev.filter(el => !elementIds.includes(el.id)));
      setSelectedElements([]);
      setSelectedElement(null);
    } catch (err) {
      console.error("Failed to delete elements", err);
      setError("Failed to delete elements");
    }
  };

  // Enhanced element duplication
  const duplicateElement = async (elementId: string) => {
    const elementToDuplicate = elements.find(el => el.id === elementId);
    if (!elementToDuplicate) return;

    const duplicatedElement = {
      ...elementToDuplicate,
      position: {
        x: elementToDuplicate.position.x + 20,
        y: elementToDuplicate.position.y + 20,
      },
    };

    // Create new element data without server-specific fields
    const elementData: Omit<BoardElement, 'id' | 'createdAt' | 'updatedAt'> = {
      boardId: duplicatedElement.boardId,
      type: duplicatedElement.type,
      position: {
        x: duplicatedElement.position.x + 20,
        y: duplicatedElement.position.y + 20,
      },
      size: duplicatedElement.size,
      content: duplicatedElement.content,
      style: duplicatedElement.style,
      zIndex: duplicatedElement.zIndex,
    };
    
    try {
      saveToHistory(elements);
      const created = await elementsApi.createElement(elementData);
      setElements(prev => [...prev, created]);
      setSelectedElement(created.id);
    } catch (err) {
      console.error("Failed to duplicate element", err);
      setError("Failed to duplicate element");
    }
  };

  const duplicateElements = async (elementIds: string[]) => {
    const elementsToDuplicate = elements.filter(el => elementIds.includes(el.id));
    if (elementsToDuplicate.length === 0) return;

    try {
      saveToHistory(elements);
      const createdElements = await Promise.all(
        elementsToDuplicate.map(async (element) => {
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
      
      setElements(prev => [...prev, ...createdElements]);
      setSelectedElements(createdElements.map(el => el.id));
      setSelectedElement(null);
    } catch (err) {
      console.error("Failed to duplicate elements", err);
      setError("Failed to duplicate elements");
    }
  };

  // Paste elements functionality
  const pasteElements = async () => {
    if (clipboardElements.length === 0) return;

    try {
      saveToHistory(elements);
      const createdElements = await Promise.all(
        clipboardElements.map(async (element) => {
          const elementData: Omit<BoardElement, 'id' | 'createdAt' | 'updatedAt'> = {
            boardId: element.boardId,
            type: element.type,
            position: {
              x: element.position.x + 30,
              y: element.position.y + 30,
            },
            size: element.size,
            content: element.content,
            style: element.style,
            zIndex: element.zIndex,
          };
          return await elementsApi.createElement(elementData);
        })
      );
      
      setElements(prev => [...prev, ...createdElements]);
      if (createdElements.length === 1) {
        setSelectedElement(createdElements[0].id);
        setSelectedElements([]);
      } else {
        setSelectedElements(createdElements.map(el => el.id));
        setSelectedElement(null);
      }
    } catch (err) {
      console.error("Failed to paste elements", err);
      setError("Failed to paste elements");
    }
  };

  // Enhanced element selection with multi-select support
  const handleElementSelect = (id: string) => {
    if (activeTool !== 'select') return;

    // Check if Ctrl/Cmd is pressed for multi-selection
    const event = window.event as KeyboardEvent | undefined;
    const isMultiSelect = event && (event.ctrlKey || event.metaKey);

    if (isMultiSelect) {
      if (selectedElements.includes(id)) {
        setSelectedElements(prev => prev.filter(elId => elId !== id));
      } else {
        setSelectedElements(prev => [...prev, id]);
        setSelectedElement(null);
      }
    } else {
      if (selectedElements.length > 0) {
        setSelectedElements([]);
      }
      setSelectedElement(id === selectedElement ? null : id);
    }
  };

  // Delete element function
  const deleteElement = async (elementId: string) => {
    try {
      saveToHistory(elements);
      await elementsApi.deleteElement(elementId);
      setElements(prev => prev.filter(el => el.id !== elementId));
      setSelectedElement(null);
    } catch (err) {
      console.error("Failed to delete element", err);
      setError("Failed to delete element");
    }
  };

  // Load elements when component mounts
  useEffect(() => {
    const fetchElements = async () => {
      try {
        setIsLoading(true);
        const data = await elementsApi.getBoardElements(boardId);
        setElements(data);
        setError(null);
        // Initialize history with loaded elements
        setHistory([data]);
        setHistoryIndex(0);
      } catch (err) {
        setError("Failed to load board elements");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElements();
  }, [boardId]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      setStageSize({
        width: window.innerWidth * 0.95,
        height: window.innerHeight * 0.8,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Update draggable state based on active tool
  useEffect(() => {
    setIsDraggable(activeTool === 'pan');
  }, [activeTool]);

  // Pan and zoom handlers
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = scale;
    const pointer = stageRef.current?.getPointerPosition();
    
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    
    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    
    // Calculate new position
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPosition(newPos);
  };
  
  // Handle stage click for deselection
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Only deselect if the click is directly on the stage
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };
  
  // Enhanced element creation with immediate feedback and optimistic updates
  const addElement = async (type: ElementType) => {
    const stage = stageRef.current;
    if (!stage) return;
    
    // Get mouse position or use center with better positioning
    const pointer = stage.getPointerPosition();
    const elementPosition = pointer ? {
      x: Math.round((pointer.x - position.x) / scale),
      y: Math.round((pointer.y - position.y) / scale),
    } : {
      x: Math.round(stage.width() / 2 / scale - position.x / scale),
      y: Math.round(stage.height() / 2 / scale - position.y / scale),
    };

    // Create optimized element with better defaults and modern styling
    const baseElement = {
      type,
      content: { text: "" }, 
      position: elementPosition,
      size: { width: 200, height: 150 },
      style: {},
      zIndex: elements.length,
      boardId,
    };
    
    // Configure element based on type with enhanced styling
    let finalElement: Omit<BoardElement, "id" | "createdAt" | "updatedAt">;
    
    switch (type) {
      case ElementType.STICKY_NOTE:
        finalElement = {
          ...baseElement,
          content: { text: "Double-click to edit" } as StickyNoteContent,
          size: { width: 220, height: 220 },
          style: {
            fill: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            stroke: "#f59e0b",
            strokeWidth: 2,
            cornerRadius: 16,
            shadowColor: "rgba(245, 158, 11, 0.4)",
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 8,
            opacity: 0.95,
          },
        };
        break;
      case ElementType.SHAPE:
        // Enhanced shape creation with better visuals
        switch (activeShape) {
          case 'circle':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'ellipse' } as ShapeContent,
              size: { width: 140, height: 140 },
              style: {
                fill: "linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)",
                stroke: "#7c3aed",
                strokeWidth: 3,
                shadowColor: "rgba(168, 85, 247, 0.4)",
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                opacity: 0.9,
              },
            };
            break;
          case 'triangle':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'triangle' } as ShapeContent,
              size: { width: 140, height: 140 },
              style: {
                fill: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                stroke: "#be185d",
                strokeWidth: 3,
                shadowColor: "rgba(236, 72, 153, 0.4)",
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                opacity: 0.9,
              },
            };
            break;
          case 'star':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'star', points: 5 } as unknown as ShapeContent,
              size: { width: 140, height: 140 },
              style: {
                fill: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                stroke: "#b45309",
                strokeWidth: 3,
                shadowColor: "rgba(245, 158, 11, 0.4)",
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                opacity: 0.9,
              },
            };
            break;
          case 'diamond':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'diamond' } as ShapeContent,
              size: { width: 140, height: 140 },
              style: {
                fill: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                stroke: "#047857",
                strokeWidth: 3,
                shadowColor: "rgba(16, 185, 129, 0.4)",
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                opacity: 0.9,
              },
            };
            break;
          case 'arrow':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'arrow' } as ShapeContent,
              size: { width: 200, height: 80 },
              style: {
                fill: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                stroke: "#3730a3",
                strokeWidth: 3,
                pointerLength: 20,
                pointerWidth: 20,
                shadowColor: "rgba(99, 102, 241, 0.4)",
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                opacity: 0.9,
              },
            };
            break;
          case 'rectangle':
          default:
            finalElement = {
              ...baseElement,
              content: { shapeType: 'rectangle' } as ShapeContent,
              size: { width: 180, height: 120 },
              style: {
                fill: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                stroke: "#1d4ed8",
                strokeWidth: 3,
                cornerRadius: 16,
                shadowColor: "rgba(59, 130, 246, 0.4)",
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                opacity: 0.9,
              },
            };
        }
        break;
      case ElementType.TEXT:
        finalElement = {
          ...baseElement,
          content: { text: "Double-click to edit text" } as TextContent,
          size: { width: 250, height: 80 },
          style: {
            fontSize: 20,
            fill: "#f1f5f9",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: "600",
            align: "center",
            shadowColor: "rgba(0,0,0,0.7)",
            shadowBlur: 8,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            letterSpacing: 0.5,
          },
        };
        break;
      default:
        finalElement = {
          ...baseElement,
          content: { text: "New element" } as StickyNoteContent,
          style: {
            fill: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            stroke: "#f59e0b",
            strokeWidth: 2,
            cornerRadius: 16,
            shadowColor: "rgba(245, 158, 11, 0.4)",
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 8,
          },
        };
    }
    
    // Add to history before making changes
    saveToHistory(elements);
    
    try {
      // Create temporary element for immediate visual feedback
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempElement = { 
        ...finalElement, 
        id: tempId, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      } as BoardElement;
      
      // Add element immediately to UI with smooth animation
      setElements(prev => [...prev, tempElement]);
      setSelectedElement(tempId);
      
      // Create element on server in background
      const created = await elementsApi.createElement(finalElement);
      
      // Replace temporary element with server response
      setElements(prev => prev.map(el => el.id === tempId ? created : el));
      setSelectedElement(created.id);
      
      // Auto-switch to select tool for immediate interaction
      if (activeTool !== 'select') {
        setActiveTool('select');
      }
      
      // Animate the newly created element
      setTimeout(() => {
        if (layerRef.current) {
          layerRef.current.batchDraw();
        }
      }, 50);
      
    } catch (err) {
      console.error(`Failed to create ${type}:`, err);
      // Remove temporary elements that might be created
      setElements(prev => prev.filter(el => !el.id.startsWith('temp-')));
      setSelectedElement(null);
      setError(`Failed to create ${type}. Please try again.`);
    }
  };

  // Handle tool changes
  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool === 'pan') {
      setIsDraggable(true);
    } else {
      setIsDraggable(false);
    }
    
    // Open AI dialog when AI tool is selected
    if (tool === 'ai') {
      setIsAIDialogOpen(true);
    }
  };
  
  // Handle shape type changes
  const handleShapeChange = (shape: ShapeType) => {
    setActiveShape(shape);
  };
  
  // Handle AI-generated elements
  const handleAIGeneratedElements = (generatedElements: BoardElement[]) => {
    setElements([...elements, ...generatedElements]);
    setActiveTool('select'); // Switch back to select tool after generating
  };

  // Enhanced element rendering with improved performance and interactions
  const renderElements = () => {
    // Use visible elements for better performance on large canvases
    const elementsToRender = visibleElements.length > 0 ? visibleElements : elements;
    
    return elementsToRender.map((element) => {
      const isSelected = element.id === selectedElement;
      const isMultiSelected = selectedElements.includes(element.id);
      
      const commonProps = {
        key: element.id,
        onClick: () => handleElementSelect(element.id),
        draggable: activeTool === 'select',
        onDragStart: () => {
          // Add dragging feedback
          if (layerRef.current) {
            layerRef.current.getStage().container().style.cursor = 'grabbing';
          }
        },
        onDragEnd: (e: KonvaEventObject<DragEvent>) => {
          // Reset cursor
          if (layerRef.current) {
            layerRef.current.getStage().container().style.cursor = 'default';
          }
          
          // Get new position
          const newPos = { x: Math.round(e.target.x()), y: Math.round(e.target.y()) };
          
          // Update position optimistically
          const updatedElements = elements.map((elem) =>
            elem.id === element.id
              ? { ...elem, position: newPos }
              : elem
          );
          setElements(updatedElements);
          
          // Update position in database with debouncing
          debouncedUpdate(element.id, { position: newPos });
        },
        onMouseEnter: () => {
          if (activeTool === 'select' && layerRef.current) {
            layerRef.current.getStage().container().style.cursor = 'grab';
          }
        },
        onMouseLeave: () => {
          if (layerRef.current) {
            layerRef.current.getStage().container().style.cursor = 'default';
          }
        },
      };
      
      // Enhanced selection styling
      const selectionStyle = isSelected || isMultiSelected ? {
        strokeWidth: 3,
        stroke: isSelected ? "#3b82f6" : "#8b5cf6",
        shadowBlur: 25,
        shadowColor: isSelected ? "rgba(59, 130, 246, 0.6)" : "rgba(139, 92, 246, 0.6)",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      } : {};
      
      switch (element.type) {
        case ElementType.STICKY_NOTE: {
          const content = element.content as StickyNoteContent;
          return (
            <React.Fragment key={element.id}>
              <Rect
                {...commonProps}
                x={element.position.x}
                y={element.position.y}
                width={element.size?.width || 220}
                height={element.size?.height || 220}
                fill={typeof element.style?.fill === "string" ? element.style.fill : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"}
                stroke={selectionStyle.stroke || (typeof element.style?.stroke === "string" ? element.style.stroke : "#f59e0b")}
                strokeWidth={selectionStyle.strokeWidth || (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 2)}
                cornerRadius={typeof element.style?.cornerRadius === "number" ? element.style.cornerRadius : 16}
                shadowColor={selectionStyle.shadowColor || (typeof element.style?.shadowColor === "string" ? element.style.shadowColor : "rgba(245, 158, 11, 0.4)")}
                shadowBlur={selectionStyle.shadowBlur || (typeof element.style?.shadowBlur === "number" ? element.style.shadowBlur : 20)}
                shadowOffsetX={selectionStyle.shadowOffsetX ?? (typeof element.style?.shadowOffsetX === "number" ? element.style.shadowOffsetX : 0)}
                shadowOffsetY={selectionStyle.shadowOffsetY ?? (typeof element.style?.shadowOffsetY === "number" ? element.style.shadowOffsetY : 8)}
                opacity={typeof element.style?.opacity === "number" ? element.style.opacity : 0.95}
              />
              <Text
                x={element.position.x + 15}
                y={element.position.y + 15}
                text={content.text || "Double-click to edit"}
                width={(element.size?.width || 220) - 30}
                height={(element.size?.height || 220) - 30}
                fontSize={16}
                fill="#1f2937"
                fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
                fontWeight="500"
                lineHeight={1.4}
                wrap="word"
                onClick={() => handleElementSelect(element.id)}
                onDblClick={() => {
                  // Handle text editing
                  const newText = prompt("Edit text:", content.text || "");
                  if (newText !== null) {
                    const updatedContent = { ...content, text: newText };
                    debouncedUpdate(element.id, { content: updatedContent });
                    setElements(prev => prev.map(el => 
                      el.id === element.id 
                        ? { ...el, content: updatedContent }
                        : el
                    ));
                  }
                }}
              />
            </React.Fragment>
          );
        }
        case ElementType.SHAPE: {
          const content = element.content as ShapeContent;
          switch (content.shapeType) {
            case 'ellipse':
              return (
                <Circle
                  {...commonProps}
                  x={element.position.x + (element.size?.width || 140) / 2}
                  y={element.position.y + (element.size?.height || 140) / 2}
                  radius={(element.size?.width || 140) / 2}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)"}
                  stroke={selectionStyle.stroke || (typeof element.style?.stroke === "string" ? element.style.stroke : "#7c3aed")}
                  strokeWidth={selectionStyle.strokeWidth || (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 3)}
                  shadowColor={selectionStyle.shadowColor || (typeof element.style?.shadowColor === "string" ? element.style.shadowColor : "rgba(168, 85, 247, 0.4)")}
                  shadowBlur={selectionStyle.shadowBlur || (typeof element.style?.shadowBlur === "number" ? element.style.shadowBlur : 20)}
                  shadowOffsetX={selectionStyle.shadowOffsetX ?? (typeof element.style?.shadowOffsetX === "number" ? element.style.shadowOffsetX : 0)}
                  shadowOffsetY={selectionStyle.shadowOffsetY ?? (typeof element.style?.shadowOffsetY === "number" ? element.style.shadowOffsetY : 8)}
                  opacity={typeof element.style?.opacity === "number" ? element.style.opacity : 0.9}
                />
              );
            case 'triangle':
              return (
                <RegularPolygon
                  {...commonProps}
                  x={element.position.x + (element.size?.width || 140) / 2}
                  y={element.position.y + (element.size?.height || 140) / 2}
                  sides={3}
                  radius={(element.size?.width || 140) / 2}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"}
                  stroke={selectionStyle.stroke || (typeof element.style?.stroke === "string" ? element.style.stroke : "#be185d")}
                  strokeWidth={selectionStyle.strokeWidth || (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 3)}
                  shadowColor={selectionStyle.shadowColor || (typeof element.style?.shadowColor === "string" ? element.style.shadowColor : "rgba(236, 72, 153, 0.4)")}
                  shadowBlur={selectionStyle.shadowBlur || (typeof element.style?.shadowBlur === "number" ? element.style.shadowBlur : 20)}
                  shadowOffsetX={selectionStyle.shadowOffsetX ?? (typeof element.style?.shadowOffsetX === "number" ? element.style.shadowOffsetX : 0)}
                  shadowOffsetY={selectionStyle.shadowOffsetY ?? (typeof element.style?.shadowOffsetY === "number" ? element.style.shadowOffsetY : 8)}
                  opacity={typeof element.style?.opacity === "number" ? element.style.opacity : 0.9}
                />
              );
            case 'star':
              return (
                <Star
                  {...commonProps}
                  x={element.position.x + (element.size?.width || 140) / 2}
                  y={element.position.y + (element.size?.height || 140) / 2}
                  numPoints={typeof content.points === 'number' ? content.points : 5}
                  innerRadius={(element.size?.width || 140) / 4}
                  outerRadius={(element.size?.width || 140) / 2}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"}
                  stroke={selectionStyle.stroke || (typeof element.style?.stroke === "string" ? element.style.stroke : "#b45309")}
                  strokeWidth={selectionStyle.strokeWidth || (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 3)}
                  shadowColor={selectionStyle.shadowColor || (typeof element.style?.shadowColor === "string" ? element.style.shadowColor : "rgba(245, 158, 11, 0.4)")}
                  shadowBlur={selectionStyle.shadowBlur || (typeof element.style?.shadowBlur === "number" ? element.style.shadowBlur : 20)}
                  shadowOffsetX={selectionStyle.shadowOffsetX ?? (typeof element.style?.shadowOffsetX === "number" ? element.style.shadowOffsetX : 0)}
                  shadowOffsetY={selectionStyle.shadowOffsetY ?? (typeof element.style?.shadowOffsetY === "number" ? element.style.shadowOffsetY : 8)}
                  opacity={typeof element.style?.opacity === "number" ? element.style.opacity : 0.9}
                />
              );
            case 'diamond':
              return (
                <RegularPolygon
                  {...commonProps}
                  x={element.position.x + (element.size?.width || 140) / 2}
                  y={element.position.y + (element.size?.height || 140) / 2}
                  sides={4}
                  radius={(element.size?.width || 140) / 2}
                  rotation={45}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "linear-gradient(135deg, #10b981 0%, #059669 100%)"}
                  stroke={selectionStyle.stroke || (typeof element.style?.stroke === "string" ? element.style.stroke : "#047857")}
                  strokeWidth={selectionStyle.strokeWidth || (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 3)}
                  shadowColor={selectionStyle.shadowColor || (typeof element.style?.shadowColor === "string" ? element.style.shadowColor : "rgba(16, 185, 129, 0.4)")}
                  shadowBlur={selectionStyle.shadowBlur || (typeof element.style?.shadowBlur === "number" ? element.style.shadowBlur : 20)}
                  shadowOffsetX={selectionStyle.shadowOffsetX ?? (typeof element.style?.shadowOffsetX === "number" ? element.style.shadowOffsetX : 0)}
                  shadowOffsetY={selectionStyle.shadowOffsetY ?? (typeof element.style?.shadowOffsetY === "number" ? element.style.shadowOffsetY : 8)}
                  opacity={typeof element.style?.opacity === "number" ? element.style.opacity : 0.9}
                />
              );
            case 'arrow':
              return (
                <Arrow
                  {...commonProps}
                  points={[
                    element.position.x, element.position.y + (element.size?.height || 80) / 2,
                    element.position.x + (element.size?.width || 200), element.position.y + (element.size?.height || 80) / 2,
                  ]}
                  pointerLength={element.style?.pointerLength as number || 20}
                  pointerWidth={element.style?.pointerWidth as number || 20}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"}
                  stroke={selectionStyle.stroke || (typeof element.style?.stroke === "string" ? element.style.stroke : "#3730a3")}
                  strokeWidth={selectionStyle.strokeWidth || (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 3)}
                  shadowColor={selectionStyle.shadowColor || (typeof element.style?.shadowColor === "string" ? element.style.shadowColor : "rgba(99, 102, 241, 0.4)")}
                  shadowBlur={selectionStyle.shadowBlur || (typeof element.style?.shadowBlur === "number" ? element.style.shadowBlur : 20)}
                  shadowOffsetX={selectionStyle.shadowOffsetX ?? (typeof element.style?.shadowOffsetX === "number" ? element.style.shadowOffsetX : 0)}
                  shadowOffsetY={selectionStyle.shadowOffsetY ?? (typeof element.style?.shadowOffsetY === "number" ? element.style.shadowOffsetY : 8)}
                  opacity={typeof element.style?.opacity === "number" ? element.style.opacity : 0.9}
                />
              );
            case 'rectangle':
            default:
              return (
                <Rect
                  {...commonProps}
                  x={element.position.x}
                  y={element.position.y}
                  width={element.size?.width || 180}
                  height={element.size?.height || 120}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"}
                  stroke={selectionStyle.stroke || (typeof element.style?.stroke === "string" ? element.style.stroke : "#1d4ed8")}
                  strokeWidth={selectionStyle.strokeWidth || (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 3)}
                  cornerRadius={typeof element.style?.cornerRadius === "number" ? element.style.cornerRadius : 16}
                  shadowColor={selectionStyle.shadowColor || (typeof element.style?.shadowColor === "string" ? element.style.shadowColor : "rgba(59, 130, 246, 0.4)")}
                  shadowBlur={selectionStyle.shadowBlur || (typeof element.style?.shadowBlur === "number" ? element.style.shadowBlur : 20)}
                  shadowOffsetX={selectionStyle.shadowOffsetX ?? (typeof element.style?.shadowOffsetX === "number" ? element.style.shadowOffsetX : 0)}
                  shadowOffsetY={selectionStyle.shadowOffsetY ?? (typeof element.style?.shadowOffsetY === "number" ? element.style.shadowOffsetY : 8)}
                  opacity={typeof element.style?.opacity === "number" ? element.style.opacity : 0.9}
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
              text={content.text || "Double-click to edit text"}
              width={element.size?.width || 250}
              fontSize={typeof element.style?.fontSize === "number" ? element.style.fontSize : 20}
              fill={typeof element.style?.fill === "string" ? element.style.fill : "#f1f5f9"}
              fontFamily={typeof element.style?.fontFamily === "string" ? element.style.fontFamily : "Inter, -apple-system, BlinkMacSystemFont, sans-serif"}
              fontWeight={typeof element.style?.fontWeight === "string" ? element.style.fontWeight : "600"}
              align={typeof element.style?.align === "string" ? element.style.align : "center"}
              padding={10}
              shadowColor={typeof element.style?.shadowColor === "string" ? element.style.shadowColor : "rgba(0,0,0,0.7)"}
              shadowBlur={typeof element.style?.shadowBlur === "number" ? element.style.shadowBlur : 8}
              shadowOffsetX={typeof element.style?.shadowOffsetX === "number" ? element.style.shadowOffsetX : 2}
              shadowOffsetY={typeof element.style?.shadowOffsetY === "number" ? element.style.shadowOffsetY : 2}
              letterSpacing={typeof element.style?.letterSpacing === "number" ? element.style.letterSpacing : 0.5}
              stroke={isSelected ? "#3b82f6" : "transparent"}
              strokeWidth={isSelected ? 2 : 0}
              onDblClick={() => {
                // Handle text editing
                const newText = prompt("Edit text:", content.text || "");
                if (newText !== null) {
                  const updatedContent = { ...content, text: newText };
                  debouncedUpdate(element.id, { content: updatedContent });
                  setElements(prev => prev.map(el => 
                    el.id === element.id 
                      ? { ...el, content: updatedContent }
                      : el
                  ));
                }
              }}
            />
          );
        }
        default:
          return null;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-slate-400 font-medium">Loading canvas...</p>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error loading canvas</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/25"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <Link href="/boards" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-white">Canvas</h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Undo/Redo */}
          <div className="flex items-center space-x-2">
            <button 
              className={`p-2 rounded-lg transition-all duration-200 ${historyIndex > 0 ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300' : 'bg-slate-800/20 text-slate-600 cursor-not-allowed'}`}
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button 
              className={`p-2 rounded-lg transition-all duration-200 ${historyIndex < history.length - 1 ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300' : 'bg-slate-800/20 text-slate-600 cursor-not-allowed'}`}
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
              </svg>
            </button>
          </div>
          
          {/* Zoom controls */}
          <div className="flex items-center space-x-2 bg-slate-800/30 backdrop-blur-lg rounded-xl px-3 py-2 border border-slate-600/30">
            <span className="text-sm text-slate-400">
              {Math.round(scale * 100)}%
            </span>
            <button 
              className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              title="Reset zoom (Ctrl+0)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Keyboard shortcuts help */}
          <button
            className="p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200 border border-slate-600/30"
            title="Keyboard shortcuts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="absolute top-20 left-4 z-10">
        <Toolbar 
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onShapeChange={handleShapeChange}
          onAddElement={addElement}
        />
      </div>
      
      {/* Actions Panel */}
      <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
        {/* Delete button for selected element */}
        {selectedElement && (
          <div className="bg-white shadow-lg rounded-xl p-3 border border-gray-200 animate-fadeIn">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Selection Actions</h3>
            <div className="flex flex-col gap-2">
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1"
                onClick={() => {
                  if (selectedElement) {
                    elementsApi.deleteElement(selectedElement)
                      .then(() => {
                        setElements(elements.filter(el => el.id !== selectedElement));
                        setSelectedElement(null);
                      })
                      .catch(err => console.error("Failed to delete element", err));
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Element
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1"
                onClick={() => {
                  // Duplicate functionality could be implemented here
                  setSelectedElement(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate Element
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Canvas */}
      <div className="absolute inset-0 overflow-hidden pt-14">
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
          className="bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <Layer>
            {/* Grid background */}
            <Rect 
              x={-10000}
              y={-10000}
              width={20000}
              height={20000}
              fill="#ffffff"
              strokeWidth={0}
            />
            
            {/* Render elements */}
            {renderElements()}
          </Layer>
        </Stage>
      </div>
      
      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-white border-t border-gray-200 text-xs text-gray-500 flex items-center px-4 justify-between">
        <div>
          Elements: {elements.length}
        </div>
        <div>
          {selectedElement ? 'Element selected' : 'No selection'}
        </div>
      </div>
      
      {/* AI Dialog */}
      {isAIDialogOpen && (
        <AIDialog
          isOpen={isAIDialogOpen}
          onClose={() => setIsAIDialogOpen(false)}
          boardId={boardId}
          onElementsGenerated={handleAIGeneratedElements}
        />
      )}
    </div>
  );
}
