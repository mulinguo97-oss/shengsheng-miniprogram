import { featuredBooks, selectFeaturedBooks } from "../../data/books";
import { fetchBooks } from "../../services/bookContent";
import { Book } from "../../types/domain";

Page({
  data: {
    books: featuredBooks as Book[],
    syncing: false,
    syncMessage: ""
  },

  async onLoad() {
    await this.loadBooks();
  },

  async loadBooks() {
    this.setData({ syncing: true, syncMessage: "" });
    try {
      this.setData({ books: selectFeaturedBooks(await fetchBooks()) });
    } catch (error) {
      console.warn("书籍公开信息同步失败，保留首发书籍信息", error);
      this.setData({
        books: featuredBooks,
        syncMessage: "书籍详细信息正在同步，当前可先查看首发书目。"
      });
    } finally {
      this.setData({ syncing: false });
    }
  },

  goBookClub() {
    wx.switchTab({ url: "/pages/book-club/index" });
  },

  goBookDetail(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || "");
    if (!id) return;
    wx.navigateTo({ url: `/pages/book-club-detail/index?id=${encodeURIComponent(id)}` });
  }
});
