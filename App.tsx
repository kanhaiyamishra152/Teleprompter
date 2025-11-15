
import React, { useState, useCallback } from 'react';
import ScriptInput from './components/ScriptInput';
import Teleprompter from './components/Teleprompter';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SCRIPT_INPUT);
  const [script, setScript] = useState<string>('');

  const handleScriptSubmit = useCallback((submittedScript: string) => {
    setScript(submittedScript);
    setAppState(AppState.TELEPROMPTER);
  }, []);

  const handleBackToInput = useCallback(() => {
    setAppState(AppState.SCRIPT_INPUT);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.SCRIPT_INPUT:
        return <ScriptInput onScriptSubmit={handleScriptSubmit} />;
      case AppState.TELEPROMPTER:
        return <Teleprompter script={script} onBack={handleBackToInput} />;
      default:
        return <ScriptInput onScriptSubmit={handleScriptSubmit} />;
    }
  };

  return (
    <main>
      {renderContent()}
    </main>
  );
};

export default App;
