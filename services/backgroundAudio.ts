import {
  createPlaySession,
  finishPlaySession,
  PlayEventPayload,
  PlayEventType,
  reportPlayEvent,
  updateResourceProgress
} from "./bookContent";

export type AudioTrack = {
  resourceId: string;
  bookId: string;
  title: string;
  bookTitle: string;
  authorName: string;
  url: string;
  coverUrl: string;
  durationSeconds: number;
  progressSeconds: number;
};

export type AudioPlaybackSnapshot = {
  track: AudioTrack | null;
  playing: boolean;
  waiting: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  errorMessage: string;
};

type Listener = (snapshot: AudioPlaybackSnapshot) => void;

const listeners = new Set<Listener>();
let manager: WechatMiniprogram.BackgroundAudioManager | null = null;
let initialized = false;
let queue: AudioTrack[] = [];
let queueIndex = -1;
let currentTrack: AudioTrack | null = null;
let playSessionId = "";
let clientSessionId = "";
let eventSequence = 0;
let lastHeartbeatPosition = 0;
let reportedStart = false;
let snapshot: AudioPlaybackSnapshot = {
  track: null,
  playing: false,
  waiting: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  errorMessage: ""
};

function createClientId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getManager() {
  if (!manager) manager = wx.getBackgroundAudioManager();
  return manager;
}

function updateSnapshot(patch: Partial<AudioPlaybackSnapshot>) {
  snapshot = { ...snapshot, ...patch, track: currentTrack };
  listeners.forEach((listener) => listener(snapshot));
}

function getPosition() {
  const audioManager = getManager();
  return Math.max(0, Number(audioManager.currentTime || snapshot.currentTime || 0));
}

function getDuration() {
  const audioManager = getManager();
  return Math.max(0, Number(audioManager.duration || currentTrack?.durationSeconds || snapshot.duration || 0));
}

function buildEventPayload(eventType: PlayEventType): PlayEventPayload {
  eventSequence += 1;
  return {
    eventType,
    positionSeconds: getPosition(),
    durationSeconds: getDuration(),
    playbackRate: snapshot.playbackRate,
    occurredAt: new Date().toISOString(),
    clientEventId: `${clientSessionId || "audio"}-${eventSequence}`
  };
}

function reportProgress(eventType: PlayEventType) {
  if (!currentTrack || !playSessionId) return;
  const payload = buildEventPayload(eventType);
  const completed = eventType === "ended" || (payload.durationSeconds > 0 && payload.positionSeconds / payload.durationSeconds >= 0.9);

  void reportPlayEvent(playSessionId, payload).catch((error) => {
    console.warn("音频事件上报失败", error);
  });
  void updateResourceProgress(currentTrack.resourceId, {
    positionSeconds: payload.positionSeconds,
    durationSeconds: payload.durationSeconds,
    completed,
    occurredAt: payload.occurredAt,
    clientEventId: `${payload.clientEventId}-progress`
  }).catch((error) => {
    console.warn("音频进度同步失败", error);
  });
}

function finishCurrentSession(eventType: "ended" | "stop" | "error") {
  if (!currentTrack || !playSessionId) return;
  const sessionId = playSessionId;
  const payload = buildEventPayload(eventType);
  const completed = eventType === "ended" || (payload.durationSeconds > 0 && payload.positionSeconds / payload.durationSeconds >= 0.9);

  playSessionId = "";
  void finishPlaySession(sessionId, payload).catch((error) => {
    console.warn("音频会话结束上报失败", error);
  });
  void updateResourceProgress(currentTrack.resourceId, {
    positionSeconds: payload.positionSeconds,
    durationSeconds: payload.durationSeconds,
    completed,
    occurredAt: payload.occurredAt,
    clientEventId: `${payload.clientEventId}-progress`
  }).catch((error) => {
    console.warn("音频结束进度同步失败", error);
  });
}

async function startTrack(track: AudioTrack, nextQueue: AudioTrack[], nextIndex: number) {
  if (!track.url) throw new Error("音频内容尚未上传。");

  if (playSessionId && currentTrack?.resourceId !== track.resourceId) {
    finishCurrentSession("stop");
  }

  const audioManager = getManager();
  clientSessionId = createClientId("mini-audio");
  eventSequence = 0;
  lastHeartbeatPosition = Math.max(0, track.progressSeconds || 0);
  reportedStart = false;
  playSessionId = await createPlaySession(track.resourceId, clientSessionId, lastHeartbeatPosition);
  currentTrack = track;
  queue = nextQueue.length ? [...nextQueue] : [track];
  queueIndex = nextIndex >= 0 ? nextIndex : queue.findIndex((item) => item.resourceId === track.resourceId);

  updateSnapshot({
    track,
    playing: false,
    waiting: true,
    currentTime: lastHeartbeatPosition,
    duration: track.durationSeconds,
    errorMessage: ""
  });

  audioManager.title = track.title;
  audioManager.epname = track.bookTitle;
  audioManager.singer = track.authorName;
  audioManager.coverImgUrl = track.coverUrl;
  audioManager.webUrl = `https://shengshengcorp.com/book-club/${encodeURIComponent(track.bookId)}`;
  audioManager.referrerPath = `/pages/book-club-detail/index?id=${encodeURIComponent(track.bookId)}`;
  audioManager.startTime = lastHeartbeatPosition;
  audioManager.playbackRate = snapshot.playbackRate;
  audioManager.src = track.url;
}

function playAdjacent(offset: -1 | 1) {
  if (!queue.length || queueIndex < 0) return;
  const nextIndex = queueIndex + offset;
  const nextTrack = queue[nextIndex];
  if (!nextTrack) return;
  void startTrack(nextTrack, queue, nextIndex).catch((error) => {
    updateSnapshot({ errorMessage: error instanceof Error ? error.message : "切换音频失败。" });
  });
}

export function initializeBackgroundAudio() {
  if (initialized) return;
  initialized = true;
  const audioManager = getManager();

  audioManager.onPlay(() => {
    updateSnapshot({ playing: true, waiting: false, errorMessage: "" });
    if (reportedStart) {
      reportProgress("resume");
    } else {
      reportedStart = true;
      reportProgress("start");
    }
  });
  audioManager.onPause(() => {
    updateSnapshot({ playing: false, waiting: false, currentTime: getPosition(), duration: getDuration() });
    reportProgress("pause");
  });
  audioManager.onStop(() => {
    updateSnapshot({ playing: false, waiting: false, currentTime: getPosition(), duration: getDuration() });
    finishCurrentSession("stop");
  });
  audioManager.onEnded(() => {
    updateSnapshot({ playing: false, waiting: false, currentTime: getDuration(), duration: getDuration() });
    finishCurrentSession("ended");
    playAdjacent(1);
  });
  audioManager.onWaiting(() => updateSnapshot({ waiting: true }));
  audioManager.onCanplay(() => updateSnapshot({ waiting: false, duration: getDuration() }));
  audioManager.onTimeUpdate(() => {
    const currentTime = getPosition();
    updateSnapshot({ currentTime, duration: getDuration() });
    if (currentTime - lastHeartbeatPosition >= 15) {
      lastHeartbeatPosition = currentTime;
      reportProgress("heartbeat");
    }
  });
  audioManager.onSeeked(() => {
    const currentTime = getPosition();
    lastHeartbeatPosition = currentTime;
    updateSnapshot({ currentTime, duration: getDuration() });
    reportProgress("seek");
  });
  audioManager.onError((error) => {
    updateSnapshot({
      playing: false,
      waiting: false,
      errorMessage: error.errMsg || "音频播放失败。"
    });
    finishCurrentSession("error");
    currentTrack = null;
    updateSnapshot({ playing: false, waiting: false });
  });
  audioManager.onNext(() => playAdjacent(1));
  audioManager.onPrev(() => playAdjacent(-1));
}

export async function playAudioTrack(track: AudioTrack, tracks: AudioTrack[] = [track]) {
  initializeBackgroundAudio();
  if (currentTrack?.resourceId === track.resourceId && playSessionId) {
    getManager().play();
    return;
  }
  const index = Math.max(0, tracks.findIndex((item) => item.resourceId === track.resourceId));
  await startTrack(track, tracks, index);
}

export function pauseAudio() {
  getManager().pause();
}

export function seekAudio(positionSeconds: number) {
  getManager().seek(Math.max(0, Math.min(positionSeconds, getDuration() || positionSeconds)));
}

export function seekAudioBy(offsetSeconds: number) {
  seekAudio(getPosition() + offsetSeconds);
}

export function setAudioPlaybackRate(playbackRate: number) {
  const supportedRates = [0.75, 1, 1.25, 1.5, 1.75, 2];
  if (!supportedRates.includes(playbackRate)) return;
  getManager().playbackRate = playbackRate;
  updateSnapshot({ playbackRate });
}

export function subscribeAudioPlayback(listener: Listener) {
  initializeBackgroundAudio();
  listeners.add(listener);
  listener(snapshot);
  return () => listeners.delete(listener);
}

export function getAudioPlaybackSnapshot() {
  return snapshot;
}
