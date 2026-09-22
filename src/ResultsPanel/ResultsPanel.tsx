import React, { useRef, useEffect } from 'react';
// @ts-ignore
import { ResultsPanel as ResultsPanelClass } from '../../ResultsPanel/ResultsPanel/ResultsPanel.js';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<any>(null);
  const onRetryRef = useRef(onRetry);
  onRetryRef.current = onRetry;
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!containerRef.current) return;

    const panel = new ResultsPanelClass(containerRef.current, {
      onRetry: () => onRetryRef.current?.(),
      onBack: () => onBackRef.current?.(),
    });

    panel.show({
      score,
      totalScore,
      correctAnswers,
      wrongAnswers,
      coins,
    });

    panelRef.current = panel;

    return () => {
      panel.hide();
      panelRef.current = null;
    };
  }, [score, totalScore, correctAnswers, wrongAnswers, coins]);

  return <div ref={containerRef} />;
};

export default ResultsPanel;
