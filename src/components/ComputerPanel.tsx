import React from 'react';
import './Panels.css';

interface ComputerPanelProps {
  score: number;
  isThinking: boolean;
  roundWon: boolean;
}

const ComputerPanel: React.FC<ComputerPanelProps> = ({ score, isThinking, roundWon }) => {
  return (
    <div className={`computer-panel ${roundWon ? 'celebrate' : ''}`}>
      <div className={`avatar-wrapper computer-avatar ${isThinking ? 'thinking' : ''}`}>
        <div className="avatar-emoji">🐶</div>
        {isThinking && <div className="thinking-dots"><span>.</span><span>.</span><span>.</span></div>}
        {roundWon && <div className="star-burst">⭐</div>}
      </div>
      <div className="score-badge">
        <span className="score-value">{score}</span>
        <img src="/src/assets/daddcoin.webp" alt="coin" className="coin-icon" />
      </div>
    </div>
  );
};

export default ComputerPanel;
