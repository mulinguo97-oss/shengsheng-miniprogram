import { featuredBooks, findFeaturedBook } from "../data/books";
import {
  Book,
  BookAccess,
  BookAccessStatus,
  BookContentResource,
  BookResourceType,
  ResourceAccess
} from "../types/domain";
import { ApiRequestError, request } from "./request";

type UnknownRecord = Record<string, unknown>;

export type ResourceProgress = {
  resourceId: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt?: string;
};

export type ProgressUpdatePayload = {
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  occurredAt: string;
  clientEventId: string;
};

export type PlayEventType = "start" | "heartbeat" | "pause" | "seek" | "resume" | "ended" | "stop" | "error";

export type PlayEventPayload = {
  eventType: PlayEventType;
  positionSeconds: number;
  durationSeconds: number;
  playbackRate: number;
  occurredAt: string;
  clientEventId: string;
};

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeAccess(value: unknown, fallback: BookAccess): BookAccess {
  const record = asRecord(value);
  const rawStatus = asString(record.status || record.accessStatus, fallback.status) as BookAccessStatus;
  const allowedStatuses: BookAccessStatus[] = ["guest", "unauthorized", "active", "paused", "expired", "revoked"];
  const granted = record.granted === true;
  const status = granted ? "active" : allowedStatuses.includes(rawStatus) ? rawStatus : fallback.status;
  const authorized = typeof record.authorized === "boolean" ? record.authorized : granted || status === "active";

  return {
    status,
    authorized,
    startsAt: asString(record.startsAt || record.starts_at) || undefined,
    expiresAt: asString(record.expiresAt || record.expires_at) || undefined,
    message: asString(record.message, authorized ? "已开通本书学习权限。" : fallback.message)
  };
}

function normalizeResource(value: unknown, bookId: string, index: number): BookContentResource | null {
  const record = asRecord(value);
  const progress = asRecord(record.progress);
  const rawType = asString(record.type || record.resourceType || record.resource_type) as BookResourceType;
  if (!(["audio", "video", "ebook"] as BookResourceType[]).includes(rawType)) return null;

  return {
    id: asString(record.id, `${bookId}-${rawType}-${index + 1}`),
    bookId,
    type: rawType,
    title: asString(record.title, rawType === "audio" ? "音频内容" : rawType === "video" ? "视频内容" : "原书阅读"),
    description: asString(record.description, "内容待管理员上传。"),
    durationSeconds: asNumber(record.durationSeconds || record.duration_seconds),
    sortOrder: asNumber(record.sortOrder || record.sort_order, index),
    status: asString(record.status) === "published" ? "published" : "placeholder",
    coverUrl: asString(record.coverUrl || record.cover_url) || undefined,
    progressSeconds: asNumber(record.progressSeconds || record.positionSeconds || record.position_seconds || progress.positionSeconds || progress.position_seconds),
    completed: Boolean(record.completed || record.completedAt || record.completed_at || progress.completedAt || progress.completed_at)
  };
}

function normalizeBook(value: unknown, fallback?: Book): Book {
  const record = asRecord(value);
  const authorRecord = asRecord(record.author);
  const bookId = asString(record.id, fallback?.id || "");
  const rawResources = Array.isArray(record.resources) ? record.resources : [];
  const resources = rawResources
    .map((resource, index) => normalizeResource(resource, bookId, index))
    .filter((resource): resource is BookContentResource => Boolean(resource))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const defaultAccess = fallback?.access || {
    status: "guest" as const,
    authorized: false,
    message: "登录后可查看管理员为你开通的书籍内容。"
  };

  return {
    id: bookId,
    slug: asString(record.slug, fallback?.slug || bookId),
    title: asString(record.title, fallback?.title || ""),
    subtitle: asString(record.subtitle, fallback?.subtitle || ""),
    summary: asString(record.summary, fallback?.summary || ""),
    introduction: asString(record.introduction, fallback?.introduction || ""),
    coverUrl: asString(record.coverUrl || record.cover_url, fallback?.coverUrl || "/assets/activity-book-club.jpg"),
    author: {
      id: asString(authorRecord.id, fallback?.author.id || "zhao-lingling"),
      name: asString(authorRecord.name || record.authorName || record.author_name, fallback?.author.name || "赵玲玲"),
      biography: asString(authorRecord.biography || record.authorBiography || record.author_biography, fallback?.author.biography || "作者介绍待完善。"),
      avatarUrl: asString(authorRecord.avatarUrl || authorRecord.avatar_url, fallback?.author.avatarUrl || "") || undefined
    },
    access: normalizeAccess(record.access || record.enrollment, defaultAccess),
    resources: resources.length ? resources : (fallback?.resources || [])
  };
}

function unwrapBooks(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  return Array.isArray(record.books) ? record.books : [];
}

function unwrapBook(data: unknown): unknown {
  const record = asRecord(data);
  return record.book || data;
}

export async function fetchBooks(): Promise<Book[]> {
  const response = await request<unknown>("/api/books");
  const serverBooks = unwrapBooks(response.data).map((book) => {
    const record = asRecord(book);
    const fallback = findFeaturedBook(asString(record.id)) || findFeaturedBook(asString(record.slug));
    return normalizeBook(book, fallback);
  });
  return serverBooks.length ? serverBooks : featuredBooks;
}

export async function fetchBookExperience(bookId: string): Promise<Book> {
  const fallback = findFeaturedBook(bookId);
  let publicBook: Book;

  try {
    const response = await request<unknown>(`/api/books/${encodeURIComponent(bookId)}`);
    publicBook = normalizeBook(unwrapBook(response.data), fallback);
  } catch (error) {
    if (!fallback) throw error;
    publicBook = fallback;
  }

  try {
    const response = await request<unknown>(`/api/me/books/${encodeURIComponent(bookId)}`);
    return normalizeBook(unwrapBook(response.data), publicBook);
  } catch (error) {
    if (error instanceof ApiRequestError && (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 404)) {
      return {
        ...publicBook,
        access: {
          status: error.statusCode === 401 ? "guest" : "unauthorized",
          authorized: false,
          message: error.statusCode === 401
            ? "请先在“我的”登录；书籍权限由管理员开通。"
            : "本书尚未为你开通，请联系管理员报名。"
        }
      };
    }
    throw error;
  }
}

export async function fetchMyBooks(): Promise<Book[]> {
  const response = await request<unknown>("/api/me/books");
  return unwrapBooks(response.data).map((book) => {
    const record = asRecord(book);
    const fallback = findFeaturedBook(asString(record.id)) || findFeaturedBook(asString(record.slug));
    return normalizeBook(book, fallback);
  });
}

export async function fetchResourceAccess(resourceId: string): Promise<ResourceAccess> {
  const response = await request<unknown>(`/api/me/resources/${encodeURIComponent(resourceId)}/access`);
  const record = asRecord(response.data);
  const accessRecord = asRecord(record.access || response.data);
  const url = asString(accessRecord.url || accessRecord.signedUrl || accessRecord.signed_url) || undefined;
  const status = asString(accessRecord.status || accessRecord.accessStatus, url ? "active" : "unauthorized") as BookAccessStatus;
  return {
    resourceId,
    authorized: Boolean(accessRecord.authorized ?? Boolean(url)),
    status,
    url,
    expiresAt: asString(accessRecord.expiresAt || accessRecord.expires_at) || undefined,
    message: asString(accessRecord.message, status === "active" ? "可以访问。" : "当前没有访问权限。")
  };
}

export async function fetchResourceProgress(resourceId: string): Promise<ResourceProgress> {
  const response = await request<unknown>(`/api/me/resources/${encodeURIComponent(resourceId)}/progress`);
  const record = asRecord(response.data);
  const progress = asRecord(record.progress || response.data);
  return {
    resourceId,
    positionSeconds: asNumber(progress.positionSeconds || progress.position_seconds),
    durationSeconds: asNumber(progress.durationSeconds || progress.duration_seconds),
    completed: Boolean(progress.completed || progress.completedAt || progress.completed_at),
    updatedAt: asString(progress.updatedAt || progress.updated_at) || undefined
  };
}

export async function updateResourceProgress(resourceId: string, payload: ProgressUpdatePayload) {
  await request(`/api/me/resources/${encodeURIComponent(resourceId)}/progress`, {
    method: "PUT",
    data: payload
  });
}

export async function createPlaySession(resourceId: string, clientSessionId: string, positionSeconds: number) {
  const response = await request<unknown>(`/api/me/resources/${encodeURIComponent(resourceId)}/play-sessions`, {
    method: "POST",
    data: {
      channel: "miniprogram",
      clientSessionId,
      positionSeconds,
      occurredAt: new Date().toISOString()
    }
  });
  const record = asRecord(response.data);
  const session = asRecord(record.playSession || record.session || response.data);
  return asString(session.id || session.sessionId || session.session_id, clientSessionId);
}

export async function reportPlayEvent(sessionId: string, payload: PlayEventPayload) {
  await request(`/api/me/play-sessions/${encodeURIComponent(sessionId)}/events`, {
    method: "POST",
    data: {
      ...payload,
      metadata: {
        playbackRate: payload.playbackRate,
        durationSeconds: payload.durationSeconds
      }
    }
  });
}

export async function finishPlaySession(sessionId: string, payload: PlayEventPayload) {
  await request(`/api/me/play-sessions/${encodeURIComponent(sessionId)}/finish`, {
    method: "POST",
    data: payload
  });
}
