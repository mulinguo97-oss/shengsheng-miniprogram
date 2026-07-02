import { activityPosts } from "../data/mock";
import { ActivityPost } from "../types/domain";
import { request } from "./request";

export async function fetchActivityPosts(): Promise<ActivityPost[]> {
  try {
    const response = await request<{ activities: ActivityPost[] }>("/api/activities");
    return response.data.activities;
  } catch (error) {
    console.warn("fetchActivityPosts fallback to mock", error);
    return activityPosts;
  }
}

export async function getActivityPost(id: string): Promise<ActivityPost | undefined> {
  try {
    const response = await request<{ activity: ActivityPost }>(`/api/activities/${id}`);
    return response.data.activity;
  } catch (error) {
    console.warn("getActivityPost fallback to mock", error);
    return activityPosts.find((activity) => activity.id === id);
  }
}
