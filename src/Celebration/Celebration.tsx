import React, { useRef, useEffect } from 'react';
// @ts-ignore
import { Celebration as CelebrationClass } from '../../Celebration/Celebration/Celebration.js';

export interface CelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  muted?: boolean;
  soundUrl?: string;
  imageSrc?: string;
}

export const Celebration: React.FC<CelebrationProps> = ({
  isVisible,
  onComplete,
  muted,
  soundUrl,
  imageSrc,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const celebrationRef = useRef<any>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!containerRef.current) return;

    const celebration = new CelebrationClass(containerRef.current, {
      muted,
      soundUrl,
      imageSrc,
    });
    celebrationRef.current = celebration;

    if (isVisible) {
      celebration.show(() => {
        onCompleteRef.current?.();
      });
    }

    return () => {
      celebration.hide();
      celebrationRef.current = null;
    };
  }, [isVisible, muted, soundUrl, imageSrc]);

  return <div ref={containerRef} />;
};

export default Celebration;
