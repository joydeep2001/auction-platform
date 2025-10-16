import { useState, useEffect } from 'react';

export function useCountdown(endTs) {
  const [left, setLeft] = useState(() => Math.max(0, endTs - Date.now()));
  
  useEffect(() => {
    const id = setInterval(() => {
      setLeft(Math.max(0, endTs - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [endTs]);
  
  const secs = Math.floor(left / 1000);
  return {
    ms: left,
    secs,
    minutes: Math.floor(secs / 60),
    seconds: secs % 60,
    hours: Math.floor(secs / 3600),
    isWarning: secs <= 3600 && secs > 900, // < 1 hour
    isCritical: secs <= 900 // < 15 minutes
  };
}