import React, { useState, useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import GameHeader from './GameHeader';
import QuestionCard from './QuestionCard';
import AnswerButtons from './AnswerButtons';
import Celebration from '../Celebration/Celebration';
import ResultsPanel from '../ResultsPanel/ResultsPanel';
import ResultModal from './ResultModal';
import WelcomeScreen from './WelcomeScreen';
import ErrorScreen from './ErrorScreen';
import { handleExitSite } from '../utils/navigation';
import { preloadAllCoreAssets } from '../utils/preloadAssets';
import './GameScreen.css';

const GameScreen: React.FC = () => {
  const { state, userProfile, currentQuestion, totalQuestions, startGame, playerAnswer, returnToWelcome } = useGameLogic();

  const [showCelebration, setShowCelebration] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Preload all core assets on initial mount
  useEffect(() => {
    void preloadAllCoreAssets();
  }, []);

  const {
    phase,
    currentQuestionIndex,
    playerScore,
    computerScore,
    playerAnswerIndex,
    computerAnswerIndex,
    playerResult,
    status,
    error,
  } = state;

  // Trigger celebration on win / game completion
  useEffect(() => {
    if (phase === 'game-over' && !showResults && !showCelebration) {
      if (playerScore / totalQuestions > 0.5) {
        setShowCelebration(true);
      } else {
        // When user did not answer enough correctly, do not display celebration
        setShowResults(true);
      }
    }
  }, [phase, showResults, showCelebration, playerScore, totalQuestions]);

  // Handle transition from Celebration to Results
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setShowResults(true);
  };

  const handleRetry = () => {
    setShowResults(false);
    setShowCelebration(false);
    void returnToWelcome();
  };

  const handleBack = handleExitSite;

  const showResult = phase === 'result';

  const isInitialLoading = status === 'loading' && state.answersList.length === 0;

  if (isInitialLoading || status === 'welcome') {
    return (
      <WelcomeScreen
        status={status}
        totalQuestions={totalQuestions}
        onStart={startGame}
      />
    );
  }

  if (status === 'error' || (!isInitialLoading && status !== 'loading' && totalQuestions === 0)) {
    return (
      <ErrorScreen
        onExit={handleBack}
        description={
          error?.toLowerCase().includes('lessonid')
            ? 'لا يمكننا العثور على الدرس المطلوب. يرجى التأكد من الرابط أو العودة للرئيسية.'
            : (error || 'لا يمكننا العثور على هذه الصفحة. دعنا نذهب إلى مكان مألوف.')
        }
      />
    );
  }

  if (status === 'loading' && state.answersList.length > 0) {
    return (
      <div className="game-screen loading-screen" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="game-screen">

      <GameHeader 
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        playerScore={playerScore}
        computerScore={computerScore}
        onExit={handleBack}
        playerAvatar={userProfile?.avatarUrl}
        playerAccessory={userProfile?.accessoryUrl}
      />

      {/* ── Main arena ───────────────────────────────────────────────────── */}
      <div className="arena">

        {/* Center: Question + Answers */}
        <div className="arena-center">
          <QuestionCard
            question={currentQuestion}
            showResult={showResult}
          />



          {/* Answer buttons */}
          <AnswerButtons
            options={currentQuestion.options}
            correctIndex={currentQuestion.correctIndex}
            playerAnswerIndex={playerAnswerIndex}
            computerAnswerIndex={computerAnswerIndex}
            phase={phase}
            onAnswer={playerAnswer}
          />
        </div>
      </div>

      {/* ── End Game Overlays ─────────────────────────────────────────────── */}
      <Celebration 
        isVisible={showCelebration} 
        onComplete={handleCelebrationComplete} 
      />

      {showResults && (
        <ResultsPanel
          score={state.finalStats?.score ?? Math.round((playerScore / Math.max(1, totalQuestions)) * 100)}
          totalScore={100}
          correctAnswers={playerScore}
          wrongAnswers={Math.max(0, totalQuestions - playerScore)}
          coins={state.finalStats?.coins ?? (playerScore * 2)}
          totalQuestions={totalQuestions}
          onRetry={handleRetry}
          onBack={handleBack}
        />
      )}

      {/* ── Result Modal overlay ───────────────────────────────────────────── */}
      {phase === 'result' && playerResult && (
        <ResultModal resultType={playerResult} />
      )}
    </div>
  );
};

export default GameScreen;
