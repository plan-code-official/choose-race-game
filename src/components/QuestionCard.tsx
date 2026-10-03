import React, { useEffect, useRef, useState } from 'react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setImgError(false);
    setIsModalOpen(false);

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [question.id, question.imageUrl, question.apiAudioUrl]);

  const handlePlayAudio = () => {
    if (!question.apiAudioUrl) return;

    audioRef.current?.pause();
    const audio = new Audio(question.apiAudioUrl);
    audioRef.current = audio;
    void audio.play().catch(() => {
      audioRef.current = null;
    });
  };

  const hasImage = Boolean(question.imageUrl) && !imgError;
  const hasAudio = Boolean(question.apiAudioUrl);

  return (
    <>
      <div className="question-card" data-result={showResult ? 'visible' : undefined}>
        <div className="image-container">
          <div className="content-wrapper">
            {(hasImage || hasAudio) && (
              <div className={`question-media-row${!hasImage ? ' question-media-row--audio-only' : ''}`}>
                {hasImage && (
                  <button
                    type="button"
                    className="question-image-trigger"
                    aria-label={`عرض صورة السؤال بحجم أكبر: ${question.imageAlt}`}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <img
                      src={question.imageUrl!}
                      alt={question.imageAlt}
                      className="question-image"
                      onError={() => setImgError(true)}
                    />
                    <span className="question-image-zoom-hint" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M15 3h6v6M21 3l-8 8M9 21H3v-6M3 21l8-8" />
                      </svg>
                    </span>
                  </button>
                )}

                {hasAudio && (
                  <button
                    type="button"
                    className="sound-btn question-audio-btn"
                    title="تشغيل صوت السؤال"
                    aria-label="تشغيل صوت السؤال"
                    onClick={handlePlayAudio}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {question.questionText && (
              <div className="question-prompt">
                <span>{question.questionText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && question.imageUrl && hasImage && (
        <ImageModal
          imageUrl={question.imageUrl}
          imageAlt={question.imageAlt}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default QuestionCard;
