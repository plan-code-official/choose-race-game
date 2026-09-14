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
            <div className="content-wrapper">
              <span className="btn-text">{option.text}</span>
            </div>
            {option.imageUrl && (
              <button
                className="zoom-btn option-zoom-btn"
                title="Zoom Option Image"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomedImage(option.imageUrl);
                }}
              >
                🔍
              </button>
            )}
          </button>
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
