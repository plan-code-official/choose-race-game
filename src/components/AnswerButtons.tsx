import React from 'react';
import { Option } from '../types';
import ImageModal from './ImageModal';
import './AnswerButtons.css';

interface AnswerButtonsProps {
  options: Option[];
  correctIndex: number;
  playerAnswerIndex: number | null;
  computerAnswerIndex: number | null;
  phase: 'player-turn' | 'computer-turn' | 'result' | 'game-over';
  onAnswer: (index: number) => void;
}

const AnswerButtons: React.FC<AnswerButtonsProps> = ({
  options,
  correctIndex,
  playerAnswerIndex,
  computerAnswerIndex,
  phase,
  onAnswer,
}) => {
  const [zoomedImage, setZoomedImage] = React.useState<string | null>(null);

  const isDisabled = phase !== 'player-turn';

  const getButtonClass = (index: number): string => {
    const classes = ['answer-btn'];

    if (phase === 'result' || phase === 'game-over') {
      if (index === correctIndex) {
        classes.push('correct');
      } else {
        classes.push('wrong');
      }

      if (index === playerAnswerIndex) {
        classes.push('player-picked');
      }

      if (index === computerAnswerIndex) {
        classes.push('robot-picked');
      }
    }

    return classes.join(' ');
  };

  return (
    <div className="answer-buttons">
      {options.map((option, index) => (
        <div key={index} className="btn-wrapper">
          <button
            className={getButtonClass(index)}
            onClick={() => !isDisabled && onAnswer(index)}
            disabled={isDisabled}
          >
            <span className="btn-text">{option.text}</span>
          </button>
          {option.imageUrl && (
            <button
              type="button"
              className="zoom-btn option-zoom-btn"
              title="Zoom Option Image"
              aria-label="تكبير صورة الإجابة"
              onClick={() => setZoomedImage(option.imageUrl)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5M10.8 7.5v6.6M7.5 10.8h6.6"/></svg>
            </button>
          )}
          {option.audioUrl && (
            <button
              type="button"
              className="sound-btn option-sound-btn"
              title="تشغيل صوت الإجابة"
              aria-label="تشغيل صوت الإجابة"
              onClick={() => {
                const audio = new Audio(option.audioUrl!);
                audio.play().catch(console.error);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
            </button>
          )}
        </div>
      ))}
      
      {zoomedImage && (
        <ImageModal
          imageUrl={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </div>
  );
};

export default AnswerButtons;
