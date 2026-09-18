import React from 'react';
import './Panels.css';
import daddCoin from "/src/assets/daddcoin.webp"
interface PlayerPanelProps {
  score: number;
  isWinning: boolean;
  roundWon: boolean;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ score, isWinning, roundWon }) => {
  return (
    <div className={`player-panel ${isWinning ? 'winning' : ''} ${roundWon ? 'celebrate' : ''}`}>
      <div className="avatar-wrapper player-avatar">
        <div className="avatar-emoji">🤖</div>
        {roundWon && <div className="star-burst">⭐</div>}
      </div>
      <div className="score-badge">
        <img src={daddCoin} alt="coin" className="coin-icon" />
        <span className="score-value">{score}</span>
      </div>
    </div>
  );
};

export default PlayerPanel;
