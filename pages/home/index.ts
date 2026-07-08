import { fetchActivityPosts } from "../../services/activities";
import { ActivityPost } from "../../types/domain";

Page({
  data: {
    activities: [] as ActivityPost[],
    loadingActivities: false,
    activityErrorMessage: ""
  },

  async onLoad() {
    await this.loadActivities();
  },

  async loadActivities() {
    this.setData({ loadingActivities: true, activityErrorMessage: "" });

    try {
      const activities = await fetchActivityPosts();
      this.setData({ activities });
    } catch (error) {
      const activityErrorMessage = error instanceof Error ? error.message : "活动数据暂时不可用，请稍后重试。";
      this.setData({ activities: [], activityErrorMessage });
      wx.showToast({ title: activityErrorMessage, icon: "none" });
    } finally {
      this.setData({ loadingActivities: false });
    }
  },

  goBookClub() {
    wx.switchTab({ url: "/pages/book-club/index" });
  },

  goParentRun() {
    wx.switchTab({ url: "/pages/parent-run/index" });
  },

  goAssistant() {
    wx.navigateTo({ url: "/pages/assistant/index" });
  },

  goActivityDetail(event: WechatMiniprogram.TouchEvent) {
    const id = event.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${id}` });
  }
});
