self.onmessage = (e) => {
  const { action, payload } = e.data;

  if (action === 'START') {
    const { durationSeconds, initialRemaining } = payload;
    
    // If we are resuming from a specific remaining time (e.g. page reload)
    const startDuration = initialRemaining !== undefined ? initialRemaining : durationSeconds;
    
    const now = Date.now();
    const endTime = now + startDuration * 1000;
    
    if (self.timerId) clearInterval(self.timerId);
    
    self.timerId = setInterval(() => {
      const currentNow = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - currentNow) / 1000));
      
      self.postMessage({ type: 'TICK', remaining });
      
      if (remaining <= 0) {
        clearInterval(self.timerId);
        self.postMessage({ type: 'COMPLETE' });
      }
    }, 200); // Check more frequently than 1s to be responsive, but only emit seconds if needed or emit sub-seconds? 
    // Plan says "Accurate to the second".
    // Let's stick to 1s tick for UI, or just send remaining.
  }

  if (action === 'STOP') {
    if (self.timerId) clearInterval(self.timerId);
  }
};
