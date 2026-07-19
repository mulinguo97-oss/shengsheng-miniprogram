import { featuredBooks, selectFeaturedBooks } from "../../data/books";
import { fetchBooks } from "../../services/bookContent";
import { Book } from "../../types/domain";

Page({
  data: {
    books: featuredBooks as Book[],
    loading: false,
    errorMessage: ""
  },

  async onShow() {
    await this.loadBooks();
  },

  async loadBooks() {
    this.setData({ loading: true, errorMessage: "" });
    try {
      this.setData({ books: selectFeaturedBooks(await fetchBooks()) });
    } catch (error) {
      console.warn("读取书籍列表失败，显示首发书目", error);
      this.setData({
        books: featuredBooks,
        errorMessage: "书籍详细信息暂未同步，当前展示首发书目。"
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  goDetail(event: WechatMiniprogram.TouchEvent) {
    const bookId = String(event.currentTarget.dataset.id || "");
    if (!bookId) return;
    wx.navigateTo({ url: `/pages/book-club-detail/index?id=${encodeURIComponent(bookId)}` });
  }
});
