import React from 'react';
import GameWelcomeScreen from './GameWelcomeScreen/GameWelcomeScreen';
import BG from '../assets/BG.png';
import QuestionCoin from '../assets/QuestionCoin.png';
import QuestionNumberBg from '../assets/QuestionNumber.png';
import DescriptionImg from '../assets/description.png';
import DaddCoin from '../assets/daddcoin.webp';
import startButton from '../assets/startButton.png';
import exitButton from '../assets/Exit1.png';

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
      statsBgImage={QuestionNumberBg}
      statLeftIcon={QuestionCoin}
      statLeftAlt="عدد الأسئلة"
      statLeftValue={totalQuestions}
      statRightValue={totalQuestions}
      statRightIcon={DaddCoin}
      statRightAlt="النقاط"
      descriptionImage={DescriptionImg}
      startButtonImage={startButton}
      exitButtonImage={exitButton}
      onStart={onStart}
      isLoading={isLoading}
      isReady={totalQuestions > 0}
    />
  );
};

export default WelcomeScreen;
