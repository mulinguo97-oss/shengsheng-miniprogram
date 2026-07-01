import { getApiBaseUrl } from "../config/env";

export type ApiResult<T> = {
  data: T;
  statusCode: number;
};

export type RequestOptions = Omit<WechatMiniprogram.RequestOption, "url">;

export function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return Promise.reject(new Error("尚未配置后端 API 地址"));
  }

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      url: `${apiBaseUrl}${path}`,
      header: {
        "content-type": "application/json",
        ...(options.header || {})
      },
      success(response) {
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
