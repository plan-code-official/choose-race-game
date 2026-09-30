import React from 'react';
import './ResultsPanelNative.css';
import panelFrame from '../../ResultsPanel/ResultsPanel/assets/banal.png';
import celebrationTitle from '../../ResultsPanel/ResultsPanel/assets/good.png';
import coinsImage from '../../ResultsPanel/ResultsPanel/assets/money.png';
import correctImage from '../../ResultsPanel/ResultsPanel/assets/right.png';
import wrongImage from '../../ResultsPanel/ResultsPanel/assets/wrong.png';
import exitButtonImage from '../assets/exit.png';
import retryButtonImage from '../assets/retry.png';

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
  const total = (correctAnswers + wrongAnswers) || 1;
  const percent = correctAnswers / total;
  const correctPercent = Math.round(percent * 100);
  const isWinner = percent >= 0.5;

  return (
    <div className="results-overlay">
      <section className="results-screen" aria-label="نتائج اللعبة" dir="rtl">
        <div className="results-panel" style={{ '--results-panel-image': `url(${panelFrame})` } as any}>
          <img className="results-panel__frame" src={panelFrame} alt="" aria-hidden="true" />
          <div className="results-panel__content">
            {isWinner ? (
              <img src={celebrationTitle} alt="أحسنت" className="results-panel__title" />
            ) : (
              <h1 className="results-panel__fail-title">حاول مرة أخرى!</h1>
            )}

            <div className="results-grade" aria-label={`الدرجة ${correctPercent} من 100`}>
              <span>الدَّرَجَة</span>
              <strong>{correctPercent}/100</strong>
            </div>

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
          <button className="results-action results-action--exit" type="button" onClick={onBack}>
            <img className="results-action__bg" src={exitButtonImage} alt="خروج" />
          </button>

          <button className="results-action results-action--retry" type="button" onClick={onRetry}>
            <img className="results-action__bg" src={retryButtonImage} alt="إعادة المحاولة" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default ResultsPanel;
