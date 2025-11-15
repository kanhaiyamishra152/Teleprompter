
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { MicIcon, StopIcon, DownloadIcon, BackIcon } from './icons';

interface TeleprompterProps {
  script: string;
  onBack: () => void;
}

const Teleprompter: React.FC<TeleprompterProps> = ({ script, onBack }) => {
  const words = useMemo(() => script.split(/\s+/).filter(Boolean), [script]);
  const [scrollSpeed, setScrollSpeed] = useState(2); // words per second
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const { recordingStatus, audioURL, startRecording, stopRecording } = useAudioRecorder();
  const teleprompterRef = useRef<HTMLDivElement>(null);

  const handleStop = useCallback(() => {
    stopRecording();
    setIsScrolling(false);
  }, [stopRecording]);

  const handleStart = () => {
    startRecording();
    setCurrentIndex(0);
    setIsScrolling(true);
  };
  
  useEffect(() => {
    if (!isScrolling) return;

    const interval = setInterval(() => {
        setCurrentIndex(prev => {
            if (prev >= words.length - 1) {
                handleStop();
                return prev;
            }
            return prev + 1;
        });
    }, 1000 / scrollSpeed);

    return () => clearInterval(interval);
  }, [isScrolling, scrollSpeed, words.length, handleStop]);
  
  useEffect(() => {
    if(teleprompterRef.current){
        const activeWord = teleprompterRef.current.querySelector('.active-word');
        if(activeWord) {
            activeWord.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [currentIndex]);
  
  const wordsToDisplay = useMemo(() => {
    return words.map((word, index) => (
      <span
        key={index}
        className={`transition-colors duration-300 ${index === currentIndex ? 'active-word text-cyan-400 scale-110 inline-block' : 'text-gray-400'}`}
      >
        {word}{' '}
      </span>
    ));
  }, [words, currentIndex]);

  const canRecord = recordingStatus === 'inactive' || recordingStatus === 'stopped';

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col p-4 overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <BackIcon className="w-5 h-5"/>
            Edit Script
        </button>
      </div>

      <div ref={teleprompterRef} className="flex-grow flex items-center justify-center overflow-hidden my-4">
          <div className="text-4xl md:text-5xl lg:text-6xl font-serif leading-relaxed text-center p-8 max-h-[70vh] overflow-y-auto">
              { isScrolling || currentIndex !== -1 ? wordsToDisplay : <p className="text-gray-500">Press record to begin</p>}
          </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm p-4 rounded-t-2xl shadow-lg z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-4">
            {audioURL && (
              <a 
                href={audioURL} 
                download="teleprompter_recording.mp3"
                className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 font-semibold"
              >
                <DownloadIcon className="w-6 h-6"/>
                Download MP3
              </a>
            )}
          </div>
          
          <div className="flex items-center justify-center">
            {canRecord ? (
                <button onClick={handleStart} className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-transform transform hover:scale-110 shadow-lg">
                  <MicIcon className="w-8 h-8 text-white"/>
                </button>
            ) : (
                <button onClick={handleStop} className="p-4 bg-cyan-600 rounded-full hover:bg-cyan-700 transition-transform transform hover:scale-110 shadow-lg animate-pulse">
                  <StopIcon className="w-8 h-8 text-white"/>
                </button>
            )}
          </div>
          
          <div className="w-full md:w-1/3 flex flex-col items-center md:items-end">
            <label htmlFor="scroll-speed" className="text-sm font-medium text-gray-300 mb-2">
              Speed: {scrollSpeed.toFixed(1)} words/sec
            </label>
            <input
              id="scroll-speed"
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
              className="w-full max-w-xs h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              disabled={recordingStatus === 'recording'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teleprompter;
