import { getBookClubCourse } from "../../services/bookClub";
import { BookClubCourse } from "../../types/domain";

Page({
  data: {
    course: undefined as BookClubCourse | undefined,
    name: "",
    phone: "",
    participantCount: "1",
    note: ""
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

  submitSignup() {
    if (!this.data.name.trim() || !/^1\d{10}$/.test(this.data.phone.trim())) {
      wx.showToast({ title: "请填写姓名和手机号", icon: "none" });
      return;
    }

    wx.showToast({ title: "报名意向已提交", icon: "success" });
  }
});
