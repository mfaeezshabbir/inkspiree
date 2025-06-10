"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Board } from "@/types";
import { boardsApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function BoardsList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Load boards on component mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setIsLoading(true);
        const data = await boardsApi.getBoards();
        setBoards(data);
        setError(null);
      } catch (err) {
        setError("Failed to load boards. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, []);

  // Handle form submission for creating a new board
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBoardTitle.trim()) return;
    
    try {
      setIsCreating(true);
      const newBoard = await boardsApi.createBoard({
        title: newBoardTitle,
        description: newBoardDescription || undefined,
      });
      
      setBoards([newBoard, ...boards]);
      setNewBoardTitle("");
      setNewBoardDescription("");
      setIsCreating(false);
    } catch (err) {
      setError("Failed to create board");
      console.error(err);
      setIsCreating(false);
    }
  };

  // Handle board deletion
  const handleDeleteBoard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this board?")) return;
    
    try {
      await boardsApi.deleteBoard(id);
      setBoards(boards.filter((board) => board.id !== id));
    } catch (err) {
      setError("Failed to delete board");
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8 animate-fadeIn">Loading boards...</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 md:px-0">
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-10 border border-indigo-100 animate-fadeIn">
        <h2 className="text-2xl font-extrabold mb-4 text-indigo-700 tracking-tight flex items-center gap-2">
          <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="6" fill="currentColor" /></svg>
          Create a New Board
        </h2>
        <form onSubmit={handleCreateBoard} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80 shadow-sm"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Enter board title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80 shadow-sm"
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
              placeholder="Enter board description (optional)"
              rows={2}
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
              disabled={isCreating}
              className="px-8 py-2 text-lg rounded-xl shadow-md bg-gradient-to-tr from-indigo-500 to-blue-400 hover:from-indigo-600 hover:to-blue-500 transition"
            >
              Create Board
            </Button>
          </div>
        </form>
      </div>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {/* Boards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {boards.length === 0 ? (
          <p className="col-span-2 text-gray-500 text-center py-8 animate-fadeIn">
            No boards yet. Create your first board above!
          </p>
        ) : (
          boards.map((board) => (
            <div
              key={board.id}
              className="relative bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-100 hover:shadow-2xl transition-shadow group overflow-hidden animate-scaleIn"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-tr from-indigo-200 to-blue-200 rounded-full opacity-40 blur-2xl z-0" />
              <div className="relative z-10 p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-1 text-indigo-800 group-hover:text-indigo-900 transition">{board.title}</h3>
                {board.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">{board.description}</p>
                )}
                <div className="flex justify-between items-end mt-auto pt-4">
                  <span className="text-xs text-gray-400">
                    Created: {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                  <div className="space-x-2 flex items-center">
                    <Button
                      onClick={() => handleDeleteBoard(board.id)}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50 text-red-500"
                    >
                      Delete
                    </Button>
                    <Link href={`/boards/${board.id}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-gradient-to-tr from-indigo-500 to-blue-400 hover:from-indigo-600 hover:to-blue-500 text-white px-5 py-2 rounded-lg shadow-md"
                      >
                        Open
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
