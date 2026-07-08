import { getApiBaseUrl } from "../config/env";

export type ApiResult<T> = {
  data: T;
  statusCode: number;
};

export type RequestOptions = Omit<WechatMiniprogram.RequestOption, "url">;

const authCookieStorageKey = "shengsheng_auth_cookie";

function getStoredAuthCookie() {
  try {
    return String(wx.getStorageSync(authCookieStorageKey) || "");
  } catch {
    return "";
  }
}

function extractAuthCookie(setCookie: unknown) {
  const rawCookie = Array.isArray(setCookie) ? setCookie.join(",") : String(setCookie || "");
  const match = rawCookie.match(/shengsheng_session=[^;,]*/);
  return match?.[0] || "";
}

function persistAuthCookie(header: WechatMiniprogram.IAnyObject) {
  const setCookie = header["Set-Cookie"] || header["set-cookie"];
  const authCookie = extractAuthCookie(setCookie);
  if (!authCookie) return;

  if (/shengsheng_session=($|;)/.test(authCookie)) {
    wx.removeStorageSync(authCookieStorageKey);
    return;
  }

  wx.setStorageSync(authCookieStorageKey, authCookie);
}

export function clearStoredAuthCookie() {
  wx.removeStorageSync(authCookieStorageKey);
}

export function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const apiBaseUrl = getApiBaseUrl();
  const authCookie = getStoredAuthCookie();

  if (!apiBaseUrl) {
    return Promise.reject(new Error("尚未配置后端 API 地址"));
  }

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      url: `${apiBaseUrl}${path}`,
      header: {
        "content-type": "application/json",
        ...(authCookie ? { Cookie: authCookie } : {}),
        ...(options.header || {})
      },
      success(response) {
        persistAuthCookie(response.header || {});

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({
            data: response.data as T,
            statusCode: response.statusCode
          });
          return;
        }

        const errorBody = response.data as { message?: string } | undefined;
        reject(new Error(errorBody?.message || `请求失败：${response.statusCode}`));
      },
      fail(error) {
        reject(error);
      }
    });
  });
}
