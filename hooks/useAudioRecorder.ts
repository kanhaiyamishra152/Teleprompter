
import { useState, useRef, useCallback } from 'react';

type RecordingStatus = 'inactive' | 'recording' | 'stopped';

export const useAudioRecorder = () => {
    const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('inactive');
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        if (recordingStatus === 'recording') return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setRecordingStatus('recording');
            setAudioURL(null);
            audioChunksRef.current = [];

            const options = { mimeType: 'audio/webm;codecs=opus' };
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);
                setRecordingStatus('stopped');
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
        } catch (err) {
            console.error("Error starting recording:", err);
            setRecordingStatus('inactive');
        }
    }, [recordingStatus]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    return { recordingStatus, audioURL, startRecording, stopRecording };
};
