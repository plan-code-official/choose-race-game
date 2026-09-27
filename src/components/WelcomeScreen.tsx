import React from 'react';
import './WelcomeScreen.css';

import coinImg from '../assets/QuestionCoin.png';
import statsBg from '../assets/QuestionNumber.png';
import descriptionImg from '../assets/description.png';
import startBtnBg from '../assets/startButton.png';
import daddcoinImg from '../assets/daddcoin.webp';
import exitBtnImg from '../assets/ExitButton.svg';

interface WelcomeScreenProps {
  status: 'loading' | 'welcome';
  totalQuestions: number;
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ status, totalQuestions, onStart }) => {
  const isLoading = status === 'loading';
  const xpCount = totalQuestions * 10;

  return (
    <div className="welcome-screen-new">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="welcome-top-bar">
        {/* Left Side: Stats */}
        <div className="welcome-stats" style={{ backgroundImage: `url(${statsBg})` }}>
          <div className="welcome-stats-bg">
            <img src={daddcoinImg} alt="DaddCoin" className="welcome-icon" />
            <span className="welcome-text">{isLoading ? '...' : totalQuestions}</span>
            <span className="welcome-separator">=</span>
            <img src={coinImg} alt="Coin" className="welcome-icon" />
            <span className="welcome-text">{isLoading ? '...' : totalQuestions}</span>
          </div>
        </div>

        {/* Right Side: Exit Button */}
        <button className="welcome-exit-btn" onClick={() => window.location.href = '/'}>
          <img src={exitBtnImg} alt="Exit Game" />
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="welcome-body">
        <img src={descriptionImg} alt="How to play" className="welcome-description" />
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="welcome-footer">
        <button
          className={`welcome-start-btn ${isLoading ? 'loading' : ''}`}
          style={{ backgroundImage: `url(${startBtnBg})` }}
          onClick={onStart}
          disabled={isLoading}
        >
          {isLoading ? 'جاري تحميل الأسئلة...' : 'ابدَأ!'}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
