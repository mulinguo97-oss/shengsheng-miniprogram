App<IAppOption>({
  globalData: {
    apiBaseUrl: "",
    version: "0.1.0"
  },

  onLaunch() {
    const accountInfo = wx.getAccountInfoSync();
    this.globalData.envVersion = accountInfo.miniProgram.envVersion;
  }
});
