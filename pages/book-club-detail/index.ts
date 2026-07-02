import { getBookClubCourse, submitBookClubSignup } from "../../services/bookClub";
import { BookClubCourse } from "../../types/domain";

Page({
  data: {
    course: undefined as BookClubCourse | undefined,
    name: "",
    phone: "",
    participantCount: "1",
    note: "",
    submitting: false
  },

  async onLoad(query: Record<string, string | undefined>) {
    const course = await getBookClubCourse(query.id || "");
    if (!course) {
      wx.showToast({ title: "课程不存在", icon: "none" });
      return;
    }

    this.setData({ course });
  },

  onNameChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ name: event.detail.value });
  },

  onPhoneChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ phone: event.detail.value });
  },

  onCountChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ participantCount: event.detail.value });
  },

  onNoteChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ note: event.detail.value });
  },

  async submitSignup() {
    if (!this.data.course) return;

    if (!this.data.name.trim() || !/^1\d{10}$/.test(this.data.phone.trim())) {
      wx.showToast({ title: "请填写姓名和手机号", icon: "none" });
      return;
    }

    const participantCount = Number(this.data.participantCount || 1);
    if (!Number.isFinite(participantCount) || participantCount < 1 || participantCount > 20) {
      wx.showToast({ title: "人数需为 1 到 20", icon: "none" });
      return;
    }

    this.setData({ submitting: true });
    try {
      const course = await submitBookClubSignup(this.data.course, {
        name: this.data.name.trim(),
        phone: this.data.phone.trim(),
        participantCount: Math.round(participantCount),
        note: this.data.note.trim()
      });
      if (course) this.setData({ course });
      wx.showToast({ title: "读书会报名已提交", icon: "success" });
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "报名提交失败", icon: "none" });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
