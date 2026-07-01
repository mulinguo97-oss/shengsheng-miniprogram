export type RuntimeEnv = "develop" | "trial" | "release";

export const runtimeConfig: Record<RuntimeEnv, { apiBaseUrl: string }> = {
  develop: {
    apiBaseUrl: "http://127.0.0.1:3001"
  },
  trial: {
    apiBaseUrl: ""
  },
  release: {
    apiBaseUrl: ""
  }
};

export function getApiBaseUrl() {
  const accountInfo = wx.getAccountInfoSync();
  const envVersion = accountInfo.miniProgram.envVersion as RuntimeEnv;
  return runtimeConfig[envVersion]?.apiBaseUrl || "";
}
