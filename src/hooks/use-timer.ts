import { useEffect, useRef, useState, useCallback } from 'react';

export function useTimer(initialDuration: number, onComplete?: () => void) {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    workerRef.current = new Worker('/timer.worker.js');
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'TICK') {
        setTimeRemaining(e.data.remaining);
      } else if (e.data.type === 'COMPLETE') {
        setIsRunning(false);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const prevDuration = useRef(initialDuration);

  // Update time if initialDuration changes and we are not running
  useEffect(() => {
      if (!isRunning && prevDuration.current !== initialDuration) {
          setTimeRemaining(initialDuration);
          prevDuration.current = initialDuration;
      }
  }, [initialDuration, isRunning]);

  const start = useCallback((duration?: number) => {
    if (workerRef.current) {
      setIsRunning(true);
      workerRef.current.postMessage({ 
        action: 'START', 
        payload: { durationSeconds: duration !== undefined ? duration : timeRemaining } 
      });
    }
  }, [timeRemaining]);
  
  const pause = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ action: 'STOP' });
      setIsRunning(false);
    }
  }, []);

  const resume = useCallback(() => {
      if (workerRef.current) {
          setIsRunning(true);
          workerRef.current.postMessage({
              action: 'START',
              payload: { durationSeconds: timeRemaining, initialRemaining: timeRemaining }
          })
      }
  }, [timeRemaining])
  
  const setTime = useCallback((time: number) => {
      setTimeRemaining(time);
  }, []);

  return { timeRemaining, isRunning, start, pause, resume, setTime };
}
