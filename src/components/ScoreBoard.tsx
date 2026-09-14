import React from 'react';
import { playWinSound, playLoseSound } from '../utils/tts';
import './ScoreBoard.css';

import { FinalStats } from '../services/api';

interface ScoreBoardProps {
  playerScore: number;
  computerScore: number;
  totalQuestions: number;
  finalStats: FinalStats | null;
  onRestart: () => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  playerScore,
  computerScore,
  totalQuestions,
  finalStats,
  onRestart,
}) => {
  const playerWon = playerScore > computerScore;
  const tied = playerScore === computerScore;

  React.useEffect(() => {
    if (playerWon) playWinSound();
    else if (!tied) playLoseSound();
  }, []);

  let resultEmoji = '🤝';
  let resultMsg = "It's a tie!";
  let resultClass = 'tie';

  if (playerWon) {
    resultEmoji = '🎉';
    resultMsg = 'You Win! 🏆';
    resultClass = 'win';
  } else if (!tied) {
    resultEmoji = '🤖';
    resultMsg = 'CPU Wins!';
    resultClass = 'lose';
  }

  return (
    <div className="scoreboard-overlay">
      <div className={`scoreboard-card ${resultClass}`}>
        <div className="result-emoji">{resultEmoji}</div>
        <h2 className="result-title">{resultMsg}</h2>

        <div className="final-scores">
          <div className="final-score-item player-score-item">
            <span className="fs-avatar">🧒</span>
            <span className="fs-name">You</span>
            <span className="fs-score">{playerScore}</span>
            <span className="fs-total">/ {totalQuestions}</span>
          </div>
          <div className="vs-divider">VS</div>
          <div className="final-score-item cpu-score-item">
            <span className="fs-avatar">🤖</span>
            <span className="fs-name">CPU</span>
            <span className="fs-score">{computerScore}</span>
            <span className="fs-total">/ {totalQuestions}</span>
          </div>
        </div>

        {finalStats && (
          <div className="api-rewards">
            <h3 className="rewards-title">Session Rewards</h3>
            <div className="rewards-grid">
              <div className="reward-item">
                <span className="reward-icon">⭐️</span>
                <span className="reward-value">{finalStats.stars}</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🪙</span>
                <span className="reward-value">{finalStats.coins}</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🚀</span>
                <span className="reward-value">+{finalStats.experience} XP</span>
              </div>
            </div>
          </div>
        )}

        <button className="play-again-btn" onClick={onRestart}>
          🔄 Play Again
        </button>
      </div>
    </div>
  );
};

export default ScoreBoard;
