"use client";

import React, { useState, useEffect, useRef } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import Link from "next/link";

import { 
  BoardElement, 
  ElementType, 
  StickyNoteContent, 
  ShapeContent, 
  TextContent,
  ConnectorContent,
  ImageContent 
} from "@/types";
import { elementsApi } from "@/services/api";
import AIDialog from "@/components/AIDialog";

// Import pre-configured Konva components from our utility file
import { 
  Stage, 
  Layer, 
  Rect, 
  Text, 
  Circle, 
  Line, 
  RegularPolygon, 
  Arrow, 
  Star, 
  Group, 
  Transformer,
  Image 
} from "@/components/KonvaComponents";

interface BoardCanvasProps {
  boardId: string;
}

// Available tools in the toolbar
type ToolType = 'select' | 'pan' | 'sticky' | 'shape' | 'text' | 'connector' | 'image' | 'ai';
type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond' | 'arrow';

export default function BoardCanvas({ boardId }: BoardCanvasProps) {
  // Canvas state
  const [stageSize, setStageSize] = useState({ width: 1200, height: 700 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Elements state
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Toolbar state
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle');
  const [isDraggable, setIsDraggable] = useState(true);
  const [showShapeOptions, setShowShapeOptions] = useState(false);
  
  // AI dialog state
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  
  const stageRef = useRef<StageType | null>(null);

  // Load elements when component mounts
  useEffect(() => {
    const fetchElements = async () => {
      try {
        setIsLoading(true);
        const data = await elementsApi.getBoardElements(boardId);
        setElements(data);
        setError(null);
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
        width: window.innerWidth,
        height: window.innerHeight - 80, // Account for header
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
    setScale(Math.max(0.1, Math.min(3, newScale))); // Limit zoom
    
    // Calculate new position
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPosition(newPos);
  };
  
  // Handle element selection
  const handleElementSelect = (id: string) => {
    if (activeTool === 'select') {
      setSelectedElement(id === selectedElement ? null : id);
    }
  };
  
  // Handle stage click for deselection
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Only deselect if the click is directly on the stage
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };
  
  // Add a new element (sticky note, shape, text)
  const addElement = (type: ElementType) => {
    // Get stage center position
    const stage = stageRef.current;
    if (!stage) return;
    
    const center = {
      x: stage.width() / 2 / scale - position.x / scale,
      y: stage.height() / 2 / scale - position.y / scale,
    };

    // Create base element
    const baseElement = {
      type,
      content: { text: "" }, 
      position: center,
      size: { width: 200, height: 150 },
      style: {},
      zIndex: elements.length,
      boardId,
    };
    
    // Configure element based on type
    let finalElement: Omit<BoardElement, "id" | "createdAt" | "updatedAt">;
    
    switch (type) {
      case ElementType.STICKY_NOTE:
        finalElement = {
          ...baseElement,
          content: { text: "New sticky note" } as StickyNoteContent,
          style: {
            fill: "#fbbf24",
            stroke: "#f59e0b",
            strokeWidth: 1,
            cornerRadius: 8,
          },
        };
        break;
      case ElementType.SHAPE:
        switch (activeShape) {
          case 'circle':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'ellipse' } as ShapeContent,
              size: { width: 100, height: 100 },
              style: {
                fill: "#8b5cf6",
                stroke: "#7c3aed",
                strokeWidth: 2,
              },
            };
            break;
          case 'triangle':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'triangle' } as ShapeContent,
              size: { width: 100, height: 100 },
              style: {
                fill: "#ec4899",
                stroke: "#db2777",
                strokeWidth: 2,
              },
            };
            break;
          case 'star':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'star', points: 5 } as unknown as ShapeContent,
              size: { width: 100, height: 100 },
              style: {
                fill: "#f59e0b",
                stroke: "#d97706",
                strokeWidth: 2,
              },
            };
            break;
          case 'diamond':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'diamond' } as ShapeContent,
              size: { width: 100, height: 100 },
              style: {
                fill: "#10b981",
                stroke: "#059669",
                strokeWidth: 2,
              },
            };
            break;
          case 'arrow':
            finalElement = {
              ...baseElement,
              content: { shapeType: 'arrow' } as ShapeContent,
              size: { width: 150, height: 50 },
              style: {
                fill: "#6366f1",
                stroke: "#4f46e5",
                strokeWidth: 3,
                pointerLength: 12,
                pointerWidth: 12,
              },
            };
            break;
          case 'rectangle':
          default:
            finalElement = {
              ...baseElement,
              content: { shapeType: 'rectangle' } as ShapeContent,
              style: {
                fill: "#3b82f6",
                stroke: "#2563eb",
                strokeWidth: 2,
                cornerRadius: 8,
              },
            };
        }
        break;
      case ElementType.TEXT:
        finalElement = {
          ...baseElement,
          content: { text: "New text" } as TextContent,
          size: { width: 150, height: 50 },
          style: {
            fontSize: 18,
            fill: "#f8fafc",
            fontFamily: "Inter",
          },
        };
        break;
      default:
        finalElement = {
          ...baseElement,
          content: { text: "" } as StickyNoteContent,
        };
    }
    
    elementsApi.createElement(finalElement)
      .then((created) => {
        setElements([...elements, created]);
        setSelectedElement(created.id);
      })
      .catch((err) => {
        console.error(`Failed to create ${type}`, err);
      });
  };

  // Handle tool changes
  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    setShowShapeOptions(false);
    
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
    setShowShapeOptions(false);
    addElement(ElementType.SHAPE);
  };
  
  // Handle AI-generated elements
  const handleAIGeneratedElements = (generatedElements: BoardElement[]) => {
    setElements([...elements, ...generatedElements]);
    setActiveTool('select');
  };

  // Render elements based on their type
  const renderElements = () => {
    return elements.map((element) => {
      const isSelected = element.id === selectedElement;
      const commonProps = {
        key: element.id,
        onClick: () => handleElementSelect(element.id),
        draggable: activeTool === 'select',
        onDragEnd: (e: KonvaEventObject<DragEvent>) => {
          const newPos = { x: e.target.x(), y: e.target.y() };
          elementsApi.updateElement(element.id, { position: newPos });
          
          const updatedElements = elements.map((elem) =>
            elem.id === element.id
              ? { ...elem, position: newPos }
              : elem
          );
          setElements(updatedElements);
        },
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
                height={element.size?.height || 150}
                fill={typeof element.style?.fill === "string" ? element.style.fill : "#fbbf24"}
                stroke={isSelected ? "#ffffff" : (typeof element.style?.stroke === "string" ? element.style.stroke : "#f59e0b")}
                strokeWidth={isSelected ? 3 : (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 1)}
                cornerRadius={typeof element.style?.cornerRadius === "number" ? element.style.cornerRadius : 8}
                shadowColor="rgba(0,0,0,0.3)"
                shadowBlur={isSelected ? 15 : 8}
                shadowOffset={{ x: 0, y: 4 }}
              />
              <Text
                x={element.position.x + 16}
                y={element.position.y + 16}
                text={content.text || "Sticky note"}
                width={(element.size?.width || 200) - 32}
                height={(element.size?.height || 150) - 32}
                fontSize={16}
                fill="#1f2937"
                fontFamily="Inter"
                onClick={() => handleElementSelect(element.id)}
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
                  x={element.position.x + (element.size?.width || 100) / 2}
                  y={element.position.y + (element.size?.height || 100) / 2}
                  radius={(element.size?.width || 100) / 2}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "#8b5cf6"}
                  stroke={isSelected ? "#ffffff" : (typeof element.style?.stroke === "string" ? element.style.stroke : "#7c3aed")}
                  strokeWidth={isSelected ? 4 : (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 2)}
                  shadowColor="rgba(0,0,0,0.3)"
                  shadowBlur={isSelected ? 15 : 8}
                  shadowOffset={{ x: 0, y: 4 }}
                />
              );
            case 'triangle':
              return (
                <RegularPolygon
                  {...commonProps}
                  x={element.position.x + (element.size?.width || 100) / 2}
                  y={element.position.y + (element.size?.height || 100) / 2}
                  sides={3}
                  radius={(element.size?.width || 100) / 2}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "#ec4899"}
                  stroke={isSelected ? "#ffffff" : (typeof element.style?.stroke === "string" ? element.style.stroke : "#db2777")}
                  strokeWidth={isSelected ? 4 : (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 2)}
                  shadowColor="rgba(0,0,0,0.3)"
                  shadowBlur={isSelected ? 15 : 8}
                  shadowOffset={{ x: 0, y: 4 }}
                />
              );
            case 'star':
              return (
                <Star
                  {...commonProps}
                  x={element.position.x + (element.size?.width || 100) / 2}
                  y={element.position.y + (element.size?.height || 100) / 2}
                  numPoints={typeof content.points === 'number' ? content.points : 5}
                  innerRadius={(element.size?.width || 100) / 4}
                  outerRadius={(element.size?.width || 100) / 2}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "#f59e0b"}
                  stroke={isSelected ? "#ffffff" : (typeof element.style?.stroke === "string" ? element.style.stroke : "#d97706")}
                  strokeWidth={isSelected ? 4 : (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 2)}
                  shadowColor="rgba(0,0,0,0.3)"
                  shadowBlur={isSelected ? 15 : 8}
                  shadowOffset={{ x: 0, y: 4 }}
                />
              );
            case 'diamond':
              return (
                <RegularPolygon
                  {...commonProps}
                  x={element.position.x + (element.size?.width || 100) / 2}
                  y={element.position.y + (element.size?.height || 100) / 2}
                  sides={4}
                  radius={(element.size?.width || 100) / 2}
                  rotation={45}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "#10b981"}
                  stroke={isSelected ? "#ffffff" : (typeof element.style?.stroke === "string" ? element.style.stroke : "#059669")}
                  strokeWidth={isSelected ? 4 : (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 2)}
                  shadowColor="rgba(0,0,0,0.3)"
                  shadowBlur={isSelected ? 15 : 8}
                  shadowOffset={{ x: 0, y: 4 }}
                />
              );
            case 'arrow':
              return (
                <Arrow
                  {...commonProps}
                  points={[
                    element.position.x, element.position.y + (element.size?.height || 50) / 2,
                    element.position.x + (element.size?.width || 150), element.position.y + (element.size?.height || 50) / 2,
                  ]}
                  pointerLength={element.style?.pointerLength as number || 12}
                  pointerWidth={element.style?.pointerWidth as number || 12}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "#6366f1"}
                  stroke={isSelected ? "#ffffff" : (typeof element.style?.stroke === "string" ? element.style.stroke : "#4f46e5")}
                  strokeWidth={isSelected ? 5 : (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 3)}
                  shadowColor="rgba(0,0,0,0.3)"
                  shadowBlur={isSelected ? 15 : 8}
                  shadowOffset={{ x: 0, y: 4 }}
                />
              );
            case 'rectangle':
            default:
              return (
                <Rect
                  {...commonProps}
                  x={element.position.x}
                  y={element.position.y}
                  width={element.size?.width || 150}
                  height={element.size?.height || 150}
                  fill={typeof element.style?.fill === "string" ? element.style.fill : "#3b82f6"}
                  stroke={isSelected ? "#ffffff" : (typeof element.style?.stroke === "string" ? element.style.stroke : "#2563eb")}
                  strokeWidth={isSelected ? 4 : (typeof element.style?.strokeWidth === "number" ? element.style.strokeWidth : 2)}
                  cornerRadius={typeof element.style?.cornerRadius === "number" ? element.style.cornerRadius : 8}
                  shadowColor="rgba(0,0,0,0.3)"
                  shadowBlur={isSelected ? 15 : 8}
                  shadowOffset={{ x: 0, y: 4 }}
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
              text={content.text || "Text"}
              width={element.size?.width || 150}
              fontSize={typeof element.style?.fontSize === "number" ? element.style.fontSize : 18}
              fill={typeof element.style?.fill === "string" ? element.style.fill : "#f8fafc"}
              fontFamily={typeof element.style?.fontFamily === "string" ? element.style.fontFamily : "Inter"}
              padding={8}
              stroke={isSelected ? "#ffffff" : "transparent"}
              strokeWidth={isSelected ? 2 : 0}
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
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-slate-400 font-medium">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="glass-strong rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error loading canvas</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Modern Header */}
      <header className="flex items-center justify-between p-4 glass-strong border-b border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <Link href="/boards" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">
              Back to Boards
            </span>
          </Link>
          
          <div className="h-6 w-px bg-slate-600"></div>
          
          <div>
            <h1 className="text-lg font-semibold text-white">Canvas</h1>
            <p className="text-xs text-slate-400">Board ID: {boardId.slice(0, 8)}...</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
            Zoom: {Math.round(scale * 100)}%
          </div>
          
          <button 
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 text-slate-400 hover:text-white"
            title="Reset view"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 relative">
        {/* Modern Floating Toolbar */}
        <div className="absolute left-6 top-6 z-50">
          <div className="flex flex-col space-y-2 glass-strong rounded-xl p-3 shadow-2xl">
            {/* Tool Selection */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleToolChange('select')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  activeTool === 'select' 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Select"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </button>
              
              <button
                onClick={() => handleToolChange('pan')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  activeTool === 'pan' 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Pan"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
              </button>
            </div>
            
            <div className="h-px bg-slate-600 my-2"></div>
            
            {/* Creation Tools */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  handleToolChange('sticky');
                  addElement(ElementType.STICKY_NOTE);
                }}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  activeTool === 'sticky' 
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Add Sticky Note"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowShapeOptions(!showShapeOptions)}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    activeTool === 'shape' 
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title="Add Shape"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {showShapeOptions && (
                  <div className="absolute left-full ml-3 top-0 glass-strong rounded-xl p-3 shadow-2xl">
                    <div className="grid grid-cols-2 gap-2 w-40">
                      {[
                        { type: 'rectangle', icon: '▭', label: 'Rectangle' },
                        { type: 'circle', icon: '●', label: 'Circle' },
                        { type: 'triangle', icon: '▲', label: 'Triangle' },
                        { type: 'diamond', icon: '◆', label: 'Diamond' },
                        { type: 'star', icon: '★', label: 'Star' },
                        { type: 'arrow', icon: '→', label: 'Arrow' },
                      ].map((shape) => (
                        <button
                          key={shape.type}
                          onClick={() => handleShapeChange(shape.type as ShapeType)}
                          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200 text-center"
                          title={shape.label}
                        >
                          <div className="text-lg mb-1">{shape.icon}</div>
                          <div className="text-xs">{shape.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  handleToolChange('text');
                  addElement(ElementType.TEXT);
                }}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  activeTool === 'text' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Add Text"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
              
              <button
                onClick={() => handleToolChange('ai')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  activeTool === 'ai' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title="AI Assistant"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Selection Panel */}
        {selectedElement && (
          <div className="absolute right-6 top-6 z-50">
            <div className="glass-strong rounded-xl p-4 shadow-2xl w-64 animate-slideInRight">
              <h3 className="text-sm font-semibold text-white mb-3">Element Actions</h3>
              <div className="space-y-2">
                <button
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
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Element</span>
                </button>
                
                <button
                  onClick={() => setSelectedElement(null)}
                  className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Deselect</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
          className="bg-slate-900"
        >
          <Layer>
            {/* Grid background */}
            <Rect 
              x={-10000}
              y={-10000}
              width={20000}
              height={20000}
              fill="transparent"
              stroke="#334155"
              strokeWidth={0.5}
              dash={[5, 5]}
              opacity={0.3}
            />
            
            {renderElements()}
          </Layer>
        </Stage>

        {/* Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 glass-strong border-t border-slate-700/50 px-6 py-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-4">
              <span>Elements: {elements.length}</span>
              <span>•</span>
              <span>{selectedElement ? 'Element selected' : 'No selection'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Position: {Math.round(position.x)}, {Math.round(position.y)}</span>
              <span>•</span>
              <span>Scale: {Math.round(scale * 100)}%</span>
            </div>
          </div>
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
