// Custom hook for making API requests with proper CORS handling
import { useState, useEffect } from 'react';

type ApiRequestState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export function useApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): ApiRequestState<T> & { 
  refetch: () => Promise<void> 
} {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
  
  const fetchData = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include",
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || `Error ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        setState({
          data: {} as T,
          isLoading: false,
          error: null,
        });
        return;
      }

      const data = await response.json();
      setState({
        data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("API Request Failed:", error);
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]); // Re-fetch when endpoint changes

  return {
    ...state,
    refetch: fetchData,
  };
}
