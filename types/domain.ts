export type ActivityPost = {
  id: string;
  title: string;
  summary: string;
  dateTime: string;
  place: string;
  category: string;
  isPinned?: boolean;
};

export type BookClubCourse = {
  id: string;
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
