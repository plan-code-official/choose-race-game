import React from 'react';
import GameWelcomeScreen from './GameWelcomeScreen/GameWelcomeScreen';
import BG from '../assets/BG.png';
import coinImg from '../assets/QuestionCoin.png';
import statsBg from '../assets/QuestionNumber.png';
import descriptionImg from '../assets/description.png';
import startBtnBg from '../assets/startButton.png';
import daddcoinImg from '../assets/daddcoin.webp';
import exitBtnImg from '../assets/Exit1.png';

interface WelcomeScreenProps {
  status: 'loading' | 'welcome';
  totalQuestions: number;
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ status, totalQuestions, onStart }) => {
  const isLoading = status === 'loading';

  return (
    <GameWelcomeScreen
      backgroundImage={BG}
      statsBgImage={statsBg}
      statLeftIcon={daddcoinImg}
      statLeftAlt="النقاط"
      statLeftValue={totalQuestions}
      statRightValue={totalQuestions}
      statRightIcon={coinImg}
      statRightAlt="العملات"
      descriptionImage={descriptionImg}
      startButtonImage={startBtnBg}
      exitButtonImage={exitBtnImg}
      onStart={onStart}
      onExit={() => { window.location.href = '/'; }}
      isLoading={isLoading}
      isReady={!isLoading && totalQuestions > 0}
    />
  );
};

export default WelcomeScreen;
