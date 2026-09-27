import React from 'react';
import './ResultsPanelNative.css';
import panelFrame from '../../ResultsPanel/ResultsPanel/assets/banal.png';
import celebrationTitle from '../../ResultsPanel/ResultsPanel/assets/good.png';
import coinsImage from '../../ResultsPanel/ResultsPanel/assets/money.png';
import correctImage from '../../ResultsPanel/ResultsPanel/assets/right.png';
import wrongImage from '../../ResultsPanel/ResultsPanel/assets/wrong.png';
import buttonFrame from '../../ResultsPanel/ResultsPanel/assets/boutton.png';
import exitIcon from '../assets/ExitButton.svg';
import retryIcon from '../assets/retry.png';

export interface ResultsPanelProps {
  score: number;
  totalScore?: number;
  correctAnswers: number;
  wrongAnswers: number;
  coins: number;
  onRetry: () => void;
  onBack: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  score,
  totalScore = 100,
  correctAnswers,
  wrongAnswers,
  coins,
  onRetry,
  onBack,
}) => {
  const percent = score / totalScore;
  const isWinner = percent >= 0.5;

  return (
    <div className="results-overlay">
      <section className="results-screen" aria-label="نتائج اللعبة" dir="rtl">
        <div className="results-panel" style={{ '--results-panel-image': `url(${panelFrame})` } as any}>
          <div className="results-panel__content">
            {isWinner ? (
              <img src={celebrationTitle} alt="أحسنت" className="results-panel__title" />
            ) : (
              <h1 className="results-panel__title-text">حاول مرة أخرى</h1>
            )}

            <div className="results-stats">
              <div className="results-stat-card results-stat-card--correct">
                <img src={correctImage} alt="إجابات صحيحة" />
                <strong>{correctAnswers}</strong>
              </div>

              <div className="results-stat-card results-stat-card--coins">
                <img src={coinsImage} alt="عملات مكتسبة" />
                <strong>+{coins}</strong>
                <span>فِلُوس</span>
              </div>

              <div className="results-stat-card results-stat-card--wrong">
                <img src={wrongImage} alt="إجابات خاطئة" />
                <strong>{wrongAnswers}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="results-action results-action--retry" type="button" onClick={onRetry}>
            <img className="results-action__bg" src={buttonFrame} alt="" aria-hidden="true" />
            <div className="results-action__group">
              <span className="results-action__text" style={{ color: '#84ebff' }}>ثانِيَةً</span>
              <img src={retryIcon} className="results-action__icon" alt="Retry" />
            </div>
          </button>

          <button className="results-action" type="button" onClick={onBack}>
            <img className="results-action__bg" src={buttonFrame} alt="" aria-hidden="true" />
            <div className="results-action__group">
              <span className="results-action__text">اخرج</span>
              <img src={exitIcon} className="results-action__icon" alt="Exit" />
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ResultsPanel;
