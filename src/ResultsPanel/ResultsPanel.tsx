import React from 'react';
import './ResultsPanelNative.css';
import panelFrame from '../../ResultsPanel/ResultsPanel/assets/banal.png';
import celebrationTitle from '../../ResultsPanel/ResultsPanel/assets/good.png';
import coinsImage from '../../ResultsPanel/ResultsPanel/assets/money.png';
import correctImage from '../../ResultsPanel/ResultsPanel/assets/right.png';
import wrongImage from '../../ResultsPanel/ResultsPanel/assets/wrong.png';
import exitButtonImage from '../assets/Exit.png';
import retryButtonImage from '../assets/retry.png';

export interface ResultsPanelProps {
  score: number;
  totalScore?: number;
  correctAnswers: number;
  wrongAnswers: number;
  coins: number;
  totalQuestions?: number;
  onRetry: () => void;
  onBack: () => void;
}

const numberValue = (value: number | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  score,
  totalScore = 100,
  correctAnswers,
  wrongAnswers,
  coins,
  totalQuestions,
  onRetry,
  onBack,
}) => {
  const reportedCorrect = numberValue(correctAnswers);
  const reportedWrong = numberValue(wrongAnswers);
  const earnedCoins = numberValue(coins);
  const questionCount = numberValue(totalQuestions) || reportedCorrect + reportedWrong;
  const correct = questionCount ? Math.min(reportedCorrect, questionCount) : reportedCorrect;
  const wrong = questionCount ? questionCount - correct : reportedWrong;
  const correctPercent = questionCount ? Math.round((correct / questionCount) * 100) : 0;
  const isSuccess = questionCount > 0 && correctPercent >= 50;

  return (
    <div className="results-overlay">
      <section className="results-screen" aria-label="نتائج اللعبة" dir="rtl">
        <div className="results-panel" style={{ '--results-panel-image': `url(${panelFrame})` } as any}>
          <img className="results-panel__frame" src={panelFrame} alt="" aria-hidden="true" />
          <div className="results-panel__content">
            {isSuccess ? (
              <img className="results-panel__title" src={celebrationTitle} alt="أحسنت" />
            ) : (
              <div className="results-panel__fail-title">حاول مرة أخرى!</div>
            )}

            <div className="results-grade" aria-label={`الدرجة ${correctPercent} من 100`}>
              <span>الدَّرَجَة</span>
              <strong>{correctPercent}/100</strong>
            </div>

            <div className="results-stats" aria-label="إحصاءات الأداء">
              <div className="results-stat-card results-stat-card--correct">
                <img src={correctImage} alt="إجابات صحيحة" />
                <strong>{correct}</strong>
              </div>

              <div className="results-stat-card results-stat-card--coins">
                <img src={coinsImage} alt="عملات مكتسبة" />
                <strong>+{earnedCoins}</strong>
                <span>{'\u0641\u0650\u0644\u064f\u0648\u0633'}</span>
              </div>

              <div className="results-stat-card results-stat-card--wrong">
                <img src={wrongImage} alt="إجابات خاطئة" />
                <strong>{wrong}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions" aria-label="إجراءات النتائج">
          <button className="results-action results-action--exit" type="button" onClick={onBack} aria-label="خروج">
            <img className="results-action__bg" src={exitButtonImage} alt="خروج" />
          </button>

          <button className="results-action results-action--retry" type="button" onClick={onRetry} aria-label="إعادة المحاولة">
            <img className="results-action__bg" src={retryButtonImage} alt="إعادة المحاولة" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default ResultsPanel;
