import { fetchBookClubCourses } from "../../services/bookClub";
import { BookClubCourse } from "../../types/domain";

Page({
  data: {
    courses: [] as BookClubCourse[],
    loading: false,
    errorMessage: ""
  },

  async onLoad() {
    await this.loadCourses();
  },

  async loadCourses() {
    this.setData({ loading: true, errorMessage: "" });

    try {
      const courses = await fetchBookClubCourses();
      this.setData({ courses });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "读书会数据暂时不可用，请稍后重试。";
      this.setData({ courses: [], errorMessage });
      wx.showToast({ title: errorMessage, icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  goDetail(event: WechatMiniprogram.TouchEvent) {
    const courseId = event.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/pages/book-club-detail/index?id=${courseId}` });
  }
});
