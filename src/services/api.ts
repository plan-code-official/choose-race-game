const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://learning-platform-1euu.onrender.com';
const BASE_URL = `${API_URL}/api/v1`;
const GAME_ID = 13;

let latestToken: string | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    let refreshRes = await fetch(`${BASE_URL}/student/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: "{}"
    });

    if (!refreshRes.ok) {
      refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: "{}"
      });
    }

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      const newToken = refreshData?.data?.accessToken || refreshData?.data?.token || refreshData?.accessToken || refreshData?.token;
      if (newToken) {
        console.log("Token refreshed successfully.");
        latestToken = newToken;

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('token')) urlParams.set('token', newToken);
        if (urlParams.has('accesstoken')) urlParams.set('accesstoken', newToken);
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState(null, '', newUrl);

        return newToken;
      }
    } else {
      console.error("Token refresh failed on both endpoints with status", refreshRes.status);
    }
  } catch (err) {
    console.error("Error during token refresh", err);
  }
  return null;
};

const apiFetch = async (url: string, options: RequestInit = {}, initialToken: string | null = null) => {
  if (!latestToken && initialToken) {
    latestToken = initialToken;
  }
  if (!latestToken && !initialToken) {
    await refreshAccessToken();
  }

  const currentToken = latestToken || initialToken;
  const fetchOptions = { ...options };
  if (currentToken) {
    fetchOptions.headers = { ...(fetchOptions.headers || {}), Authorization: `Bearer ${currentToken}` };
  }

  let res = await fetch(url, fetchOptions);

  if (res.status === 401) {
    console.warn("401 Unauthorized encountered. Attempting to refresh token...");
    const newToken = await refreshAccessToken();
    if (newToken) {
      fetchOptions.headers = { ...(fetchOptions.headers || {}), Authorization: `Bearer ${newToken}` };
      res = await fetch(url, fetchOptions);
    }
  }
  
  return res;
};

export interface ApiQuestion {
  id: number;
  question: string;
  options: { text: string; imageUrl: string | null; audioUrl?: string | null }[];
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
  const res = await apiFetch(`${BASE_URL}/student/games/${GAME_ID}/questions?lessonId=${lessonId}`, {}, token);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch questions');
  return json.data.questions;
}

export async function startGameSession(lessonId: string, token: string): Promise<string> {
  const res = await apiFetch(`${BASE_URL}/student/games/${GAME_ID}/sessions?lessonId=${lessonId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }, token);
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

  const res = await apiFetch(`${BASE_URL}/student/games/sessions/${sessionId}/submit-answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  }, token);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to submit answers');
  return json.message;
}

export async function completeSession(sessionId: string, token: string): Promise<FinalStats> {
  const res = await apiFetch(`${BASE_URL}/student/games/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }, token);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to complete session');
  return json.data;
}
