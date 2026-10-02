import React from 'react';
import './GameHeader.css';

import userImg from '../assets/user1.png';
import robotImg from '../assets/user2.png';
import daddcoinImg from '../assets/daddcoin.webp';
import exitBtnImg from '../assets/ExitButton.svg';

interface GameHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  playerScore: number;
  computerScore: number;
  robotQuestionIndex: number;
  playerAnsweredCurrent: boolean;
  onExit: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
  currentQuestionIndex, 
  totalQuestions, 
  playerScore, 
  computerScore,
  robotQuestionIndex,
  playerAnsweredCurrent,
  onExit 
}) => {
  const robotProgress = totalQuestions > 0 ? Math.min(100, (robotQuestionIndex / totalQuestions) * 100) : 0;
  const playerCompleted = Math.min(totalQuestions, currentQuestionIndex + (playerAnsweredCurrent ? 1 : 0));
  const playerProgress = totalQuestions > 0 ? (playerCompleted / totalQuestions) * 100 : 0;

  return (
    <div className="game-header-container">
      <div className="game-header-content">
        {/* Spacer to balance exit button on the right */}
        <div className="gh-spacer"></div>

        <div className="gh-middle-group">
          {/* Robot / Computer */}
          <div className="gh-player gh-robot">
            <img src={robotImg} alt="Robot" className="gh-avatar" />
            <div className="gh-score-pill">
              <img src={daddcoinImg} alt="Coin" className="gh-coin" />
              <span className="gh-score">{computerScore}</span>
            </div>
          </div>

          {/* Center */}
          <div className="gh-center-text">
            <div className="gh-title">السؤال</div>
            <div className="gh-count">{currentQuestionIndex + 1}/{totalQuestions}</div>
          </div>

          {/* User / Player */}
          <div className="gh-player gh-user">
            <div className="gh-score-pill">
              <span className="gh-score">{playerScore}</span>
              <img src={daddcoinImg} alt="Coin" className="gh-coin" />
            </div>
            <img src={userImg} alt="User" className="gh-avatar" />
          </div>
        </div>

        {/* Exit Button */}
        <button className="gh-exit-btn" onClick={onExit}>
          <img src={exitBtnImg} alt="Exit" />
        </button>
      </div>

      <div className="gh-race-progress" aria-label="تقدم اللاعب والروبوت">
        <div className="gh-race-lane gh-race-lane--robot" aria-label={`تقدم الروبوت ${robotQuestionIndex} من ${totalQuestions}`}>
          <div className="gh-track-area">
            <div className="gh-lane-track" />
            <div className="gh-lane-fill gh-lane-fill--robot" style={{ width: `${robotProgress}%` }} />
            <img className="gh-racer-marker" src={robotImg} alt="" style={{ left: `${robotProgress}%` }} />
          </div>
        </div>
        <div className="gh-race-lane gh-race-lane--player" aria-label={`تقدم اللاعب ${playerCompleted} من ${totalQuestions}`}>
          <div className="gh-track-area">
            <div className="gh-lane-track" />
            <div className="gh-lane-fill gh-lane-fill--player" style={{ width: `${playerProgress}%` }} />
            <img className="gh-racer-marker" src={userImg} alt="" style={{ left: `${100 - playerProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
