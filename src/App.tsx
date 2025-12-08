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
    body { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh; 
      margin: 0; 
      background-color: #111; 
      color: #e0e0e0;
      text-align: center;
    }
    h1 { 
      color: #fff; 
      margin-bottom: 1rem;
      font-weight: 600;
    }
    p {
      color: #888;
      font-size: 1.1rem;
      max-width: 600px;
      line-height: 1.6;
    }
    span.highlight {
      color: #FF6B00;
    }
  </style>
</head>
<body>
  <h1>Hello from <span class="highlight">LivePreview!</span></h1>
  <p>Paste your HTML, CSS, or JS here to test it instantly.</p>
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
    body { 
      margin: 0; 
      font-family: 'Inter', system-ui, sans-serif; 
      background-color: #111; 
      color: #e0e0e0; 
      min-height: 100vh;
    }
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
    'w-full h-full bg-gray-800', // Base styles - Changed from bg-white to bg-gray-800 for dark mode compatibility
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
    <div className="flex flex-col min-h-screen bg-[#111] text-[#E0E0E0] font-sans">
      {/* Global Header - Unified Controls */}
      <header className="h-14 border-b border-[#333] flex items-center px-4 bg-[#111] shrink-0 gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-4">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">LivePreview</span>
          <span className="text-xs text-gray-600 px-1.5 py-0.5 rounded border border-gray-800">beta</span>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-[#333]"></div>

        {/* View Controls (Desktop/Mobile) */}
        <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-[#333]">
          <button
            onClick={handleDesktopClick}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-2",
              previewMode === 'desktop' ? "bg-[#333] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
            Desktop
          </button>
          <button
            onClick={handleMobileClick}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-2",
              previewMode === 'mobile' ? "bg-[#333] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
            Mobile
          </button>
        </div>

        {/* Zoom Control - Only visible on Desktop */}
        {previewMode === 'desktop' && (
          <div className="flex items-center gap-3 ml-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Zoom</span>
            <input
              type="range"
              min="0.25"
              max="1"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]" // Simple custom styling
              title={`Zoom: ${Math.round(scale * 100)}%`}
            />
            <span className="text-xs text-gray-400 w-8 text-right font-mono">{Math.round(scale * 100)}%</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <a href="https://github.com/Timmlion/LivePreview" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-white transition-colors" title="View Source">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.44-.78-3.46 0 0-1.09 0-3 1.5a12.1 12.1 0 0 0-6 0c-1.92-1.5-3-1.5-3-1.5-.5.92-.81 2.12-.78 3.46 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-5-2" /></svg>
          </a>
          <button
            className="p-2 text-gray-500 hover:text-[#FFDD00] transition-colors"
            onClick={() => setShowCoffeeModal(true)}
            title="Buy me a coffee"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" x2="6" y1="1" y2="4" /><line x1="10" x2="10" y1="1" y2="4" /><line x1="14" x2="14" y1="1" y2="4" /></svg>
          </button>

          <button
            className="bg-[#FF6B00] hover:bg-[#e66000] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            onClick={handleDownload}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
            Download
          </button>
        </div>
      </header>

      {/* Workspace */}
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={40} minSize={20} className="bg-[#1e1e1e]">
          {/* Editor Panel */}
          <div className="flex flex-col h-full border-r border-[#333]">
            {/* Minimal Label if needed, or just pure editor space */}
            <div className="h-6 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-3 justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">HTML / CSS / JS</span>
            </div>
            <div className="flex-grow relative">
              <Editor
                height="100%"
                language="html"
                theme="vs-dark"
                defaultValue={code}
                options={{
                  minimap: { enabled: false },
                  padding: { top: 16 },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
                onChange={handleEditorChange}
              />
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-[1px] bg-[#333] hover:bg-[#FF6B00] transition-colors duration-200" />

        <Panel defaultSize={60} minSize={30}>
          {/* Preview Panel */}
          <div className="flex flex-col h-full w-full bg-[#0d0d0d] relative"> {/* Dark implementation preview background */}

            {/* Iframe Container */}
            <div className={iframeWrapperClasses}>
              <iframe
                ref={iframeRef}
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                className={iframeClasses}
                style={iframeStyle}
                title="Live Preview"
              />
            </div>
            {/* Helper Text for "Empty" state could go here if code is empty */}
          </div>
        </Panel>
      </PanelGroup>

      {/* Coffee Modal - Kept the same structural logic, just slight overlay update */}
      {showCoffeeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Banner */}
            <div className="h-28 bg-[#2a2a2a] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 to-transparent"></div>
              <span className="text-5xl drop-shadow-md cursor-default">☕</span>
            </div>
            {/* Content */}
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-white mb-2">Buy me a coffee?</h2>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                If LivePreview helped you build something cool, consider supporting the project!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.open('https://ko-fi.com/adamsiwek', '_blank')}
                  className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <span>Yes, I'd love to!</span>
                </button>
                <button
                  onClick={closeCoffeeModal}
                  className="w-full text-gray-500 hover:text-white text-sm py-2 px-4 transition-colors"
                >
                  No thanks, maybe later
                </button>
              </div>

              {/* Checkbox */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  id="dont-show"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-600 text-[#FF6B00] focus:ring-[#FF6B00] cursor-pointer"
                />
                <label htmlFor="dont-show" className="cursor-pointer select-none">Don't show for a while</label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

