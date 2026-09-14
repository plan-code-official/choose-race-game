import React, { useState } from 'react';
import { Question } from '../types';
import { speak } from '../utils/tts';
import './QuestionCard.css';
import ImageModal from './ImageModal';

interface QuestionCardProps {
  question: Question;
  showResult: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, showResult }) => {
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSpeakAnswer = () => {
    speak(question.audioText);
  };

  const handlePlayAudio = () => {
    if (question.apiAudioUrl) {
      const audio = new Audio(question.apiAudioUrl);
      audio.play().catch(console.error);
    }
  };

  return (
    <>
      <div className="question-card">
        <div className="image-container">
          <div className="content-wrapper">
            {!question.imageUrl || imgError ? (
              <div className="question-text-fallback">{question.questionText}</div>
            ) : (
              <>
                <img
                  src={question.imageUrl}
                  alt={question.imageAlt}
                  className="question-image"
                  onError={() => setImgError(true)}
                />
                {question.questionText && (
                  <div className="question-text-overlay">
                    {question.questionText}
                  </div>
                )}
              </>
            )}

            {question.imageUrl && !imgError && (
              <button
                className="zoom-btn image-zoom-btn"
                title="Zoom Image"
                onClick={() => setIsModalOpen(true)}
              >
                🔍
              </button>
            )}

            {question.apiAudioUrl && (
              <button
                className="sound-btn image-sound-btn"
                title="Listen to audio"
                onClick={handlePlayAudio}
              >
                🔊
              </button>
            )}
          </div>
        </div>

      </div>

      {isModalOpen && question.imageUrl && (
        <ImageModal
          imageUrl={question.imageUrl}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default QuestionCard;
