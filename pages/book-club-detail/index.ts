import {
  AudioTrack,
  getAudioPlaybackSnapshot,
  pauseAudio,
  playAudioTrack,
  seekAudio,
  seekAudioBy,
  setAudioPlaybackRate,
  subscribeAudioPlayback
} from "../../services/backgroundAudio";
import {
  fetchBookExperience,
  fetchResourceAccess,
  fetchResourceProgress
} from "../../services/bookContent";
import { Book, BookContentResource } from "../../types/domain";

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function accessLabel(book: Book) {
  if (book.access.authorized) return "已开通";
  const labels = {
    guest: "请先登录",
    unauthorized: "待管理员开通",
    paused: "权限已暂停",
    expired: "权限已到期",
    revoked: "权限已撤销"
  } as const;
  return labels[book.access.status as keyof typeof labels] || "暂不可用";
}

Page({
  data: {
    bookId: "",
    book: null as Book | null,
    audioResources: [] as BookContentResource[],
    videoResources: [] as BookContentResource[],
    ebookResources: [] as BookContentResource[],
    loading: false,
    loadingResourceId: "",
    errorMessage: "",
    accessLabel: "",
    currentResourceId: "",
    playerTitle: "尚未选择音频",
    playerPlaying: false,
    playerWaiting: false,
    playerCurrentTime: 0,
    playerDuration: 0,
    playerSliderMax: 1,
    playerCurrentTimeLabel: "00:00",
    playerDurationLabel: "00:00",
    playbackRate: 1,
    playbackRates: [0.75, 1, 1.25, 1.5, 1.75, 2],
    playerErrorMessage: "",
    selectedVideoUrl: "",
    selectedVideoTitle: ""
  },

  unsubscribeAudio: null as (() => void) | null,

  async onLoad(query: Record<string, string | undefined>) {
    const bookId = decodeURIComponent(query.id || "");
    this.setData({ bookId });
    this.unsubscribeAudio = subscribeAudioPlayback((player) => {
      this.setData({
        currentResourceId: player.track?.resourceId || "",
        playerTitle: player.track?.title || "尚未选择音频",
        playerPlaying: player.playing,
        playerWaiting: player.waiting,
        playerCurrentTime: Math.floor(player.currentTime),
        playerDuration: Math.floor(player.duration),
        playerSliderMax: Math.max(1, Math.floor(player.duration)),
        playerCurrentTimeLabel: formatTime(player.currentTime),
        playerDurationLabel: formatTime(player.duration),
        playbackRate: player.playbackRate,
        playerErrorMessage: player.errorMessage
      });
    });
    await this.loadBook();
  },

  async onShow() {
    if (this.data.bookId && this.data.book) await this.loadBook();
  },

  onUnload() {
    this.unsubscribeAudio?.();
    this.unsubscribeAudio = null;
  },

  async loadBook() {
    if (!this.data.bookId) {
      this.setData({ errorMessage: "书籍不存在。" });
      return;
    }

    this.setData({ loading: true, errorMessage: "" });
    try {
      const book = await fetchBookExperience(this.data.bookId);
      this.setData({
        book,
        accessLabel: accessLabel(book),
        audioResources: book.resources.filter((resource) => resource.type === "audio"),
        videoResources: book.resources.filter((resource) => resource.type === "video"),
        ebookResources: book.resources.filter((resource) => resource.type === "ebook")
      });
      wx.setNavigationBarTitle({ title: book.title });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "书籍信息暂时不可用，请稍后重试。";
      this.setData({ errorMessage });
      wx.showToast({ title: errorMessage, icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  goMy() {
    wx.switchTab({ url: "/pages/about/index" });
  },

  async playAudio(event: WechatMiniprogram.TouchEvent) {
    const resourceId = String(event.currentTarget.dataset.id || "");
    const book = this.data.book;
    const resource = this.data.audioResources.find((item) => item.id === resourceId);
    if (!book || !resource) return;

    if (!book.access.authorized) {
      wx.showToast({ title: book.access.message, icon: "none" });
      return;
    }
    if (resource.status !== "published") {
      wx.showToast({ title: "音频内容待管理员上传。", icon: "none" });
      return;
    }

    const currentPlayer = getAudioPlaybackSnapshot();
    if (currentPlayer.track?.resourceId === resource.id) {
      if (currentPlayer.playing) {
        pauseAudio();
      } else {
        await playAudioTrack(currentPlayer.track);
      }
      return;
    }

    this.setData({ loadingResourceId: resource.id });
    try {
      const access = await fetchResourceAccess(resource.id);
      if (!access.authorized || !access.url) {
        throw new Error(access.message || "当前无法访问该音频。");
      }
      const progress = await fetchResourceProgress(resource.id).catch(() => ({
        resourceId: resource.id,
        positionSeconds: resource.progressSeconds || 0,
        durationSeconds: resource.durationSeconds,
        completed: Boolean(resource.completed)
      }));
      const track: AudioTrack = {
        resourceId: resource.id,
        bookId: book.id,
        title: resource.title,
        bookTitle: book.title,
        authorName: book.author.name,
        url: access.url,
        coverUrl: resource.coverUrl || book.coverUrl,
        durationSeconds: progress.durationSeconds || resource.durationSeconds,
        progressSeconds: progress.positionSeconds
      };
      await playAudioTrack(track);
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "音频暂时无法播放。", icon: "none" });
    } finally {
      this.setData({ loadingResourceId: "" });
    }
  },

  pauseAudio() {
    pauseAudio();
  },

  seekBackward() {
    seekAudioBy(-15);
  },

  seekForward() {
    seekAudioBy(15);
  },

  onSeek(event: WechatMiniprogram.CustomEvent<{ value: number }>) {
    seekAudio(Number(event.detail.value || 0));
  },

  changeRate(event: WechatMiniprogram.TouchEvent) {
    setAudioPlaybackRate(Number(event.currentTarget.dataset.rate || 1));
  },

  async openVideo(event: WechatMiniprogram.TouchEvent) {
    await this.openProtectedResource(String(event.currentTarget.dataset.id || ""), "video");
  },

  async openEbook(event: WechatMiniprogram.TouchEvent) {
    await this.openProtectedResource(String(event.currentTarget.dataset.id || ""), "ebook");
  },

  async openProtectedResource(resourceId: string, type: "video" | "ebook") {
    const book = this.data.book;
    const source = type === "video" ? this.data.videoResources : this.data.ebookResources;
    const resource = source.find((item) => item.id === resourceId);
    if (!book || !resource) return;
    if (!book.access.authorized) {
      wx.showToast({ title: book.access.message, icon: "none" });
      return;
    }
    if (resource.status !== "published") {
      wx.showToast({ title: type === "video" ? "视频内容待管理员上传。" : "原书内容待管理员上传。", icon: "none" });
      return;
    }

    this.setData({ loadingResourceId: resource.id });
    try {
      const access = await fetchResourceAccess(resource.id);
      if (!access.authorized || !access.url) throw new Error(access.message || "当前无法访问该资源。");
      if (type === "video") {
        this.setData({ selectedVideoUrl: access.url, selectedVideoTitle: resource.title });
        return;
      }

      wx.showLoading({ title: "正在打开原书" });
      const download = await new Promise<WechatMiniprogram.DownloadFileSuccessCallbackResult>((resolve, reject) => {
        wx.downloadFile({ url: access.url!, success: resolve, fail: reject });
      });
      if (download.statusCode < 200 || download.statusCode >= 300) throw new Error("原书下载失败。");
      await new Promise<void>((resolve, reject) => {
        wx.openDocument({
          filePath: download.tempFilePath,
          fileType: "pdf",
          showMenu: false,
          success: () => resolve(),
          fail: reject
        });
      });
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "资源暂时无法打开。", icon: "none" });
    } finally {
      wx.hideLoading();
      this.setData({ loadingResourceId: "" });
    }
  }
});
