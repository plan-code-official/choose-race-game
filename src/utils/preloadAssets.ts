// Preload game assets for instant rendering (Welcome Screen, Celebration, Results Panel, Gameplay)
import bgImg from '../assets/BG.png';
import questionNumberBg from '../assets/QuestionNumber.png';
import questionCoinImg from '../assets/QuestionCoin.png';
import daddcoinImg from '../assets/daddcoin.webp';
import descriptionImg from '../assets/description.png';
import startButtonImg from '../assets/startButton.png';
import exitButtonImg from '../assets/Exit1.png';
import user1Img from '../assets/user1.png';
import user2Img from '../assets/user2.png';
import exitBtnSvg from '../assets/ExitButton.svg';
import answerImg from '../assets/answer.png';
import error404Img from '../assets/404.png';

// Celebration assets
import celebrationRobotsImg from '../../Celebration/Celebration/assets/celbr.png';
import fireworksAudioUrl from '../../Celebration/Celebration/fireworks.mp3';

// Results panel assets
import resultsPanelArt from '../assets/results-panel-empty.png';
import celebrationTitleImg from '../../ResultsPanel/ResultsPanel/assets/good.png';
import retryButtonImg from '../assets/retry.png';

/**
 * Preloads a single image and decodes it into memory if supported
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    img.src = url;
    if (typeof img.decode === 'function') {
      img.decode().then(() => resolve()).catch(() => resolve());
    } else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });
}

/**
 * Preloads an audio file
 */
export function preloadAudio(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const audio = new Audio();
    audio.preload = 'auto';
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => resolve();
    audio.src = url;
    audio.load();
  });
}

export const CORE_ASSETS = {
  welcome: [
    bgImg,
    questionNumberBg,
    questionCoinImg,
    daddcoinImg,
    descriptionImg,
    startButtonImg,
    exitButtonImg,
    error404Img,
  ],
  gameplay: [
    user1Img,
    user2Img,
    exitBtnSvg,
    answerImg,
  ],
  celebration: {
    images: [celebrationRobotsImg],
    audio: [fireworksAudioUrl],
  },
  results: [
    resultsPanelArt,
    celebrationTitleImg,
    retryButtonImg,
    exitButtonImg,
  ],
};

/**
 * Preload all core screen assets ahead of time (Welcome Screen, Celebration, Results Panel)
 */
export async function preloadAllCoreAssets(): Promise<void> {
  try {
    const allImages = [
      ...CORE_ASSETS.welcome,
      ...CORE_ASSETS.gameplay,
      ...CORE_ASSETS.celebration.images,
      ...CORE_ASSETS.results,
    ];

    const imagePromises = allImages.map(preloadImage);
    const audioPromises = CORE_ASSETS.celebration.audio.map(preloadAudio);

    await Promise.allSettled([...imagePromises, ...audioPromises]);
  } catch (err) {
    console.warn('Asset preloading completed with minor issues:', err);
  }
}

/**
 * Preload dynamic question media (images & audio)
 */
export function preloadQuestionAssets(
  questions: Array<{ imageUrl?: string | null; audioUrl?: string | null; apiAudioUrl?: string | null; options?: Array<{ imageUrl?: string | null; audioUrl?: string | null }> }>
): void {
  for (const q of questions) {
    if (q.imageUrl) preloadImage(q.imageUrl);
    if (q.audioUrl) preloadAudio(q.audioUrl);
    if (q.apiAudioUrl && q.apiAudioUrl !== q.audioUrl) preloadAudio(q.apiAudioUrl);
    if (Array.isArray(q.options)) {
      for (const opt of q.options) {
        if (opt?.imageUrl) preloadImage(opt.imageUrl);
        if (opt?.audioUrl) preloadAudio(opt.audioUrl);
      }
    }
  }
}
