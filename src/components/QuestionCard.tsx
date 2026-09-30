import React, { useState } from 'react';
import { Question } from '../types';
import './QuestionCard.css';
import ImageModal from './ImageModal';

interface QuestionCardProps {
  question: Question;
  showResult: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, showResult }) => {
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                aria-label="تشغيل صوت السؤال"
                onClick={handlePlayAudio}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
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
