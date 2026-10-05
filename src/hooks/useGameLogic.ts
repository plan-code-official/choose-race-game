import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Phase, AnswerResult, Question } from '../types';
import { fetchQuestions, startGameSession, submitAnswers, completeSession, ApiQuestion } from '../services/api';
import { getShuffledQuestions } from '../data/questions';
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
    computerQuestionIndex: 0,
    playerFinished: false,
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
    audioUrl: o.audioUrl || null,
  }));
  const correctIndex = q.options.findIndex((o) => o.text === q.correctAnswer);
  
  // If the API provided an imageUrl on the question, use it. 
  // Otherwise, fallback to the question string itself if it looks like a URL, or null.
  let imageUrl = q.imageUrl || q.options?.find((option) => option.imageUrl)?.imageUrl || null;
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
    apiAudioUrl: q.audioUrl || q.options?.find((option) => option.audioUrl)?.audioUrl || null,
    category: 'api',
  };
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>(makeInitialState);
  const questionStartTime = useRef<number>(0);
  const completionStarted = useRef(false);

  // Initialize from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const lessonId = searchParams.get('lessonId');
    const token = searchParams.get('token');

    if (!lessonId) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Missing lessonId in URL parameters.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, lessonId, token, status: 'loading' }));

    async function initGame() {
      try {
        const apiQuestions = await fetchQuestions(lessonId, token || '');
        const questions = apiQuestions.map(mapApiQuestion);
        
        const sessionId = await startGameSession(lessonId, token || '');
        
        setState((prev) => ({
          ...prev,
          status: 'welcome',
          questions,
          sessionId,
        }));
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

  const startGame = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'playing' }));
    questionStartTime.current = Date.now();
  }, []);

  // ── player answers ─────────────────────────────────────────────────────────
  const playerAnswer = useCallback(
    (optionIndex: number) => {
      if (state.phase !== 'player-turn' || !currentQuestion) return;
      const q = currentQuestion;
      
      const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);
      const selectedAnswer = q.options[optionIndex].text;

      const pCorrect = optionIndex === q.correctIndex;
      if (pCorrect) playCorrectSound();
      else playWrongSound();

      setState((prev) => ({
        ...prev,
        phase: 'result',
        playerAnswerIndex: optionIndex,
        playerResult: pCorrect ? 'correct' : 'wrong',
        playerScore: pCorrect ? prev.playerScore + 1 : prev.playerScore,
        answersList: [
          ...prev.answersList,
          { questionId: q.id as number, selectedAnswer, timeTaken },
        ],
      }));
    },
    [state.phase, currentQuestion]
  );

  // The robot races through its own question queue, independent of the player.
  useEffect(() => {
    if (state.status !== 'playing' || state.computerQuestionIndex >= state.questions.length) return;

    const delayMs = 2000 + Math.floor(Math.random() * 4001);
    const timer = window.setTimeout(() => {
      setState((prev) => {
        if (prev.status !== 'playing' || prev.computerQuestionIndex >= prev.questions.length) return prev;

        const question = prev.questions[prev.computerQuestionIndex];
        if (!question) return prev;

        const canMiss = question.options.length > 1;
        const isCorrect = !canMiss || Math.random() < 0.6;
        const wrongIndexes = question.options
          .map((_, index) => index)
          .filter((index) => index !== question.correctIndex);
        const wrongIndex = wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];

        return {
          ...prev,
          computerQuestionIndex: prev.computerQuestionIndex + 1,
          computerResult: isCorrect ? 'correct' : 'wrong',
          computerScore: isCorrect ? prev.computerScore + 1 : prev.computerScore,
        };
      });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [state.status, state.computerQuestionIndex, state.questions.length]);

  // ── advance to next question ───────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing' || prev.playerFinished) return prev;

      if (prev.currentQuestionIndex + 1 >= prev.questions.length) {
        return { ...prev, playerFinished: true, phase: 'computer-turn' };
      }

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
  }, []);

  const completeGame = useCallback(async () => {
    if (
      state.status !== 'playing' ||
      !state.playerFinished ||
      state.computerQuestionIndex < state.questions.length ||
      completionStarted.current
    ) return;

    completionStarted.current = true;
    setState((prev) => prev.status === 'playing' ? { ...prev, status: 'loading' } : prev);

    try {
      let finalStats = null;
      if (state.sessionId === 'demo-session') {
        const totalQ = Math.max(1, state.questions.length);
        const pct = Math.round((state.playerScore / totalQ) * 100);
        finalStats = {
          score: pct,
          percentage: pct,
          stars: pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0,
          coins: state.playerScore * 2,
          experience: state.playerScore * 10,
        };
      } else {
        await submitAnswers(state.sessionId!, state.answersList, state.token!);
        finalStats = await completeSession(state.sessionId!, state.token!);
      }

      if (state.playerScore > state.computerScore) playWinSound();
      else if (state.computerScore > state.playerScore) playLoseSound();

      setState((prev) => ({ ...prev, status: 'game-over', phase: 'game-over', finalStats }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err.message || 'Failed to submit game results.',
      }));
    }
  }, [state]);

  useEffect(() => {
    if (state.status === 'playing' && state.playerFinished && state.computerQuestionIndex >= state.questions.length) {
      void completeGame();
    }
  }, [state.status, state.playerFinished, state.computerQuestionIndex, state.questions.length, completeGame]);

  // ── auto-advance from result after RESULT_DISPLAY_SECONDS ─────────────────
  useEffect(() => {
    if (state.phase !== 'result') return;
    const t = setTimeout(nextQuestion, RESULT_DISPLAY_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [state.phase, nextQuestion]);

  // Return to the welcome screen with a fresh server session for another run.
  const returnToWelcome = useCallback(async () => {
    completionStarted.current = false;

    setState((prev) => ({
      ...prev,
      status: 'loading',
      error: null,
      currentQuestionIndex: 0,
      computerQuestionIndex: 0,
      playerFinished: false,
      phase: 'player-turn',
      playerScore: 0,
      computerScore: 0,
      playerAnswerIndex: null,
      computerAnswerIndex: null,
      playerResult: null,
      computerResult: null,
      answersList: [],
      finalStats: null,
    }));

    questionStartTime.current = 0;

    if (state.sessionId === 'demo-session') {
      setState((prev) => ({ ...prev, status: 'welcome', sessionId: 'demo-session' }));
      return;
    }

    if (!state.lessonId || !state.token) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Missing lessonId or token in URL parameters.',
      }));
      return;
    }

    try {
      const sessionId = await startGameSession(state.lessonId, state.token);
      setState((prev) => ({ ...prev, status: 'welcome', sessionId }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err.message || 'Failed to start a new game session.',
      }));
    }
  }, [state.lessonId, state.sessionId, state.token]);

  const loadDemoMode = useCallback(() => {
    const demoQuestions = getShuffledQuestions().slice(0, 4);
    setState({
      ...makeInitialState(),
      status: 'welcome',
      questions: demoQuestions,
      sessionId: 'demo-session',
      token: 'demo-token',
    });
  }, []);

  return {
    state,
    currentQuestion,
    totalQuestions,
    startGame,
    playerAnswer,
    nextQuestion,
    returnToWelcome,
    loadDemoMode,
  };
}
