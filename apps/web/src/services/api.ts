// API service for communicating with the backend

import { Board, BoardElement } from "@/types";

// Use relative URLs when in the browser to leverage Next.js API proxy
const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001");

// Helper for API requests
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  console.log(`Making request to: ${url} with method: ${options.method || 'GET'}`);
  if (options.body) {
    console.log(`Request payload: ${options.body}`);
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      // Explicitly set mode to cors for cross-origin requests
      mode: 'cors',
      // Use default credentials policy (omit)
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
        console.error("API Error:", errorJson);
        throw new Error(errorJson.detail || `Error ${response.status}: ${response.statusText}`);
      } catch {
        // If the response is not JSON
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }

    // For DELETE requests that return 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

// Board API methods
export const boardsApi = {
  getBoards: () => fetchAPI<Board[]>("/api/boards"),
  
  getBoard: (id: string) => fetchAPI<Board>(`/api/boards/${id}`),
  
  createBoard: (data: { title: string; description?: string }) =>
    fetchAPI<Board>("/api/boards", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  updateBoard: (id: string, data: { title?: string; description?: string }) =>
    fetchAPI<Board>(`/api/boards/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    
  deleteBoard: (id: string) =>
    fetchAPI(`/api/boards/${id}`, {
      method: "DELETE",
    }),
};

// BoardElement API methods
export const elementsApi = {
  getBoardElements: (boardId: string) =>
    fetchAPI<BoardElement[]>(`/api/elements/board/${boardId}`),
    
  createElement: (element: Omit<BoardElement, "id" | "createdAt" | "updatedAt">) => {
    // Deep clone to avoid modifying the original object
    const elementClone = JSON.parse(JSON.stringify(element));
    
    // Ensure all data is properly formatted
    const payload = {
      ...elementClone,
      // Convert types to strings if needed
      type: String(elementClone.type),
      // Ensure position is properly formatted
      position: elementClone.position || { x: 0, y: 0 },
      // Provide proper default for optional fields
      size: elementClone.size || undefined,
      style: elementClone.style || undefined,
      zIndex: typeof elementClone.zIndex === 'number' ? elementClone.zIndex : 0,
    };
    
    // Validate content structure based on element type
    if (payload.type === 'shape' && payload.content.shapeType) {
      // Make sure shape content is properly formatted
      const shape = payload.content;
      
      // Ensure points are properly formatted for backend
      if (shape.shapeType === 'star' && typeof shape.points === 'number') {
        // Keep the points as a number for star (numPoints)
        console.log(`Star with ${shape.points} points`);
      } else if (shape.shapeType === 'arrow' && !shape.points) {
        // Default arrow points
        console.log(`Arrow with default points`);
      }
    }
    
    console.log("Creating element with payload:", payload);
    
    return fetchAPI<BoardElement>("/api/elements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
    
  updateElement: (
    id: string,
    data: Partial<Omit<BoardElement, "id" | "boardId" | "createdAt" | "updatedAt">>
  ) => {
    console.log("Updating element with data:", data);
    
    return fetchAPI<BoardElement>(`/api/elements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
    
  deleteElement: (id: string) =>
    fetchAPI(`/api/elements/${id}`, {
      method: "DELETE",
    }),
};

// AI API methods
export const aiApi = {
  generateElements: (data: { text: string, boardId: string }) =>
    fetchAPI<BoardElement[]>("/api/ai/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  analyzeBoard: (boardId: string) =>
    fetchAPI<{ summary: string, suggestions: string[] }>("/api/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ boardId }),
    }),
};
