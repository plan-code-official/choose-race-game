import React from 'react';
import GameWelcomeScreen from './GameWelcomeScreen/GameWelcomeScreen';

import bgImg        from '../assets/BG.png';
import badgeBG      from '../assets/QuestionNumber.png';
import qCoin        from '../assets/QuestionCoin.png';
import daddCoin     from '../assets/daddcoin.webp';
import description  from '../assets/description.png';
import startBtn     from '../assets/start_transparent.png';
import exitBtn      from '../assets/exit_transparent.png';

interface WelcomeScreenProps {
  status: 'loading' | 'welcome';
  totalQuestions: number;
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ status, totalQuestions, onStart }) => {
  const isLoading = status === 'loading';

  return (
    <GameWelcomeScreen
      backgroundImage={bgImg}
      statsBgImage={badgeBG}
      statLeftIcon={qCoin}
      statLeftAlt="Questions"
      statLeftValue={totalQuestions}
      statRightValue={totalQuestions}
      statRightIcon={daddCoin}
      statRightAlt="Dadd Points"
      heroImage={description}
      heroAlt="How to Play"
      startButtonImage={startBtn}
      exitButtonImage={exitBtn}
      onStart={onStart}
      onExit={() => window.location.href = '/'}
      isLoading={isLoading}
      isReady={totalQuestions > 0}
    />
  );
};

export default WelcomeScreen;
