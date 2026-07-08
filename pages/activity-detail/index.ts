import { getActivityPost } from "../../services/activities";
import { ActivityPost } from "../../types/domain";

Page({
  data: {
    activity: undefined as ActivityPost | undefined,
    errorMessage: ""
  },

  async onLoad(query: Record<string, string | undefined>) {
    try {
      const activity = await getActivityPost(query.id || "");
      if (!activity) {
        const errorMessage = "活动不存在";
        this.setData({ errorMessage });
        wx.showToast({ title: errorMessage, icon: "none" });
        return;
      }

      this.setData({ activity });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "活动数据暂时不可用，请稍后重试。";
      this.setData({ errorMessage });
      wx.showToast({ title: errorMessage, icon: "none" });
    }
  },

  goAssistant() {
    wx.navigateTo({ url: "/pages/assistant/index" });
  }
});
