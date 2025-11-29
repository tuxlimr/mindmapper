import React, { useState, useCallback } from 'react';
import { UploadedFile, MindMapData, LoadingState } from './types';
import FileUpload from './components/FileUpload';
import MindMapCanvas from './components/MindMapCanvas';
import { generateMindMapFromContent } from './services/geminiService';

const App: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (uploadedFile: UploadedFile) => {
    setFile(uploadedFile);
    setStatus('generating');
    setErrorMsg(null);
    setMindMapData(null);

    try {
      const data = await generateMindMapFromContent(uploadedFile);
      setMindMapData(data);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  }, []);

  const handleReset = () => {
    setFile(null);
    setMindMapData(null);
    setStatus('idle');
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">MindMapper <span className="text-blue-600">AI</span></h1>
        </div>
        
        {mindMapData && (
          <button 
            onClick={handleReset}
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>New Map</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* State: Idle / Upload */}
        {status === 'idle' && (
          <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="max-w-2xl text-center space-y-6">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                Visualize your thoughts.
              </h2>
              <p className="text-lg text-slate-600 max-w-lg mx-auto">
                Upload notes, articles, or code files. Gemini 2.5 Flash will instantly structure them into an interactive mind map.
              </p>
              
              <div className="mt-8">
                 <FileUpload onFileSelect={handleFileSelect} disabled={false} />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mt-12 text-sm text-slate-500">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <span className="block font-semibold text-slate-900 mb-1">Text Analysis</span>
                  Summarize articles & notes
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <span className="block font-semibold text-slate-900 mb-1">Code Structure</span>
                  Visualize legacy codebases
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <span className="block font-semibold text-slate-900 mb-1">Image Vision</span>
                  Convert whiteboard photos
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State: Generating */}
        {status === 'generating' && (
           <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-slate-900">Generating Mind Map...</p>
                  <p className="text-slate-500 mt-1">Analyzing {file?.name}</p>
                </div>
              </div>
           </div>
        )}

        {/* State: Error */}
        {status === 'error' && (
          <div className="h-full flex flex-col items-center justify-center p-6">
             <div className="max-w-md bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Generation Failed</h3>
                <p className="text-red-700 mb-6">{errorMsg}</p>
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Try Again
                </button>
             </div>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && mindMapData && (
          <div className="w-full h-full animate-fade-in">
             <MindMapCanvas data={mindMapData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;