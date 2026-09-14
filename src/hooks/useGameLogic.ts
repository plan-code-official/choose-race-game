import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Phase, AnswerResult, Question } from '../types';
import { fetchQuestions, startGameSession, submitAnswers, completeSession, ApiQuestion } from '../services/api';
import {
  playCorrectSound,
  playWrongSound,
  playWinSound,
  playLoseSound,
} from '../utils/tts';

const RESULT_DISPLAY_SECONDS = 3;

function makeInitialState(): GameState {
  return {
    status: 'loading',
    lessonId: null,
    token: null,
    sessionId: null,
    error: null,
    currentQuestionIndex: 0,
    questions: [],
    phase: 'player-turn',
    playerScore: 0,
    computerScore: 0,
    playerAnswerIndex: null,
    computerAnswerIndex: null,
    playerResult: null,
    computerResult: null,
    answersList: [],
    finalStats: null,
  };
}

// Convert ApiQuestion to internal Question format
function mapApiQuestion(q: ApiQuestion): Question {
  const options = q.options.map((o) => ({
    text: o.text,
    imageUrl: o.imageUrl,
  }));
  const correctIndex = q.options.findIndex((o) => o.text === q.correctAnswer);
  
  // If the API provided an imageUrl on the question, use it. 
  // Otherwise, fallback to the question string itself if it looks like a URL, or null.
  let imageUrl = q.imageUrl;
  if (!imageUrl && q.question.startsWith('http')) {
    imageUrl = q.question;
  }

  return {
    id: q.id,
    questionText: q.question,
    imageUrl,
    imageEmoji: '❓',
    imageAlt: q.question,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0, // Fallback if correct answer not in options (shouldn't happen)
    audioText: q.audioUrl || q.question, // Just fallback to question text for audio
    apiAudioUrl: q.audioUrl || null,
    category: 'api',
  };
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>(makeInitialState);
  const questionStartTime = useRef<number>(0);

  // Initialize from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const lessonId = searchParams.get('lessonId');
    const token = searchParams.get('token');

    if (!lessonId || !token) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Missing lessonId or token in URL parameters.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, lessonId, token, status: 'loading' }));

    async function initGame() {
      try {
        const apiQuestions = await fetchQuestions(lessonId!, token!);
        const questions = apiQuestions.map(mapApiQuestion);
        
        const sessionId = await startGameSession(lessonId!, token!);
        
        setState((prev) => ({
          ...prev,
          status: 'playing',
          questions,
          sessionId,
        }));
        
        questionStartTime.current = Date.now();
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err.message || 'Failed to load game.',
        }));
      }
    }

    initGame();
  }, []); // Run once on mount

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const totalQuestions = state.questions.length;

  // ── player answers ─────────────────────────────────────────────────────────
  const playerAnswer = useCallback(
    (optionIndex: number) => {
      if (state.phase !== 'player-turn' || !currentQuestion) return;
      const q = currentQuestion;
      
      const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);
      const selectedAnswer = q.options[optionIndex].text;

      const pCorrect = optionIndex === q.correctIndex;
      const cCorrect = Math.random() < 0.6; // Computer is correct ~60% of the time
      const cIdx = cCorrect ? q.correctIndex : 1 - q.correctIndex;
      
      if (pCorrect || cCorrect) {
        playCorrectSound(); // Play correct sound if at least one got it right
      } else {
        playWrongSound(); // Otherwise wrong sound
      }

      setState((prev) => ({
        ...prev,
        phase: 'result',
        playerAnswerIndex: optionIndex,
        playerResult: pCorrect ? 'correct' : 'wrong',
        computerAnswerIndex: cIdx,
        computerResult: cCorrect ? 'correct' : 'wrong',
        playerScore: pCorrect ? prev.playerScore + 1 : prev.playerScore,
        computerScore: cCorrect ? prev.computerScore + 1 : prev.computerScore,
        answersList: [
          ...prev.answersList,
          { questionId: q.id as number, selectedAnswer, timeTaken },
        ],
      }));
    },
    [state.phase, currentQuestion]
  );

  // ── advance to next question ───────────────────────────────────────────────
  const nextQuestion = useCallback(async () => {
    // If it was the last question, submit and complete!
    if (state.currentQuestionIndex + 1 >= state.questions.length) {
      setState((prev) => ({ ...prev, status: 'loading' })); // Show loading while submitting
      try {
        await submitAnswers(state.sessionId!, state.answersList, state.token!);
        const finalStats = await completeSession(state.sessionId!, state.token!);
        
        // Determine overall game winner sound
        const pWins = state.playerScore;
        const cWins = state.computerScore;
        if (pWins > cWins) playWinSound();
        else if (cWins > pWins) playLoseSound();
        
        setState((prev) => ({ ...prev, status: 'game-over', phase: 'game-over', finalStats }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err.message || 'Failed to submit game results.',
        }));
      }
      return;
    }

    // Go to next question
    setState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      questionStartTime.current = Date.now();
      
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        phase: 'player-turn',
        playerAnswerIndex: null,
        computerAnswerIndex: null,
        playerResult: null,
        computerResult: null,
      };
    });
  }, [state]);

  // ── auto-advance from result after RESULT_DISPLAY_SECONDS ─────────────────
  useEffect(() => {
    if (state.phase !== 'result') return;
    const t = setTimeout(nextQuestion, RESULT_DISPLAY_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [state.phase, nextQuestion]);

  // ── restart game ───────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    // Usually games redirect or reload, but we can just reload the page to restart the flow
    window.location.reload();
  }, []);

  return {
    state,
    currentQuestion,
    totalQuestions,
    playerAnswer,
    nextQuestion,
    restart,
  };
}
