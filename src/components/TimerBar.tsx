import React from 'react';
import './TimerBar.css';

interface TimerBarProps {
  seconds: number;
  maxSeconds: number;
  active: boolean;
}

const TimerBar: React.FC<TimerBarProps> = ({ seconds, maxSeconds, active }) => {
  const pct = Math.max(0, Math.min(100, (seconds / maxSeconds) * 100));
  const isUrgent = seconds <= 1;

  return (
    <div className={`timer-bar-container ${active ? 'active' : ''}`}>
      <div
        className={`timer-bar-fill ${isUrgent ? 'urgent' : ''}`}
        style={{ width: `${pct}%` }}
      />
      {active && (
        <span className={`timer-label ${isUrgent ? 'urgent' : ''}`}>
          {seconds}s
        </span>
      )}
    </div>
  );
};

export default TimerBar;
