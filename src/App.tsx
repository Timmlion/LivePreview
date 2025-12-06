import { useState, useRef, useEffect, useCallback } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import clsx from 'clsx'; // Import clsx

function App() {
  const [code, setCode] = useState<string>(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Generated Code</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f0f0f0; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Hello from LivePreview!</h1>
  <p>Your AI-generated code will appear here.</p>
</body>
</html>`);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop'); // New state for preview mode
  const [scale, setScale] = useState<number>(1); // State for iframe scaling
  const [showCoffeeModal, setShowCoffeeModal] = useState(false); // Modal visibility state
  const [dontShowAgain, setDontShowAgain] = useState(false); // Checkbox state

  const defaultBoilerplate = (innerHtml: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <style>
    /* Default CSS Reset / Basic Styles */
    body { margin: 0; font-family: sans-serif; }
  </style>
</head>
<body>
  ${innerHtml}
</body>
</html>`;

  const renderCode = useCallback(() => {
    if (iframeRef.current) {
      const document = iframeRef.current.contentDocument;
      if (document) {
        document.open();
        // Simple "Smart Paste" logic: if code doesn't contain <html>, wrap it.
        const finalCode = code.includes('<html') || code.includes('<HTML')
          ? code
          : defaultBoilerplate(code);
        document.write(finalCode);
        document.close();
      }
    }
  }, [code]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = window.setTimeout(() => {
      renderCode();
    }, 1000); // 1000ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [code, renderCode]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleDownload = useCallback(() => {
    // 1. Trigger Download
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 2. Show Coffee Modal (if not suppressed)
    const isSuppressed = localStorage.getItem('livepreview_suppress_coffee_modal');
    if (!isSuppressed) {
        setShowCoffeeModal(true);
    }
  }, [code]);

  const closeCoffeeModal = () => {
    if (dontShowAgain) {
        localStorage.setItem('livepreview_suppress_coffee_modal', 'true');
    }
    setShowCoffeeModal(false);
  };

  const handleDesktopClick = useCallback(() => {
    setPreviewMode('desktop');
    setScale(1); // Reset scale on mode switch
  }, []);

  const handleMobileClick = useCallback(() => {
    setPreviewMode('mobile');
    setScale(1); // Reset scale on mode switch
  }, []);

  const iframeWrapperClasses = clsx(
    'w-full h-full bg-white', // Base styles
    {
      'flex justify-center items-center overflow-auto p-4': previewMode === 'mobile', // Mobile specific: centering + padding
      'relative overflow-hidden': previewMode === 'desktop', // Desktop specific: relative for absolute child
    }
  );

  const iframeClasses = clsx(
    'bg-white transition-transform duration-75 ease-linear', // Faster, more immediate response
    {
      'shadow-2xl rounded-lg border-4 border-gray-800': previewMode === 'mobile', // Mobile styling
      'origin-top-left absolute top-0 left-0': previewMode === 'desktop', // Desktop styling: absolute positioning
    }
  );

  // Dynamic styles for scaling logic
  const iframeStyle = previewMode === 'desktop' ? {
    width: `${100 / scale}%`,
    height: `${100 / scale}%`,
    transform: `scale(${scale})`,
  } : {
    width: '375px',
    height: '667px',
    // No scale for mobile
  };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <header className="h-16 bg-[#1e1e1e] text-[#E0E0E0] flex items-center px-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          LivePreview
          <span className="text-sm text-gray-500 flex items-center gap-1">
            Open Source 
            <a href="https://github.com/Timmlion/LivePreview" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF6B00] hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.44-.78-3.46 0 0-1.09 0-3 1.5a12.1 12.1 0 0 0-6 0c-1.92-1.5-3-1.5-3-1.5-.5.92-.81 2.12-.78 3.46 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-5-2"/></svg>
            </a>
          </span>
        </h1>
        
        <div className="ml-auto flex items-center space-x-4">
          {/* MicroTools Button */}
          <button 
            className="text-gray-400 border border-gray-600 px-3 py-1 rounded flex items-center gap-1"
            onClick={() => window.open('https://tools.adamsiwek.pl', '_blank')}
          >
            <span className="text-sm">✨</span> <span className="font-medium">Part of MicroTools</span>
          </button>
          
          {/* Buy me a coffee button */}
          <button 
            className="text-gray-400 border border-gray-600 px-3 py-1 rounded"
            onClick={() => window.open('https://ko-fi.com/adamsiwek', '_blank')}
          >
            ☕ Buy me a coffee
          </button>
          {/* Download button */}
          <button className="bg-[#FF6B00] text-white px-3 py-1 rounded" onClick={handleDownload}>Download .html</button>
        </div>
      </header>

      {/* Workspace */}
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={35} minSize={20}>
          {/* Editor Panel */}
          <Editor
            height="100%"
            language="html"
            theme="vs-dark"
            defaultValue={code}
            options={{
              minimap: { enabled: false },
            }}
            onChange={handleEditorChange}
          />
        </Panel>
        <PanelResizeHandle className="w-2 bg-[#333333] hover:bg-[#FF6B00] transition-colors duration-200 cursor-ew-resize" />
        <Panel defaultSize={65} minSize={30}>
          {/* Preview Panel */}
          <div className="flex flex-col h-full w-full bg-gray-700"> {/* Outer container for toolbar and iframe */}
            {/* Toolbar */}
            <div className="h-10 bg-[#1e1e1e] flex items-center justify-center space-x-4 text-gray-300 relative">
              <button
                className={clsx(
                  "px-3 py-1 rounded text-sm",
                  previewMode === 'desktop' ? "bg-[#FF6B00] text-white" : "hover:bg-gray-600"
                )}
                onClick={handleDesktopClick}
              >
                🖥️ Desktop
              </button>
              <button
                className={clsx(
                  "px-3 py-1 rounded text-sm",
                  previewMode === 'mobile' ? "bg-[#FF6B00] text-white" : "hover:bg-gray-600"
                )}
                onClick={handleMobileClick}
              >
                📱 Mobile
              </button>
              
              {/* Zoom Control - Only visible on Desktop */}
              {previewMode === 'desktop' && (
                <div className="flex items-center gap-2 border-l border-gray-600 pl-4 ml-2 absolute right-4">
                  <span className="text-xs text-gray-400 w-16 text-right">{Math.round(scale * 100)}%</span>
                  <input
                      type="range"
                      min="0.25"
                      max="1"
                      step="0.01"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-24 accent-[#FF6B00] cursor-pointer"
                      title="Zoom Preview"
                  />
                </div>
              )}
            </div>
            {/* Iframe Area */}
            <div className={iframeWrapperClasses}>
              <iframe
                ref={iframeRef}
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                className={iframeClasses}
                style={iframeStyle}
                title="Live Preview"
              />
            </div>
          </div>
        </Panel>
      </PanelGroup>

      {/* Coffee Modal */}
      {showCoffeeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-br from-[#FF6B00] to-[#FF9E00] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                    <span className="text-6xl drop-shadow-lg transform hover:scale-110 transition-transform duration-300 cursor-default">☕</span>
                </div>
                {/* Content */}
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Enjoying LivePreview?</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        If this tool saved you some time, please consider buying me a coffee to support future updates!
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => window.open('https://ko-fi.com/adamsiwek', '_blank')}
                            className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                            <span>☕</span> Buy me a coffee
                        </button>
                        <button 
                            onClick={closeCoffeeModal}
                            className="w-full bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>

                    {/* Checkbox */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition-colors">
                        <input 
                            type="checkbox" 
                            id="dont-show"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="rounded bg-gray-800 border-gray-600 text-[#FF6B00] focus:ring-[#FF6B00] cursor-pointer"
                        />
                        <label htmlFor="dont-show" className="cursor-pointer select-none">Don't show this again</label>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

export default App

