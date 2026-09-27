import React, { useState, useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import GameHeader from './GameHeader';
import QuestionCard from './QuestionCard';
import AnswerButtons from './AnswerButtons';
import Celebration from '../Celebration/Celebration';
import ResultsPanel from '../ResultsPanel/ResultsPanel';
import ResultModal from './ResultModal';
import WelcomeScreen from './WelcomeScreen';
import './GameScreen.css';

const GameScreen: React.FC = () => {
  const { state, currentQuestion, totalQuestions, startGame, playerAnswer, restart } = useGameLogic();

  const [showCelebration, setShowCelebration] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const {
    phase,
    currentQuestionIndex,
    playerScore,
    computerScore,
    playerAnswerIndex,
    computerAnswerIndex,
    playerResult,
    computerResult,
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
    restart();
  };

  const handleBack = () => {
    console.log('Go to menu');
    window.parent.postMessage('GAME_COMPLETED', '*');
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const showResult = phase === 'result';

  if (status === 'loading' || status === 'welcome') {
    return (
      <WelcomeScreen
        status={status}
        totalQuestions={totalQuestions}
        onStart={startGame}
      />
    );
  }

  if (status === 'error') {
    return (
      <div className="game-screen error-screen">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={restart} className="restart-btn">Try Again</button>
        </div>
      </div>
    );
  }

  /* ── Status message ──────────────────────────────────────────────────── */
  let statusMsg = '👆 Choose the right answer!';
  if (phase === 'result') {
    if (playerResult === 'correct' && computerResult === 'correct') {
      statusMsg = '🎉 Both answered correctly!';
    } else if (playerResult === 'correct') {
      statusMsg = '🎉 You got it right!';
    } else if (computerResult === 'correct') {
      statusMsg = '🤖 CPU answered correctly!';
    } else {
      statusMsg = '❌ Nobody got it right.';
    }
  }

  const getStatusClass = () => {
    if (phase === 'result') {
      if (playerResult === 'correct' && computerResult === 'correct') return 'status-player';
      if (playerResult === 'correct') return 'status-player';
      if (computerResult === 'correct') return 'status-computer';
      return 'status-none';
    }
    return '';
  };

  return (
    <div className="game-screen">

      <GameHeader 
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        playerScore={playerScore}
        computerScore={computerScore}
        onExit={handleBack}
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
          onRetry={handleRetry}
          onBack={handleBack}
        />
      )}

      {/* ── Result Modal overlay ───────────────────────────────────────────── */}
      {phase === 'result' && playerResult && (
        <ResultModal isCorrect={playerResult === 'correct'} />
      )}
    </div>
  );
};

export default GameScreen;
