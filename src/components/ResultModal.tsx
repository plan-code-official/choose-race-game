import React from 'react';
import { createPortal } from 'react-dom';
import './ResultModal.css';

import rightImg from '../assets/right.png';
import wrongImg from '../assets/wrong.png';

interface ResultModalProps {
  isCorrect: boolean;
}

const ResultModal: React.FC<ResultModalProps> = ({ isCorrect }) => {
  return createPortal(
    <div className="result-modal-overlay">
      <div className={`answer-feedback-card ${isCorrect ? 'answer-feedback-card--success' : 'answer-feedback-card--wrong'}`} dir="rtl">
        <svg className="answer-feedback__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {isCorrect ? <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></> : <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></>}
        </svg><span className="answer-feedback__text">{isCorrect ? 'أحسنت!' : 'خطأ'}</span>
      </div>
    </div>,
    document.body
  );
};

export default ResultModal;
