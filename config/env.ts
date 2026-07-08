export type RuntimeEnv = "develop" | "trial" | "release";

const serverApiBaseUrl = "https://shengshengcorp.com";
const localApiBaseUrl = "http://127.0.0.1:3001";
const useLocalApiInDevelop = false;
const enableMockFallbackInDevelop = false;

export const runtimeConfig: Record<RuntimeEnv, { apiBaseUrl: string }> = {
  develop: {
    apiBaseUrl: useLocalApiInDevelop ? localApiBaseUrl : serverApiBaseUrl
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
  return enableMockFallbackInDevelop && getRuntimeEnv() === "develop";
}

export function getApiBaseUrl() {
  const envVersion = getRuntimeEnv();
  return runtimeConfig[envVersion]?.apiBaseUrl || "";
}
