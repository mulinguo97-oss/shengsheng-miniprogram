import { parentRunEvents } from "../data/mock";
import { shouldUseMockFallback } from "../config/env";
import { request } from "./request";
import { ParentRunEvent, ParentRunGuestSignupPayload } from "../types/domain";

export async function fetchParentRunEvents(): Promise<ParentRunEvent[]> {
  try {
    const response = await request<{ events: Array<ParentRunEvent & { signups?: unknown[] }> }>("/api/parent-run/events");
    return response.data.events.map((event) => ({
      ...event,
      signupCount: typeof event.signupCount === "number"
        ? event.signupCount
        : Array.isArray(event.signups)
          ? event.signups.length
          : 0
    }));
  } catch (error) {
    if (!shouldUseMockFallback()) {
      throw new Error("跑团数据暂时不可用，请稍后重试。");
    }

    console.warn("读取跑团接口失败，使用本地示例数据", error);
    return parentRunEvents;
  }
}

export async function getParentRunEvent(id: string): Promise<ParentRunEvent | undefined> {
  const events = await fetchParentRunEvents();
  return events.find((event) => event.id === id);
}

export async function submitParentRunGuestSignup(
  eventId: string,
  payload: ParentRunGuestSignupPayload
): Promise<ParentRunEvent | undefined> {
  const response = await request<{ event: ParentRunEvent | null }>(
    `/api/parent-run/events/${eventId}/guest-signup`,
    {
      method: "POST",
      data: payload
    }
  );

  return response.data.event || undefined;
}
