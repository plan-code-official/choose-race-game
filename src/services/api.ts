const BASE_URL = 'https://learning-platform-1euu.onrender.com/api/v1/student/games';
const GAME_ID = 13;

export interface ApiQuestion {
  id: number;
  question: string;
  options: { text: string; imageUrl: string | null }[];
  correctAnswer: string;
  points: number;
  timeLimit: number;
  order: number;
  hint: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
}

export interface FinalStats {
  score: number;
  percentage: number;
  stars: number;
  coins: number;
  experience: number;
}

export async function fetchQuestions(lessonId: string, token: string): Promise<ApiQuestion[]> {
  const res = await fetch(`${BASE_URL}/${GAME_ID}/questions?lessonId=${lessonId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch questions');
  return json.data.questions;
}

export async function startGameSession(lessonId: string, token: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/${GAME_ID}/sessions?lessonId=${lessonId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to start session');
  return json.data.id;
}

export async function submitAnswers(
  sessionId: string,
  answers: { questionId: number; selectedAnswer: string; timeTaken: number }[],
  token: string
) {
  // If answers array is empty, submit a dummy answer to prevent 400 Validation Error as requested
  if (answers.length === 0) {
    answers = [{ questionId: 0, selectedAnswer: 'Timeout', timeTaken: 0 }];
  }

  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/submit-answers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to submit answers');
  return json.message;
}

export async function completeSession(sessionId: string, token: string): Promise<FinalStats> {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to complete session');
  return json.data;
}
