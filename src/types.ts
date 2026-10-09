// Game Data Types

export interface Option {
  text: string;
  imageUrl: string | null;
  audioUrl?: string | null;
}

export interface Question {
  id: number | string;
  questionText: string;
  imageUrl: string | null;
  imageEmoji: string;       // fallback emoji if image fails
  imageAlt: string;
  options: Option[];        // up to 4 options
  correctIndex: number;     // 0-3
  audioText: string;        // text to speak when audio button clicked
  apiAudioUrl: string | null; // url to audio file from API
  category: string;
}

export type GameStatus = 'loading' | 'error' | 'playing' | 'game-over';

export type Phase =
  | 'player-turn'       // waiting for player to answer
  | 'computer-turn'     // player answered; waiting for the computer
  | 'result'            // showing correct answer
  | 'game-over';

import { UserProfile } from './services/api';

export type AnswerResult = 'correct' | 'wrong' | 'timeout' | 'hakim-faster' | null;

export interface GameState {
  status: 'loading' | 'welcome' | 'playing' | 'game-over' | 'error';
  lessonId: string | null;
  token: string | null;
  sessionId: string | null;
  error: string | null;
  currentQuestionIndex: number;
  computerQuestionIndex: number;
  playerFinished: boolean;
  questions: Question[];
  phase: Phase;
  playerScore: number;
  computerScore: number;
  playerAnswerIndex: number | null;
  computerAnswerIndex: number | null;
  playerResult: AnswerResult;
  computerResult: AnswerResult;
  answersList: { questionId: number; selectedAnswer: string; timeTaken: number }[];
  finalStats: any | null; // FinalStats from API
  userProfile?: UserProfile | null;
}

