import { fetchBookClubCourses } from "../../services/bookClub";
import { BookClubCourse } from "../../types/domain";

Page({
  data: {
    courses: [] as BookClubCourse[]
  },

  async onLoad() {
    const courses = await fetchBookClubCourses();
    this.setData({ courses });
  },

  goDetail(event: WechatMiniprogram.TouchEvent) {
    const courseId = event.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/pages/book-club-detail/index?id=${courseId}` });
  }
});
