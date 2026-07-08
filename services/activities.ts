import { activityPosts } from "../data/mock";
import { getApiBaseUrl, shouldUseMockFallback } from "../config/env";
import { ActivityContentBlock, ActivityContentListItem, ActivityPost } from "../types/domain";
import { request } from "./request";

const activityCoverAliases: Record<string, string> = {
  aboutShengshengMark: "/assets/activity-shengsheng.jpg",
  bookClubScene: "/assets/activity-book-club.jpg",
  heroCultureScene: "/assets/activity-culture.jpg",
  parentRunScene: "/assets/activity-parent-run.jpg"
};

function resolveActivityCover(cover = "") {
  if (!cover) return activityCoverAliases.heroCultureScene;
  if (/^https?:\/\//.test(cover)) return cover;
  if (cover.startsWith("/uploads/")) return `${getApiBaseUrl()}${cover}`;
  if (cover.startsWith("/")) return cover;
  return activityCoverAliases[cover] || activityCoverAliases.heroCultureScene;
}

function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function resolveServerAssetUrl(url = "") {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${getApiBaseUrl()}${url}`;
  return url;
}

function normalizeListItems(items: unknown, ordered: boolean): ActivityContentListItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => ({
      id: `item-${index}`,
      text: normalizeText(item),
      marker: ordered ? `${index + 1}.` : "•"
    }))
    .filter((item) => item.text.length > 0);
}

function normalizeActivityContentBlock(rawBlock: unknown, index: number): ActivityContentBlock | undefined {
  if (!rawBlock || typeof rawBlock !== "object") return undefined;

  const block = rawBlock as Record<string, unknown>;
  const rawType = normalizeText(block.type, "paragraph");
  const type = ["heading", "paragraph", "image", "quote", "list", "divider", "notice"].includes(rawType)
    ? rawType as ActivityContentBlock["type"]
    : "paragraph";
  const id = normalizeText(block.id, `${type}-${index}`);
  const baseBlock: ActivityContentBlock = {
    id,
    type,
    text: normalizeText(block.text),
    level: 2,
    url: "",
    alt: "",
    caption: "",
    items: [],
    style: "unordered",
    variant: "info",
    title: ""
  };

  if (type === "heading") {
    const level = Number(block.level);
    return {
      ...baseBlock,
      level: [1, 2, 3].includes(level) ? level : 2
    };
  }

  if (type === "image") {
    const url = resolveServerAssetUrl(normalizeText(block.url));
    if (!url) return undefined;

    return {
      ...baseBlock,
      url,
      alt: normalizeText(block.alt),
      caption: normalizeText(block.caption)
    };
  }

  if (type === "list") {
    const ordered = normalizeText(block.style) === "ordered";
    const items = normalizeListItems(block.items, ordered);
    if (!items.length) return undefined;

    return {
      ...baseBlock,
      items,
      style: ordered ? "ordered" : "unordered"
    };
  }

  if (type === "divider") return baseBlock;

  if (type === "notice") {
    const rawVariant = normalizeText(block.variant);
    const variant = ["info", "success", "warning"].includes(rawVariant)
      ? rawVariant as ActivityContentBlock["variant"]
      : "info";

    return {
      ...baseBlock,
      title: normalizeText(block.title, "活动提示"),
      variant
    };
  }

  return baseBlock.text ? baseBlock : undefined;
}

function normalizeActivityContentBlocks(blocks: unknown): ActivityContentBlock[] {
  if (!Array.isArray(blocks)) return [];

  return blocks
    .map(normalizeActivityContentBlock)
    .filter((block): block is ActivityContentBlock => Boolean(block));
}

function normalizeActivityPost(activity: ActivityPost): ActivityPost {
  const contentBlocks = normalizeActivityContentBlocks(activity.contentBlocks);

  return {
    ...activity,
    coverImage: resolveActivityCover(activity.cover),
    contentBlocks,
    hasContentBlocks: contentBlocks.length > 0
  };
}

function normalizeActivityPosts(activities: ActivityPost[]) {
  return activities.map(normalizeActivityPost);
}

export async function fetchActivityPosts(): Promise<ActivityPost[]> {
  try {
    const response = await request<{ activities: ActivityPost[] }>("/api/activities");
    return normalizeActivityPosts(response.data.activities);
  } catch (error) {
    if (!shouldUseMockFallback()) {
      throw new Error("活动数据暂时不可用，请稍后重试。");
    }

    console.warn("fetchActivityPosts fallback to mock", error);
    return normalizeActivityPosts(activityPosts);
  }
}

export async function getActivityPost(id: string): Promise<ActivityPost | undefined> {
  try {
    const response = await request<{ activity: ActivityPost }>(`/api/activities/${id}`);
    return normalizeActivityPost(response.data.activity);
  } catch (error) {
    if (!shouldUseMockFallback()) {
      throw new Error("活动数据暂时不可用，请稍后重试。");
    }

    console.warn("getActivityPost fallback to mock", error);
    const activity = activityPosts.find((item) => item.id === id);
    return activity ? normalizeActivityPost(activity) : undefined;
  }
}
