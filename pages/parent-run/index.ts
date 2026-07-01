import { fetchParentRunEvents } from "../../services/parentRun";
import { ParentRunEvent } from "../../types/domain";

Page({
  data: {
    events: [] as ParentRunEvent[]
  },

  async onLoad() {
    const events = await fetchParentRunEvents();
    this.setData({ events });
  },

  goDetail(event: WechatMiniprogram.TouchEvent) {
    const eventId = event.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/pages/parent-run-detail/index?id=${eventId}` });
  }
});
