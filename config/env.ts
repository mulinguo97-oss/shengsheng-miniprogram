export type RuntimeEnv = "develop" | "trial" | "release";

const serverApiBaseUrl = "https://shengshengcorp.com";

export const runtimeConfig: Record<RuntimeEnv, { apiBaseUrl: string }> = {
  develop: {
    apiBaseUrl: serverApiBaseUrl
  },
  trial: {
    apiBaseUrl: serverApiBaseUrl
  },
  release: {
    apiBaseUrl: serverApiBaseUrl
  }
};

export function getRuntimeEnv(): RuntimeEnv {
  const accountInfo = wx.getAccountInfoSync();
  return accountInfo.miniProgram.envVersion as RuntimeEnv;
}

export function shouldUseMockFallback() {
  return false;
}

export function getApiBaseUrl() {
  const envVersion = getRuntimeEnv();
  return runtimeConfig[envVersion]?.apiBaseUrl || "";
}
