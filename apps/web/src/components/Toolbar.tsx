import { useState, useEffect, useRef } from 'react';
import { ElementType } from '@/types';

type ToolType = 'select' | 'pan' | 'sticky' | 'shape' | 'text' | 'connector' | 'image' | 'ai';
type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond' | 'arrow';

interface ToolbarProps {
  onToolChange: (tool: ToolType) => void;
  onShapeChange: (shape: ShapeType) => void;
  onAddElement: (type: ElementType) => void;
  activeTool: ToolType;
}

export default function Toolbar({ 
  onToolChange, 
  onShapeChange, 
  onAddElement,
  activeTool 
}: ToolbarProps) {
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle');
  const [showShapeOptions, setShowShapeOptions] = useState(false);
  const shapeOptionsRef = useRef<HTMLDivElement>(null);
  const shapeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Handle clicking outside of the shape options popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showShapeOptions &&
        shapeOptionsRef.current &&
        !shapeOptionsRef.current.contains(event.target as Node) &&
        shapeButtonRef.current &&
        !shapeButtonRef.current.contains(event.target as Node)
      ) {
        setShowShapeOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShapeOptions]);
  
  const handleToolClick = (tool: ToolType) => {
    onToolChange(tool);
    if (tool === 'shape') {
      setShowShapeOptions(prevState => !prevState);
    } else {
      setShowShapeOptions(false);
    }
  };
  
  const handleShapeClick = (shape: ShapeType) => {
    setActiveShape(shape);
    onShapeChange(shape);
    handleAddShape();
    setShowShapeOptions(false); // Close the shape options after selection
  };
  
  const handleAddStickyNote = () => {
    onAddElement(ElementType.STICKY_NOTE);
  };
  
  const handleAddShape = () => {
    onAddElement(ElementType.SHAPE);
  };
  
  const handleAddText = () => {
    onAddElement(ElementType.TEXT);
  };

  const handleAddConnector = () => {
    onAddElement(ElementType.CONNECTOR);
  };

  const handleAddImage = () => {
    onAddElement(ElementType.IMAGE);
  };

  // Icon color based on active state
  const getIconColor = (tool: ToolType) => {
    return activeTool === tool ? 'text-white' : 'text-slate-300';
  };

  // Background color based on active state with modern glass effects
  const getButtonBg = (tool: ToolType) => {
    if (activeTool === tool) {
      if (tool === 'ai') return 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25';
      return 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25';
    }
    return 'bg-slate-800/30 backdrop-blur-lg hover:bg-slate-700/40 border border-slate-600/30';
  };

  // Shape icon based on selected shape
  const renderShapeIcon = () => {
    switch (activeShape) {
      case 'rectangle':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'circle':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
          </svg>
        );
      case 'triangle':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 19 22 19" />
          </svg>
        );
      case 'star':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'diamond':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 22 12 12 22 2 12" />
          </svg>
        );
      case 'arrow':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 animate-fadeIn">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1 mb-0">
        Tools
      </div>
      
      {/* Tool section */}
      <div className="flex flex-col gap-2">
        <button
          className={`p-3 rounded-xl ${getButtonBg('select')} ${activeTool === 'select' ? 'text-white' : 'text-slate-300 hover:text-white'} transition-all duration-300 transform hover:scale-105 active:scale-95`}
          onClick={() => handleToolClick('select')}
          title="Select"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getIconColor('select')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </button>
        
        <button
          className={`p-3 rounded-xl ${getButtonBg('pan')} ${activeTool === 'pan' ? 'text-white' : 'text-slate-300 hover:text-white'} transition-all duration-300 transform hover:scale-105 active:scale-95`}
          onClick={() => handleToolClick('pan')}
          title="Pan"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getIconColor('pan')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      
      <div className="border-t border-slate-700/50 my-1"></div>
      
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1 mb-0">
        Elements
      </div>
      
      {/* Creation tools section */}
      <div className="flex flex-col gap-2">
        <button
          className={`p-3 rounded-xl ${getButtonBg('sticky')} ${activeTool === 'sticky' ? 'text-white' : 'text-slate-300 hover:text-white'} transition-all duration-300 flex justify-between items-center transform hover:scale-105 active:scale-95`}
          onClick={() => {
            handleToolClick('sticky');
            handleAddStickyNote();
          }}
          title="Add Sticky Note"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getIconColor('sticky')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className={`text-xs ${activeTool === 'sticky' ? 'text-white' : 'text-slate-400'}`}>Note</span>
        </button>
        
        <button
          ref={shapeButtonRef}
          className={`p-3 rounded-xl ${getButtonBg('shape')} ${activeTool === 'shape' ? 'text-white' : 'text-slate-300 hover:text-white'} relative transition-all duration-300 flex justify-between items-center transform hover:scale-105 active:scale-95`}
          onClick={() => handleToolClick('shape')}
          title="Add Shape"
        >
          {renderShapeIcon()}
          <span className={`text-xs ${activeTool === 'shape' ? 'text-white' : 'text-slate-400'}`}>Shape</span>
          
          {showShapeOptions && (
            <div 
              ref={shapeOptionsRef}
              className="absolute left-full ml-3 top-0 bg-slate-900/95 backdrop-blur-xl shadow-2xl rounded-2xl p-4 z-50 border border-slate-700/50 w-64 animate-fadeIn"
            >
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Select Shape</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`p-3 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${activeShape === 'rectangle' ? 'bg-indigo-600/50 shadow-lg border border-indigo-500/30' : 'bg-slate-800/30 hover:bg-slate-700/40 border border-slate-600/30'}`}
                  onClick={() => handleShapeClick('rectangle')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-slate-300">Rectangle</span>
                </button>
                <button
                  className={`p-3 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${activeShape === 'circle' ? 'bg-purple-600/50 shadow-lg border border-purple-500/30' : 'bg-slate-800/30 hover:bg-slate-700/40 border border-slate-600/30'}`}
                  onClick={() => handleShapeClick('circle')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-slate-300">Circle</span>
                </button>
                <button
                  className={`p-3 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${activeShape === 'triangle' ? 'bg-pink-600/50 shadow-lg border border-pink-500/30' : 'bg-slate-800/30 hover:bg-slate-700/40 border border-slate-600/30'}`}
                  onClick={() => handleShapeClick('triangle')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 19 22 19" />
                  </svg>
                  <span className="text-xs text-slate-300">Triangle</span>
                </button>
                <button
                  className={`p-3 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${activeShape === 'diamond' ? 'bg-teal-600/50 shadow-lg border border-teal-500/30' : 'bg-slate-800/30 hover:bg-slate-700/40 border border-slate-600/30'}`}
                  onClick={() => handleShapeClick('diamond')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 22 12 12 22 2 12" />
                  </svg>
                  <span className="text-xs text-slate-300">Diamond</span>
                </button>
                <button
                  className={`p-3 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${activeShape === 'star' ? 'bg-yellow-600/50 shadow-lg border border-yellow-500/30' : 'bg-slate-800/30 hover:bg-slate-700/40 border border-slate-600/30'}`}
                  onClick={() => handleShapeClick('star')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-slate-300">Star</span>
                </button>
                <button
                  className={`p-3 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${activeShape === 'arrow' ? 'bg-slate-600/50 shadow-lg border border-slate-500/30' : 'bg-slate-800/30 hover:bg-slate-700/40 border border-slate-600/30'}`}
                  onClick={() => handleShapeClick('arrow')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-slate-300">Arrow</span>
                </button>
              </div>
            </div>
          )}
        </button>
        
        <button
          className={`p-3 rounded-xl ${getButtonBg('text')} ${activeTool === 'text' ? 'text-white' : 'text-slate-300 hover:text-white'} transition-all duration-300 flex justify-between items-center transform hover:scale-105 active:scale-95`}
          onClick={() => {
            handleToolClick('text');
            handleAddText();
          }}
          title="Add Text"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getIconColor('text')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className={`text-xs ${activeTool === 'text' ? 'text-white' : 'text-slate-400'}`}>Text</span>
        </button>

        <button
          className={`p-3 rounded-xl ${getButtonBg('connector')} ${activeTool === 'connector' ? 'text-white' : 'text-slate-300 hover:text-white'} transition-all duration-300 flex justify-between items-center transform hover:scale-105 active:scale-95`}
          onClick={() => {
            handleToolClick('connector');
            handleAddConnector();
          }}
          title="Add Connector"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getIconColor('connector')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span className={`text-xs ${activeTool === 'connector' ? 'text-white' : 'text-slate-400'}`}>Connect</span>
        </button>

        <button
          className={`p-3 rounded-xl ${getButtonBg('image')} ${activeTool === 'image' ? 'text-white' : 'text-slate-300 hover:text-white'} transition-all duration-300 flex justify-between items-center transform hover:scale-105 active:scale-95`}
          onClick={() => {
            handleToolClick('image');
            handleAddImage();
          }}
          title="Add Image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getIconColor('image')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`text-xs ${activeTool === 'image' ? 'text-white' : 'text-slate-400'}`}>Image</span>
        </button>
      </div>
      
      <div className="border-t border-slate-700/50 my-1"></div>
      
      {/* AI section */}
      <div>
        <button
          className={`p-3 rounded-xl ${activeTool === 'ai' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' : 'text-purple-400 bg-slate-800/30 hover:bg-purple-900/30 border border-slate-600/30'} transition-all duration-300 flex justify-between items-center w-full transform hover:scale-105 active:scale-95`}
          onClick={() => handleToolClick('ai')}
          title="AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <span className={`text-xs ${activeTool === 'ai' ? 'text-white' : 'text-purple-400'}`}>AI Assist</span>
        </button>
      </div>
    </div>
  );
}
