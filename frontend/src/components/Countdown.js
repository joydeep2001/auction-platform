import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { Progress } from './ui/progress';

export function Countdown({ endTs, totalMs }) {
  const { hours, minutes, seconds, isWarning, isCritical } = useCountdown(endTs);
  const pct = Math.max(0, Math.min(100, ((totalMs - (hours * 3600 + minutes * 60 + seconds) * 1000) / totalMs) * 100));
  
  const cls = isCritical ? 'text-red-400' : isWarning ? 'text-amber-300' : 'text-foreground';
  
  const displayTime = hours > 0 
    ? `${hours}h ${String(minutes % 60).padStart(2, '0')}m`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  return (
    <div data-testid="auction-countdown" className="space-y-2">
      <div className="font-numeric text-xl sm:text-2xl" aria-live="polite">
        <span className={cls}>{displayTime}</span>
      </div>
      <div className="h-1 rounded-full bg-[hsl(var(--neutral-3))] overflow-hidden">
        <div 
          className="h-1 bg-amber-400 transition-[width] duration-500" 
          style={{ width: pct + '%' }}
        />
      </div>
    </div>
  );
}