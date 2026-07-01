import { activityPosts } from "../data/mock";
import { ActivityPost } from "../types/domain";

export async function fetchActivityPosts(): Promise<ActivityPost[]> {
  return activityPosts;
}

export async function getActivityPost(id: string): Promise<ActivityPost | undefined> {
  return activityPosts.find((activity) => activity.id === id);
}
