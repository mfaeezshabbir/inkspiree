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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-xl p-8 w-full max-w-lg animate-scaleIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-slate-700/50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mode Selector */}
        <div className="flex space-x-2 mb-6 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setMode('generate')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              mode === 'generate'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Generate Elements
          </button>
          <button
            onClick={() => setMode('analyze')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              mode === 'analyze'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Analyze Board
          </button>
        </div>
        
        {mode === 'generate' ? (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Describe what you want to create
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 resize-none"
              placeholder="E.g., Create a sticky note with the text 'Project Goals' and a rectangle shape next to it"
              rows={4}
              disabled={loading}
            />
            <button
              onClick={handleGenerateElements}
              disabled={loading || !prompt.trim()}
              className={`mt-4 w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading || !prompt.trim()
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Elements</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-slate-800/30 rounded-lg p-4 mb-4 border border-slate-600">
              <p className="text-slate-300 text-sm leading-relaxed">
                Analyze the current board to get insights and suggestions for improving your creative process.
              </p>
            </div>
            <button
              onClick={handleAnalyzeBoard}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analyze Board</span>
                </>
              )}
            </button>
            
            {result && (
              <div className="mt-6 glass-strong rounded-lg p-4 animate-fadeInUp">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white">Analysis Results</h3>
                </div>
                {result.summary && (
                  <p className="text-slate-300 mb-3 leading-relaxed">{result.summary}</p>
                )}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-200 mb-2 flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Suggestions:</span>
                    </h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2 text-slate-300 text-sm">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2 animate-fadeInUp">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
