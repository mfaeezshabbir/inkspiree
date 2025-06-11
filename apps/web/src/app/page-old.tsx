"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Stage, Layer, Rect, Text } from "@/components/KonvaComponents";

export default function Home() {
  const stageRef = useRef<any>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const stageSize = { width: 600, height: 320 };

  // Pan and zoom handlers
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = stageScale;
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };
  const handleDragEnd = (e: any) => {
    setStagePos({ x: e.target.x(), y: e.target.y() });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-200 via-white to-blue-200 p-0">
      <section className="w-full flex flex-col items-center justify-center py-24 px-4">
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-indigo-100 max-w-4xl mx-auto px-10 py-14 flex flex-col items-center animate-fadeIn">
          <h1 className="text-6xl md:text-7xl font-extrabold text-center bg-gradient-to-tr from-indigo-800 to-blue-500 bg-clip-text text-transparent mb-4 animate-slideIn tracking-tight drop-shadow-lg">
            Inkspiree
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-700 text-center mb-8 font-medium animate-fadeIn">
            AI-powered Infinite Canvas for Brainstorming & Collaboration
          </h2>
          <div className="flex gap-4 mb-12 animate-scaleIn">
            <Link 
              href="/boards" 
              className="bg-gradient-to-tr from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold py-3 px-10 rounded-xl shadow-xl transition-all text-lg"
            >
              View Your Boards
            </Link>
            <a
              href="https://github.com/inkspiree-ai"
              target="_blank"
              rel="noopener"
              className="bg-white/80 border border-indigo-200 text-indigo-600 font-bold py-3 px-10 rounded-xl shadow hover:bg-indigo-50 transition-all text-lg"
            >
              GitHub
            </a>
          </div>
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-10 mb-8">
            <div className="flex-1 flex items-center justify-center">
              <div className="rounded-2xl shadow-lg border border-indigo-100 bg-white/80 p-4">
                <Stage
                  ref={stageRef}
                  width={stageSize.width}
                  height={stageSize.height}
                  scaleX={stageScale}
                  scaleY={stageScale}
                  x={stagePos.x}
                  y={stagePos.y}
                  draggable
                  onWheel={handleWheel}
                  onDragEnd={handleDragEnd}
                  style={{ background: '#f8fafc', borderRadius: 16, boxShadow: '0 2px 16px #0001' }}
                >
                  <Layer>
                    {/* Example shapes */}
                    <Rect x={100} y={100} width={200} height={120} fill="#fffa65" shadowBlur={10} cornerRadius={16} />
                    <Text x={120} y={130} text="Sticky Note Demo" fontSize={22} fill="#333" fontStyle="bold" />
                    <Rect x={400} y={200} width={150} height={150} fill="#a29bfe" shadowBlur={10} cornerRadius={12} />
                    <Text x={420} y={260} text="Shape Demo" fontSize={20} fill="#333" fontStyle="bold" />
                  </Layer>
                </Stage>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-indigo-700">Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li className="bg-white/80 p-5 rounded-xl shadow border border-indigo-50 font-medium text-lg flex items-center gap-2">
                  <span>🖼️</span> Infinite Canvas
                </li>
                <li className="bg-white/80 p-5 rounded-xl shadow border border-indigo-50 font-medium text-lg flex items-center gap-2">
                  <span>🧠</span> AI Assistant
                </li>
                <li className="bg-white/80 p-5 rounded-xl shadow border border-indigo-50 font-medium text-lg flex items-center gap-2">
                  <span>🗯️</span> Smart Sticky Notes
                </li>
                <li className="bg-white/80 p-5 rounded-xl shadow border border-indigo-50 font-medium text-lg flex items-center gap-2">
                  <span>🤝</span> Collaboration
                </li>
                <li className="bg-white/80 p-5 rounded-xl shadow border border-indigo-50 font-medium text-lg flex items-center gap-2">
                  <span>✍️</span> Storyboarding
                </li>
                <li className="bg-white/80 p-5 rounded-xl shadow border border-indigo-50 font-medium text-lg flex items-center gap-2">
                  <span>📦</span> Export Options
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <footer className="w-full text-center py-6 text-xs text-gray-400 bg-white/60 border-t border-gray-200 mt-8 rounded-t-2xl shadow-inner">
        <span>AI-powered brainstorming & storyboarding &copy; {new Date().getFullYear()} Inkspiree</span>
      </footer>
    </div>
  );
}
