const STUDENT_API_BASE = 'https://learning-platform-1euu.onrender.com/api/v1';
const USER_API_BASE = 'https://learning-platform-1euu.onrender.com/api/v1';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://learning-platform-1euu.onrender.com';
const BASE_URL = `${API_URL}/api/v1`;
const GAME_ID = 13;

export type AuthType = 'student' | 'user' | null;

export interface UserProfile {
  avatarUrl: string | null;
  accessoryUrl: string | null;
  profileImage?: string | null;
  name?: string | null;
  role?: string | null;
  authType?: AuthType;
}

let latestToken: string | null = null;
let currentAuthType: AuthType = null;
let cachedUserProfile: UserProfile | null = null;

// Mutex / in-flight refresh promise
let refreshPromise: Promise<string | null> | null = null;
let lastRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 4000;

// Mutex / in-flight profile promise
let userProfilePromise: Promise<UserProfile | null> | null = null;

// Subscribers
type ProfileSubscriber = (profile: UserProfile | null) => void;
const profileSubscribers = new Set<ProfileSubscriber>();

export const subscribeUserProfile = (sub: ProfileSubscriber) => {
  profileSubscribers.add(sub);
  if (cachedUserProfile) {
    sub(cachedUserProfile);
  }
  return () => {
    profileSubscribers.delete(sub);
  };
};

export const getUserProfile = (): UserProfile | null => {
  return cachedUserProfile;
};

const notifySubscribers = (profile: UserProfile | null) => {
  cachedUserProfile = profile;
  profileSubscribers.forEach((sub) => {
    try {
      sub(profile);
    } catch (err) {
      console.error('Error notifying profile subscriber:', err);
    }
  });
};

export const fetchUserProfile = async (
  token?: string | null,
  forcedAuthType?: AuthType
): Promise<UserProfile | null> => {
  const effectiveToken = token || latestToken;
  if (!effectiveToken) return null;

  if (userProfilePromise) {
    return userProfilePromise;
  }

  userProfilePromise = (async () => {
    try {
      const authTypeToUse = forcedAuthType || currentAuthType;

      const tryFetchStudent = async (): Promise<UserProfile | null> => {
        const studentUrls = Array.from(new Set([
          `${STUDENT_API_BASE}/auth/me/child`,
          `${BASE_URL}/auth/me/child`,
        ]));

        for (const url of studentUrls) {
          try {
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${effectiveToken}`,
                Accept: 'application/json',
              },
              credentials: 'include',
            });
            if (res.ok) {
              const json = await res.json();
              const child = json?.data?.child;
              if (child) {
                const avatarUrl = child?.currentAvatar?.avatarUrl || child?.profileImage || null;
                const accessoryUrl = child?.currentAccessory?.accessoryUrl || null;
                const name = child?.firstName || child?.username || null;
                return {
                  avatarUrl,
                  accessoryUrl,
                  profileImage: child?.profileImage || null,
                  name,
                  role: child?.role || 'STUDENT',
                  authType: 'student',
                };
              }
            }
          } catch (e) {
            // try next url
          }
        }
        return null;
      };

      const tryFetchUser = async (): Promise<UserProfile | null> => {
        const userUrls = Array.from(new Set([
          `${USER_API_BASE}/auth/me`,
          `${BASE_URL}/auth/me`,
        ]));

        for (const url of userUrls) {
          try {
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${effectiveToken}`,
                Accept: 'application/json',
              },
              credentials: 'include',
            });
            if (res.ok) {
              const json = await res.json();
              const user = json?.data?.user;
              if (user) {
                const avatarUrl = user?.profileImage || null;
                const name = user?.firstName || null;
                return {
                  avatarUrl,
                  accessoryUrl: null,
                  profileImage: user?.profileImage || null,
                  name,
                  role: user?.role || 'SUPERVISOR',
                  authType: 'user',
                };
              }
            }
          } catch (e) {
            // try next url
          }
        }
        return null;
      };

      // 1. If authType is known as student
      if (authTypeToUse === 'student') {
        const studentProfile = await tryFetchStudent();
        if (studentProfile) {
          notifySubscribers(studentProfile);
          return studentProfile;
        }
      }

      // 2. If authType is known as user
      if (authTypeToUse === 'user') {
        const userProfile = await tryFetchUser();
        if (userProfile) {
          notifySubscribers(userProfile);
          return userProfile;
        }
      }

      // 3. Fallback when authType is not yet known (e.g. token came from URL)
      const studentFallback = await tryFetchStudent();
      if (studentFallback) {
        currentAuthType = 'student';
        notifySubscribers(studentFallback);
        return studentFallback;
      }

      const userFallback = await tryFetchUser();
      if (userFallback) {
        currentAuthType = 'user';
        notifySubscribers(userFallback);
        return userFallback;
      }

      return null;
    } finally {
      userProfilePromise = null;
    }
  })();

  return userProfilePromise;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  if (latestToken && Date.now() - lastRefreshTime < REFRESH_COOLDOWN_MS) {
    return latestToken;
  }

  refreshPromise = (async () => {
    try {
      lastRefreshTime = Date.now();
      let newToken: string | null = null;
      let usedAuthType: AuthType = null;

      // 1. Try student refresh first
      const studentRefreshUrls = Array.from(new Set([
        `${STUDENT_API_BASE}/student/refresh`,
        `${BASE_URL}/student/refresh`,
      ]));

      for (const url of studentRefreshUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: "{}",
          });
          if (res.ok) {
            const data = await res.json();
            newToken = data?.data?.accessToken || data?.data?.token || data?.accessToken || data?.token || null;
            if (newToken) {
              usedAuthType = 'student';
              console.log("Student token refreshed successfully.");
              break;
            }
          }
        } catch (err) {
          console.warn(`Student refresh failed on ${url}:`, err);
        }
      }

      // 2. If student refresh failed, try user/supervisor refresh
      if (!newToken) {
        const userRefreshUrls = Array.from(new Set([
          `${USER_API_BASE}/auth/refresh`,
          `${BASE_URL}/auth/refresh`,
        ]));

        for (const url of userRefreshUrls) {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: "{}",
            });
            if (res.ok) {
              const data = await res.json();
              newToken = data?.data?.accessToken || data?.data?.token || data?.accessToken || data?.token || null;
              if (newToken) {
                usedAuthType = 'user';
                console.log("User token refreshed successfully.");
                break;
              }
            }
          } catch (err) {
            console.warn(`User refresh failed on ${url}:`, err);
          }
        }
      }

      if (newToken) {
        latestToken = newToken;
        currentAuthType = usedAuthType;

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('token')) urlParams.set('token', newToken);
        if (urlParams.has('accesstoken')) urlParams.set('accesstoken', newToken);
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState(null, '', newUrl);

        fetchUserProfile(newToken, usedAuthType).catch((e) => console.error(e));
        return newToken;
      } else {
        console.warn("Token refresh failed on all endpoints.");
        return null;
      }
    } catch (err) {
      console.error("Error during token refresh", err);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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
