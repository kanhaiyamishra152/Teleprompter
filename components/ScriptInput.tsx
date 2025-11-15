
import React, { useState, useCallback, ChangeEvent } from 'react';
import { UploadIcon } from './icons';

interface ScriptInputProps {
  onScriptSubmit: (script: string) => void;
}

const ScriptInput: React.FC<ScriptInputProps> = ({ onScriptSubmit }) => {
  const [script, setScript] = useState('');

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setScript(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleSubmit = () => {
    if (script.trim()) {
      onScriptSubmit(script.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">Teleprompter Studio</h1>
          <p className="mt-3 text-gray-300">Enter your script below or upload a text file to begin.</p>
        </div>

        <div className="space-y-6">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste or type your script here..."
            className="w-full h-64 p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300 resize-none text-gray-200"
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <label htmlFor="file-upload" className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300 font-semibold">
              <UploadIcon className="w-5 h-5" />
              Upload .txt file
            </label>
            <input id="file-upload" type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        <div>
          <button
            onClick={handleSubmit}
            disabled={!script.trim()}
            className="w-full py-4 px-6 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50 text-lg"
          >
            Start Teleprompter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptInput;
