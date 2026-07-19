import {
  changeProfilePassword,
  fetchProfile,
  loginProfile,
  logoutProfile,
  markProfileMessageRead,
  saveProfile
} from "../../services/profile";
import { fetchMyBooks } from "../../services/bookContent";
import { Book, ProfilePayload, ProfileUser } from "../../types/domain";

const emptyProfile: ProfilePayload = {
  user: null,
  stats: {
    joinedDays: 0,
    participatedCount: 0,
    upcomingCount: 0,
    unreadCount: 0
  },
  participations: [],
  messages: []
};

const defaultAvatar = "/assets/default-avatar.png";

Page({
  data: {
    profile: emptyProfile,
    user: null as ProfileUser | null,
    loading: false,
    saving: false,
    loggingIn: false,
    loginEmail: "",
    loginPassword: "",
    mustChangePassword: false,
    newPassword: "",
    confirmPassword: "",
    formName: "",
    formPhone: "",
    formCity: "",
    formInterests: "",
    formBio: "",
    avatarSrc: defaultAvatar,
    myBooks: [] as Book[],
    loadingBooks: false,
    booksMessage: ""
  },

  async onShow() {
    await this.loadProfile();
  },

  applyProfile(profile: ProfilePayload) {
    const user = profile.user;
    const bookParticipations = profile.participations.filter((item) => item.type === "book_club");
    this.setData({
      profile: { ...profile, participations: bookParticipations },
      user,
      formName: user?.name || "",
      formPhone: user?.phone || "",
      formCity: user?.city || "",
      formInterests: user?.interests || "",
      formBio: user?.bio || "",
      avatarSrc: user?.avatarUrl || defaultAvatar
    });
  },

  async loadProfile() {
    this.setData({ loading: true });
    try {
      const profile = await fetchProfile();
      this.applyProfile(profile);
      if (profile.user) await this.loadMyBooks();
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "个人中心读取失败", icon: "none" });
      this.applyProfile(emptyProfile);
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMyBooks() {
    this.setData({ loadingBooks: true, booksMessage: "" });
    try {
      const myBooks = await fetchMyBooks();
      this.setData({
        myBooks,
        booksMessage: myBooks.length ? "" : "管理员尚未为你开通书籍。"
      });
    } catch (error) {
      this.setData({
        myBooks: [],
        booksMessage: error instanceof Error ? error.message : "我的书籍暂时无法读取。"
      });
    } finally {
      this.setData({ loadingBooks: false });
    }
  },

  onLoginEmailChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ loginEmail: event.detail.value });
  },

  onLoginPasswordChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ loginPassword: event.detail.value });
  },

  onNewPasswordChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ newPassword: event.detail.value });
  },

  onConfirmPasswordChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ confirmPassword: event.detail.value });
  },

  onNameChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ formName: event.detail.value });
  },

  onPhoneChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ formPhone: event.detail.value });
  },

  onCityChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ formCity: event.detail.value });
  },

  onInterestsChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ formInterests: event.detail.value });
  },

  onBioChange(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ formBio: event.detail.value });
  },

  async login() {
    const email = this.data.loginEmail.trim();
    const password = this.data.loginPassword;

    if (!email || !password) {
      wx.showToast({ title: "请输入邮箱和密码", icon: "none" });
      return;
    }

    this.setData({ loggingIn: true });
    try {
      const result = await loginProfile({ email, password });
      this.applyProfile(result.profile);
      this.setData({ mustChangePassword: result.mustChangePassword });
      if (result.mustChangePassword) {
        wx.showToast({ title: "请先设置新密码", icon: "none" });
        return;
      }
      await this.loadMyBooks();
      this.setData({ loginPassword: "" });
      wx.showToast({ title: "已登录", icon: "success" });
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "登录失败", icon: "none" });
    } finally {
      this.setData({ loggingIn: false });
    }
  },

  async changePassword() {
    const newPassword = this.data.newPassword;
    if (newPassword.length < 10 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      wx.showToast({ title: "新密码至少10位并包含字母和数字", icon: "none" });
      return;
    }
    if (newPassword !== this.data.confirmPassword) {
      wx.showToast({ title: "两次新密码不一致", icon: "none" });
      return;
    }
    this.setData({ saving: true });
    try {
      await changeProfilePassword(this.data.loginPassword, newPassword);
      this.setData({ mustChangePassword: false, loginPassword: "", newPassword: "", confirmPassword: "" });
      await this.loadMyBooks();
      wx.showToast({ title: "密码已更新", icon: "success" });
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "修改密码失败", icon: "none" });
    } finally {
      this.setData({ saving: false });
    }
  },

  async logout() {
    await logoutProfile();
    this.applyProfile(emptyProfile);
    this.setData({ myBooks: [], booksMessage: "", mustChangePassword: false, loginPassword: "", newPassword: "", confirmPassword: "" });
    wx.showToast({ title: "已退出", icon: "success" });
  },

  async save() {
    if (!this.data.user) return;
    if (!this.data.formName.trim()) {
      wx.showToast({ title: "姓名不能为空", icon: "none" });
      return;
    }
    if (this.data.formPhone.trim() && !/^1\d{10}$/.test(this.data.formPhone.trim())) {
      wx.showToast({ title: "请输入有效手机号", icon: "none" });
      return;
    }

    this.setData({ saving: true });
    try {
      this.applyProfile(await saveProfile({
        name: this.data.formName.trim(),
        phone: this.data.formPhone.trim(),
        city: this.data.formCity.trim(),
        interests: this.data.formInterests.trim(),
        bio: this.data.formBio.trim()
      }));
      wx.showToast({ title: "已保存", icon: "success" });
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "保存失败", icon: "none" });
    } finally {
      this.setData({ saving: false });
    }
  },

  async markMessageRead(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || "");
    if (!id) return;

    try {
      this.applyProfile(await markProfileMessageRead(id));
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "更新失败", icon: "none" });
    }
  },

  goBookDetail(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || "");
    if (!id) return;
    wx.navigateTo({ url: `/pages/book-club-detail/index?id=${encodeURIComponent(id)}` });
  }
});
