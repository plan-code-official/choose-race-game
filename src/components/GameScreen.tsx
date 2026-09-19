import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import PlayerPanel from './PlayerPanel';
import ComputerPanel from './ComputerPanel';
import QuestionCard from './QuestionCard';
import AnswerButtons from './AnswerButtons';
import ScoreBoard from './ScoreBoard';
import ResultModal from './ResultModal';
import WelcomeScreen from './WelcomeScreen';
import './GameScreen.css';

const GameScreen: React.FC = () => {
  const { state, currentQuestion, totalQuestions, startGame, playerAnswer, restart } = useGameLogic();

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
        <button onClick={restart} className="restart-btn">Try Again</button>
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

      {/* ── Top indicator ─────────────────────────────────────────────── */}
      <div className="top-bar">
        <div className="question-counter">
          {String(currentQuestionIndex + 1).padStart(2, '0')} of {String(totalQuestions).padStart(2, '0')}
        </div>
      </div>



      {/* ── Main arena ───────────────────────────────────────────────────── */}
      <div className="arena">

        {/* Left: Player */}
        <div className="arena-left">
          <PlayerPanel
            score={playerScore}
            isWinning={playerScore >= computerScore}
            roundWon={playerResult === 'correct'}
          />
        </div>

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

        {/* Right: Computer */}
        <div className="arena-right">
          <ComputerPanel
            score={computerScore}
            isThinking={false}
            roundWon={computerResult === 'correct'}
          />
        </div>
      </div>

      {/* ── Game Over overlay ─────────────────────────────────────────────── */}
      {phase === 'game-over' && (
        <ScoreBoard
          playerScore={playerScore}
          computerScore={computerScore}
          totalQuestions={totalQuestions}
          finalStats={state.finalStats}
          onRestart={restart}
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
