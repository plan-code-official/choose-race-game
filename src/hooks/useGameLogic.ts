import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Question } from '../types';
import { fetchQuestions, startGameSession, submitAnswers, completeSession, ApiQuestion, fetchUserProfile, subscribeUserProfile, getUserProfile, UserProfile } from '../services/api';
import { getShuffledQuestions } from '../data/questions';
import {
  playCorrectSound,
  playWrongSound,
  playWinSound,
  playLoseSound,
} from '../utils/tts';
import { preloadQuestionAssets } from '../utils/preloadAssets';

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
    userProfile: null,
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
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    audioText: q.audioUrl || q.question,
    apiAudioUrl: q.audioUrl || q.options?.find((option) => option.audioUrl)?.audioUrl || null,
    category: 'api',
  };
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>(makeInitialState);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getUserProfile());
  const questionStartTime = useRef<number>(0);
  const completionStarted = useRef(false);
  const robotTimerRef = useRef<number | null>(null);

  // Subscribe to user profile updates
  useEffect(() => {
    const unsubscribe = subscribeUserProfile((profile) => {
      setUserProfile(profile);
      setState((prev) => ({ ...prev, userProfile: profile }));
    });
    return unsubscribe;
  }, []);

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
        void fetchUserProfile(token || undefined);
        const apiQuestions = await fetchQuestions(lessonId, token || '');
        if (!apiQuestions || apiQuestions.length === 0) {
          throw new Error('لم يتم العثور على أي أسئلة لهذا الدرس.');
        }
        preloadQuestionAssets(apiQuestions);
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
    setState((prev) => ({
      ...prev,
      status: 'playing',
      phase: 'player-turn',
      currentQuestionIndex: 0,
      computerQuestionIndex: 0,
      playerScore: 0,
      computerScore: 0,
      playerAnswerIndex: null,
      computerAnswerIndex: null,
      playerResult: null,
      computerResult: null,
      playerFinished: false,
      answersList: [],
      error: null,
    }));
    questionStartTime.current = Date.now();
  }, []);

  // ── Hakim (Robot) answers first when timer fires ───────────────────────────
  const handleHakimAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing' || prev.phase !== 'player-turn') return prev;
      const q = prev.questions[prev.currentQuestionIndex];
      if (!q) return prev;

      const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);
      playWrongSound();

      return {
        ...prev,
        phase: 'result',
        computerAnswerIndex: q.correctIndex,
        playerAnswerIndex: null,
        playerResult: 'hakim-faster',
        computerScore: prev.computerScore + 1,
        computerQuestionIndex: prev.currentQuestionIndex,
        answersList: [
          ...prev.answersList,
          { questionId: q.id as number, selectedAnswer: 'N/A', timeTaken },
        ],
      };
    });
  }, []);

  // ── Robot race timer per question (between 3 and 8 seconds) ───────────────
  useEffect(() => {
    if (state.status !== 'playing' || state.phase !== 'player-turn' || !currentQuestion) {
      if (robotTimerRef.current) {
        window.clearTimeout(robotTimerRef.current);
        robotTimerRef.current = null;
      }
      return;
    }

    // Randomized duration between 3.0s and 8.0s
    const robotDurationMs = 3000 + Math.random() * 5000;

    robotTimerRef.current = window.setTimeout(() => {
      robotTimerRef.current = null;
      handleHakimAnswer();
    }, robotDurationMs);

    return () => {
      if (robotTimerRef.current) {
        window.clearTimeout(robotTimerRef.current);
        robotTimerRef.current = null;
      }
    };
  }, [state.status, state.phase, state.currentQuestionIndex, currentQuestion, handleHakimAnswer]);

  // ── Player answers ────────────────────────────────────────────────────────
  const playerAnswer = useCallback(
    (optionIndex: number) => {
      if (state.phase !== 'player-turn' || !currentQuestion) return;

      // Player answered before robot -> cancel robot timer immediately!
      if (robotTimerRef.current) {
        window.clearTimeout(robotTimerRef.current);
        robotTimerRef.current = null;
      }

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
        computerAnswerIndex: null,
        playerResult: pCorrect ? 'correct' : 'wrong',
        // User gets point if right; 0 points/coins if wrong
        playerScore: pCorrect ? prev.playerScore + 1 : prev.playerScore,
        answersList: [
          ...prev.answersList,
          { questionId: q.id as number, selectedAnswer, timeTaken },
        ],
      }));
    },
    [state.phase, currentQuestion]
  );

  // ── Advance to next question ───────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev;

      if (prev.currentQuestionIndex + 1 >= prev.questions.length) {
        return {
          ...prev,
          phase: 'game-over',
          playerFinished: true,
        };
      }

      const nextIndex = prev.currentQuestionIndex + 1;
      questionStartTime.current = Date.now();

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        computerQuestionIndex: nextIndex,
        phase: 'player-turn',
        playerAnswerIndex: null,
        computerAnswerIndex: null,
        playerResult: null,
        computerResult: null,
      };
    });
  }, []);

  // ── Auto-advance after showing result ──────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'result') return;

    // Give user 2.5s when Hakim answers faster so they can comfortably see the question and right answer
    const delayMs = state.playerResult === 'hakim-faster' ? 2500 : 1300;

    const timer = window.setTimeout(nextQuestion, delayMs);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.playerResult, nextQuestion]);

  // ── Complete Game Sequence ─────────────────────────────────────────────────
  const completeGame = useCallback(async () => {
    if (
      state.status !== 'playing' ||
      state.phase !== 'game-over' ||
      completionStarted.current
    ) return;

    completionStarted.current = true;
    setState((prev) => ({ ...prev, status: 'loading' }));

    const searchParams = new URLSearchParams(window.location.search);
    const effectiveToken = state.token || searchParams.get('token') || searchParams.get('accesstoken') || '';

    try {
      let finalStats = null;
      if (state.sessionId === 'demo-session' || !state.sessionId) {
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
        await submitAnswers(state.sessionId, state.answersList, effectiveToken);
        finalStats = await completeSession(state.sessionId, effectiveToken);
      }

      if (state.playerScore > state.computerScore) playWinSound();
      else if (state.computerScore > state.playerScore) playLoseSound();

      setState((prev) => ({ ...prev, status: 'game-over', phase: 'game-over', finalStats }));
    } catch (err: any) {
      console.warn('Failed to submit game results to server, falling back to local stats:', err);
      const totalQ = Math.max(1, state.questions.length);
      const pct = Math.round((state.playerScore / totalQ) * 100);
      const fallbackStats = {
        score: pct,
        percentage: pct,
        stars: pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0,
        coins: state.playerScore * 2,
        experience: state.playerScore * 10,
      };

      if (state.playerScore > state.computerScore) playWinSound();
      else if (state.computerScore > state.playerScore) playLoseSound();

      setState((prev) => ({ ...prev, status: 'game-over', phase: 'game-over', finalStats: fallbackStats }));
    }
  }, [state.status, state.phase, state.sessionId, state.answersList, state.token, state.playerScore, state.computerScore, state.questions.length]);

  useEffect(() => {
    if (state.status === 'playing' && state.phase === 'game-over') {
      void completeGame();
    }
  }, [state.status, state.phase, completeGame]);

  // Return to welcome screen with fresh server session
  const returnToWelcome = useCallback(async () => {
    completionStarted.current = false;
    if (robotTimerRef.current) {
      window.clearTimeout(robotTimerRef.current);
      robotTimerRef.current = null;
    }

    questionStartTime.current = 0;

    const searchParams = new URLSearchParams(window.location.search);
    const effectiveLessonId = state.lessonId || searchParams.get('lessonId') || '';
    const effectiveToken = state.token || searchParams.get('token') || searchParams.get('accesstoken') || '';

    // Immediately restore welcome screen and reset game state
    setState((prev) => ({
      ...prev,
      status: 'welcome',
      phase: 'player-turn',
      error: null,
      currentQuestionIndex: 0,
      computerQuestionIndex: 0,
      playerFinished: false,
      playerScore: 0,
      computerScore: 0,
      playerAnswerIndex: null,
      computerAnswerIndex: null,
      playerResult: null,
      computerResult: null,
      answersList: [],
      finalStats: null,
      lessonId: effectiveLessonId || prev.lessonId,
      token: effectiveToken || prev.token,
    }));

    if (state.sessionId === 'demo-session') {
      return;
    }

    // Attempt to start a fresh server session in the background
    if (effectiveLessonId) {
      try {
        const newSessionId = await startGameSession(effectiveLessonId, effectiveToken);
        if (newSessionId) {
          setState((prev) => ({ ...prev, sessionId: newSessionId }));
        }
      } catch (err: any) {
        console.warn('Could not start new server session on retry, keeping existing session:', err);
      }
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
    userProfile,
    currentQuestion,
    totalQuestions,
    startGame,
    playerAnswer,
    nextQuestion,
    returnToWelcome,
    loadDemoMode,
  };
}

