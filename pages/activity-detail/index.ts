import { getActivityPost } from "../../services/activities";
import { ActivityPost } from "../../types/domain";

Page({
  data: {
    activity: undefined as ActivityPost | undefined
  },

  async onLoad(query: Record<string, string | undefined>) {
    const activity = await getActivityPost(query.id || "");
    if (!activity) {
      wx.showToast({ title: "活动不存在", icon: "none" });
      return;
    }

    this.setData({ activity });
  },

  goAssistant() {
    wx.navigateTo({ url: "/pages/assistant/index" });
  }
});
