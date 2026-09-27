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
      <div className={`result-modal-content ${isCorrect ? 'correct' : 'wrong'}`} dir="rtl">
        <h1 className="result-modal-text">
          {isCorrect ? 'أحسنت' : 'خطأ'}
        </h1>
        <span className="result-modal-icon">
          {isCorrect ? '✔' : '✖'}
        </span>
      </div>
    </div>,
    document.body
  );
};

export default ResultModal;
