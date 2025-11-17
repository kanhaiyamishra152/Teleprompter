import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { MicIcon, StopIcon, DownloadIcon, BackIcon } from './icons';

interface TeleprompterProps {
  script: string;
  onBack: () => void;
}

const Teleprompter: React.FC<TeleprompterProps> = ({ script, onBack }) => {
  const words = useMemo(() => script.split(/\s+/).filter(Boolean), [script]);
  const [scrollSpeed, setScrollSpeed] = useState(3); // words per second
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isScrolling, setIsScrolling] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const { recordingStatus, audioURL, startRecording, stopRecording } = useAudioRecorder();
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const elapsedTimeIntervalRef = useRef<number | null>(null);

  const handleStop = useCallback(() => {
    stopRecording();
    setIsScrolling(false);
    if (elapsedTimeIntervalRef.current) {
        clearInterval(elapsedTimeIntervalRef.current);
        elapsedTimeIntervalRef.current = null;
    }
  }, [stopRecording]);

  const handleStart = () => {
    setCurrentIndex(-1);
    setElapsedTime(0);
    if (elapsedTimeIntervalRef.current) {
        clearInterval(elapsedTimeIntervalRef.current);
        elapsedTimeIntervalRef.current = null;
    }
    setCountdown(3);
  };
  
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
      return () => clearTimeout(timerId);
    } else { // countdown === 0
      startRecording();
      setCurrentIndex(0);
      setIsScrolling(true);
      elapsedTimeIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      setCountdown(null);
    }
  }, [countdown, startRecording]);

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
        className={`transition-all duration-200 ${index === currentIndex ? 'active-word text-cyan-300 scale-110 font-bold' : 'text-gray-500'}`}
      >
        {word}{' '}
      </span>
    ));
  }, [words, currentIndex]);

  const canRecord = recordingStatus === 'inactive' || recordingStatus === 'stopped';

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={countdown !== null || recordingStatus === 'recording'}
        >
            <BackIcon className="w-5 h-5"/>
            Edit Script
        </button>
      </div>
      
      {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30" aria-live="assertive">
              <span key={countdown} className="text-9xl font-bold text-white animate-pulse">{countdown}</span>
          </div>
      )}

      <div 
        ref={teleprompterRef} 
        className="flex-grow flex items-center justify-center text-center p-8 md:p-16 overflow-hidden"
      >
        <p className="text-3xl md:text-5xl lg:text-6xl leading-relaxed font-serif max-h-full overflow-y-auto">
            {wordsToDisplay}
        </p>
      </div>
      
      <div className="w-full bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 mt-auto z-10 shadow-lg">
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full md:w-1/3 text-sm">
            <span>Slow</span>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={countdown !== null || recordingStatus === 'recording'}
              aria-label="Scroll speed"
            />
            <span>Fast</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 order-first md:order-none">
            <div className="h-7 flex items-center" aria-live="polite">
                {recordingStatus === 'recording' && (
                <div className="text-lg font-mono tracking-wider text-cyan-400" aria-label={`Elapsed time: ${formatTime(elapsedTime)}`}>
                    {formatTime(elapsedTime)}
                </div>
                )}
            </div>
            
            {canRecord ? (
              <button onClick={handleStart} disabled={countdown !== null} className="p-4 bg-red-600 rounded-full hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50" aria-label="Start recording">
                <MicIcon className="w-8 h-8 text-white" />
              </button>
            ) : (
              <button onClick={handleStop} className="p-4 bg-gray-600 rounded-full hover:bg-gray-500 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50" aria-label="Stop recording">
                <StopIcon className="w-8 h-8 text-white" />
              </button>
            )}
          </div>

          <div className="w-full md:w-1/3 flex justify-end">
            <div className="h-10"> 
              {audioURL && canRecord && (
                <a
                  href={audioURL}
                  download="teleprompter-recording.webm"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors font-semibold animate-pulse"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download Audio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teleprompter;
