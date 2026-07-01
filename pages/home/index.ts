import { fetchActivityPosts } from "../../services/activities";
import { ActivityPost } from "../../types/domain";

Page({
  data: {
    activities: [] as ActivityPost[]
  },

  async onLoad() {
    const activities = await fetchActivityPosts();
    this.setData({ activities });
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
