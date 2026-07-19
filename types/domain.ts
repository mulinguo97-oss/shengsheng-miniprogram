export type ActivityContentListItem = {
  id: string;
  text: string;
  marker: string;
};

export type ActivityContentBlock = {
  id: string;
  type: "heading" | "paragraph" | "image" | "quote" | "list" | "divider" | "notice";
  text: string;
  level: number;
  url: string;
  alt: string;
  caption: string;
  items: ActivityContentListItem[];
  style: "ordered" | "unordered";
  variant: "info" | "success" | "warning";
  title: string;
};

export type ActivityPost = {
  id: string;
  title: string;
  summary: string;
  dateTime: string;
  place: string;
  category: string;
  cover?: string;
  coverImage?: string;
  contentBlocks?: ActivityContentBlock[];
  hasContentBlocks?: boolean;
  isPinned?: boolean;
  contentHtml?: string;
};

export type BookClubCourse = {
  id: string;
  sessionId?: string;
  bookTitle: string;
  lecturer: string;
  lecturerBio?: string;
  summary: string;
  nextSessionDate: string;
  nextSessionTime?: string;
  place?: string;
  capacity?: number;
  participantCount: number;
  notes?: string;
};

export type BookAccessStatus = "guest" | "unauthorized" | "active" | "paused" | "expired" | "revoked";

export type BookAuthor = {
  id: string;
  name: string;
  biography: string;
  avatarUrl?: string;
};

export type BookResourceType = "audio" | "video" | "ebook";

export type BookContentResource = {
  id: string;
  bookId: string;
  type: BookResourceType;
  title: string;
  description: string;
  durationSeconds: number;
  sortOrder: number;
  status: "placeholder" | "published";
  coverUrl?: string;
  progressSeconds?: number;
  completed?: boolean;
};

export type BookAccess = {
  status: BookAccessStatus;
  authorized: boolean;
  startsAt?: string;
  expiresAt?: string;
  message: string;
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  introduction: string;
  coverUrl: string;
  author: BookAuthor;
  access: BookAccess;
  resources: BookContentResource[];
};

export type ResourceAccess = {
  resourceId: string;
  authorized: boolean;
  status: BookAccessStatus;
  url?: string;
  expiresAt?: string;
  message: string;
};

export type ParentRunEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  place: string;
  distance: string;
  capacity: number;
  signupCount: number;
  guestSignupCount?: number;
  notes: string;
};

export type ParentRunGuestSignupPayload = {
  parentName: string;
  phone: string;
  childAge: string;
  participantCount: number;
  note: string;
};

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProfileUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role?: string;
  city: string;
  interests: string;
  bio: string;
  createdAt: string;
};

export type ProfileStats = {
  joinedDays: number;
  participatedCount: number;
  upcomingCount: number;
  unreadCount: number;
};

export type ProfileParticipation = {
  id: string;
  type: "book_club" | "parent_run" | string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  place: string;
  participantCount: number;
  status: string;
  source: string;
  signedAt: string;
};

export type ProfileMessage = {
  id: string;
  subject: string;
  body: string;
  deliveryStatus: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
};

export type ProfilePayload = {
  user: ProfileUser | null;
  stats: ProfileStats;
  participations: ProfileParticipation[];
  messages: ProfileMessage[];
};
