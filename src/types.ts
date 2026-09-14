// Game Data Types

export interface Option {
  text: string;
  imageUrl: string | null;
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
  | 'result'            // showing correct answer
  | 'game-over';

export type AnswerResult = 'correct' | 'wrong' | 'timeout' | null;

export interface GameState {
  status: GameStatus;
  lessonId: string | null;
  token: string | null;
  sessionId: string | null;
  error: string | null;
  currentQuestionIndex: number;
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
}
