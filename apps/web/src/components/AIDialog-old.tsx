"use client";

import React, { useState } from 'react';
import { aiApi } from '@/services/api';
import { BoardElement } from '@/types';

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onElementsGenerated: (elements: BoardElement[]) => void;
}

export default function AIDialog({
  isOpen,
  onClose,
  boardId,
  onElementsGenerated,
}: AIDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ summary?: string; suggestions?: string[] } | null>(null);
  const [mode, setMode] = useState<'generate' | 'analyze'>('generate');

  if (!isOpen) return null;

  const handleGenerateElements = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const generatedElements = await aiApi.generateElements({
        text: prompt,
        boardId,
      });
      
      onElementsGenerated(generatedElements);
      setPrompt('');
      onClose();
    } catch (err) {
      console.error('Failed to generate elements:', err);
      setError('Failed to generate elements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeBoard = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const analysis = await aiApi.analyzeBoard(boardId);
      setResult(analysis);
    } catch (err) {
      console.error('Failed to analyze board:', err);
      setError('Failed to analyze board. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">AI Assistant</h2>
          <button
            type="button"
            title='Close'
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setMode('generate')}
            className={`px-4 py-2 rounded ${
              mode === 'generate'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Generate Elements
          </button>
          <button
            onClick={() => setMode('analyze')}
            className={`px-4 py-2 rounded ${
              mode === 'analyze'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Analyze Board
          </button>
        </div>
        
        {mode === 'generate' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to create
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="E.g., Create a sticky note with the text 'Project Goals' and a rectangle shape next to it"
              rows={4}
              disabled={loading}
            />
            <button
              onClick={handleGenerateElements}
              disabled={loading || !prompt.trim()}
              className={`mt-4 w-full px-4 py-2 rounded-md ${
                loading || !prompt.trim()
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Elements'}
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-700">
              Analyze the current board to get insights and suggestions.
            </p>
            <button
              onClick={handleAnalyzeBoard}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-md ${
                loading
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {loading ? 'Analyzing...' : 'Analyze Board'}
            </button>
            
            {result && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800">Analysis Results</h3>
                {result.summary && (
                  <p className="mt-2 text-gray-700">{result.summary}</p>
                )}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700">Suggestions:</h4>
                    <ul className="mt-1 list-disc list-inside text-gray-600">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-red-500 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}
