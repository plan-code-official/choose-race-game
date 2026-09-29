import React from 'react';
import './GameWelcomeScreen.css';

interface GameWelcomeScreenProps {
  /** Full-screen background image */
  backgroundImage: string;
  /** Badge frame background image (e.g. QuestionNumber.png) */
  statsBgImage: string;
  /** Left icon inside the badge (e.g. question coin) */
  statLeftIcon: string;
  statLeftAlt?: string;
  /** Primary count shown in white (e.g. number of questions) */
  statLeftValue: number;
  /** Derived/highlighted count shown in yellow */
  statRightValue: number;
  /** Right icon inside the badge (e.g. reward coin) */
  statRightIcon: string;
  statRightAlt?: string;
  /** Main description / how-to-play image */
  heroImage: string;
  heroAlt?: string;
  /** Start button graphic (used as CSS background-image) */
  startButtonImage: string;
  /** Exit button graphic (used as <img>) */
  exitButtonImage: string;
  /** Called when the Start button is clicked */
  onStart: () => void;
  /** Called when the Exit button is clicked; defaults to window.history.back() */
  onExit?: () => void;
  /** Disables start button while data is loading */
  isLoading?: boolean;
  /** Disables start button when no data is ready */
  isReady?: boolean;
}

const GameWelcomeScreen: React.FC<GameWelcomeScreenProps> = ({
  backgroundImage,
  statsBgImage,
  statLeftIcon,
  statLeftAlt = '',
  statLeftValue,
  statRightValue,
  statRightIcon,
  statRightAlt = '',
  heroImage,
  heroAlt = '',
  startButtonImage,
  exitButtonImage,
  onStart,
  onExit,
  isLoading = false,
  isReady = true,
}) => {
  const disabled = isLoading || !isReady;

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className="gws-screen"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* ── Header: Stats Badge ──────────────────────────── */}
      <header className="gws-header">
        <div
          className="gws-stats-bg"
          style={{ backgroundImage: `url(${statsBgImage})` }}
        >
          <div className="gws-stats-inner">
            <img src={statLeftIcon} alt={statLeftAlt} className="gws-stat-icon" />
            <span className="gws-stat-value">
              {isLoading ? '...' : statLeftValue}
            </span>
            <span className="gws-stat-separator">=</span>
            <img src={statRightIcon} alt={statRightAlt} className="gws-stat-icon" />
            <span className="gws-stat-value--highlight">
              {isLoading ? '...' : statRightValue}
            </span>
          </div>
        </div>
      </header>

      {/* ── Body: Hero Image ────────────────────────────────────── */}
      <main className="gws-body">
        <img src={heroImage} alt={heroAlt} className="gws-hero-img" />
      </main>

      {/* ── Footer: Action Buttons ───────────────────────────────── */}
      <footer className="gws-footer">
        <div className="gws-footer-buttons">
          <button className="gws-exit-footer-btn" onClick={handleExit} aria-label="Exit">
            <img src={exitButtonImage} alt="Exit" />
          </button>
          
          <button
            className="gws-start-btn"
            style={{ backgroundImage: `url(${startButtonImage})` }}
            onClick={onStart}
            disabled={disabled}
          >
          </button>
        </div>
      </footer>
    </div>
  );
};

export default GameWelcomeScreen;
