import { ProfilePayload } from "../types/domain";
import { clearStoredAuthCookie, request } from "./request";

export type LoginPayload = {
  email: string;
  password: string;
};

export type ProfileUpdatePayload = {
  name: string;
  phone: string;
  city: string;
  interests: string;
  bio: string;
};

export async function loginProfile(payload: LoginPayload) {
  const login = await request<{ user?: { mustChangePassword?: boolean } }>("/api/auth/login", {
    method: "POST",
    data: payload
  });

  return {
    profile: await fetchProfile(),
    mustChangePassword: Boolean(login.data.user?.mustChangePassword)
  };
}

export async function changeProfilePassword(currentPassword: string, newPassword: string) {
  await request("/api/auth/change-password", {
    method: "POST",
    data: { currentPassword, newPassword }
  });
}

export async function logoutProfile() {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } finally {
    clearStoredAuthCookie();
  }
}

export async function fetchProfile() {
  const response = await request<ProfilePayload>("/api/profile/me");
  return response.data;
}

export async function saveProfile(payload: ProfileUpdatePayload) {
  const response = await request<ProfilePayload>("/api/profile/me", {
    method: "PUT",
    data: payload
  });
  return response.data;
}

export async function markProfileMessageRead(messageId: string) {
  const response = await request<ProfilePayload>(`/api/profile/messages/${messageId}/read`, {
    method: "PUT"
  });
  return response.data;
}
