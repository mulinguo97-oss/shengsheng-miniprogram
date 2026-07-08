import { getParentRunEvent, submitParentRunGuestSignup } from "../../services/parentRun";
import { ParentRunEvent } from "../../types/domain";

Page({
  data: {
    event: undefined as ParentRunEvent | undefined,
    errorMessage: "",
    parentName: "",
    phone: "",
    childAge: "",
    participantCount: "2",
    note: "",
    submitting: false
  },

  async onLoad(query: Record<string, string | undefined>) {
    try {
      const event = await getParentRunEvent(query.id || "");
      if (!event) {
        const errorMessage = "活动不存在";
        this.setData({ errorMessage });
        wx.showToast({ title: errorMessage, icon: "none" });
        return;
      }

      this.setData({ event });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "跑团数据暂时不可用，请稍后重试。";
      this.setData({ errorMessage });
      wx.showToast({ title: errorMessage, icon: "none" });
    }
  },

  onParentNameChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ parentName: event.detail.value });
  },

  onPhoneChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ phone: event.detail.value });
  },

  onChildAgeChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ childAge: event.detail.value });
  },

  onCountChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ participantCount: event.detail.value });
  },

  onNoteChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ note: event.detail.value });
  },

  async submitSignup() {
    if (this.data.submitting || !this.data.event) return;

    if (!this.data.parentName.trim() || !/^1\d{10}$/.test(this.data.phone.trim())) {
      wx.showToast({ title: "请填写家长姓名和手机号", icon: "none" });
      return;
    }

    const participantCount = Number(this.data.participantCount);
    if (!Number.isFinite(participantCount) || participantCount < 1 || participantCount > 20) {
      wx.showToast({ title: "报名人数需为 1 到 20 人", icon: "none" });
      return;
    }

    this.setData({ submitting: true });

    try {
      const event = await submitParentRunGuestSignup(this.data.event.id, {
        parentName: this.data.parentName.trim(),
        phone: this.data.phone.trim(),
        childAge: this.data.childAge.trim(),
        participantCount,
        note: this.data.note.trim()
      });

      if (event) this.setData({ event });
      wx.showToast({ title: "跑团报名已提交", icon: "success" });
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : "报名失败，请稍后重试",
        icon: "none"
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
