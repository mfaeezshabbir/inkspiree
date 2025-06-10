// Common type definitions for the app

// Canvas element types
export enum ElementType {
  STICKY_NOTE = "sticky-note",
  SHAPE = "shape",
  TEXT = "text",
  CONNECTOR = "connector",
  IMAGE = "image"
}

export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

// Define specific content types for each element type
export type StickyNoteContent = {
  text: string;
  color?: string;
};

export type ShapeContent = {
  shapeType: "rectangle" | "ellipse" | "triangle" | "diamond" | "star" | "arrow";
  color?: string;
  points?: number | number[];  // For complex shapes like arrows or stars (number for star points, number[] for custom shapes)
};

export type TextContent = {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
};

export type ConnectorContent = {
  fromElementId: string;
  toElementId: string;
  label?: string;
};

export type ImageContent = {
  url: string;
  alt?: string;
};

export type BoardElementContent =
  | StickyNoteContent
  | ShapeContent
  | TextContent
  | ConnectorContent
  | ImageContent;

export interface BoardElement {
  id: string;
  type: ElementType;
  content: BoardElementContent;
  position: Position;
  size?: Size;
  style?: Record<string, unknown>;
  zIndex: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
