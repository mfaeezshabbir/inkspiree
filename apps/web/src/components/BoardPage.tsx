"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Board } from "@/types";
import { boardsApi } from "@/services/api";
import BoardCanvas from "@/components/BoardCanvas";

interface BoardPageProps {
  boardId: string;
}

export default function BoardPage({ boardId }: BoardPageProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Load board on component mount
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setIsLoading(true);
        const data = await boardsApi.getBoard(boardId);
        setBoard(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setError(null);
      } catch (err) {
        setError("Failed to load board");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  // Handle board update
  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    try {
      const updatedBoard = await boardsApi.updateBoard(boardId, {
        title,
        description: description || undefined,
      });
      
      setBoard(updatedBoard);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update board");
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading board...</div>;
  }

  if (error || !board) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error || "Board not found"}
        </div>
        <Link
          href="/boards"
          className="text-blue-600 hover:underline"
        >
          Back to boards
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      {/* Board header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-indigo-100 p-6 shadow-lg rounded-b-2xl animate-slideIn">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full">
            {isEditing ? (
              <form onSubmit={handleUpdateBoard} className="flex flex-col md:flex-row gap-2 items-start md:items-end">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-indigo-200 rounded-lg mb-2 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80 shadow-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Board title"
                    required
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80 shadow-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                  />
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setTitle(board.title);
                      setDescription(board.description || "");
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-tr from-indigo-700 to-blue-500 bg-clip-text text-transparent mb-1 tracking-tight">
                  {board.title}
                </h1>
                {board.description && (
                  <p className="text-gray-600 text-lg mb-1">{board.description}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center mt-2 md:mt-0">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold py-2 px-5 rounded-lg shadow-md transition"
              >
                Edit
              </button>
            )}
            <Link
              href="/boards"
              className="bg-gradient-to-tr from-indigo-500 to-blue-400 hover:from-indigo-600 hover:to-blue-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition"
            >
              All Boards
            </Link>
          </div>
        </div>
      </header>
      {/* Canvas area */}
      <div className="flex-1 overflow-hidden animate-fadeIn">
        <BoardCanvas boardId={boardId} />
      </div>
    </div>
  );
}
