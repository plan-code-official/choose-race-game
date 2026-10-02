import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ImageModal.css';

interface ImageModalProps {
  imageUrl: string;
  imageAlt?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, imageAlt = 'صورة مكبرة', onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="image-modal-overlay" role="presentation" onClick={onClose}>
      <div className="image-modal-content" role="dialog" aria-modal="true" aria-label={imageAlt} onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" type="button" aria-label="إغلاق الصورة" onClick={onClose}>
          ✕
        </button>
        <img src={imageUrl} alt={imageAlt} className="image-modal-img" />
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;
