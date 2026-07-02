import { bookClubCourses } from "../data/mock";
import { BookClubCourse } from "../types/domain";
import { request } from "./request";

type ApiBookClubSignup = {
  participantCount?: number;
};

type ApiBookClubSession = {
  id: string;
  date: string;
  time: string;
  title: string;
  place: string;
  capacity: number;
  notes: string;
  signups?: ApiBookClubSignup[];
};

type ApiBookClubCourse = {
  id: string;
  bookTitle: string;
  lecturer: string;
  lecturerBio?: string;
  summary: string;
  sessions?: ApiBookClubSession[];
};

export type BookClubSignupPayload = {
  name: string;
  phone: string;
  participantCount: number;
  note: string;
};

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getSessionParticipantCount(session: ApiBookClubSession) {
  return (session.signups || []).reduce((total, signup) => total + (signup.participantCount || 1), 0);
}

function selectDisplaySession(course: ApiBookClubCourse) {
  const sessions = [...(course.sessions || [])].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const today = getTodayDate();
  return sessions.find((session) => session.date >= today) || sessions[0];
}

function flattenCourse(course: ApiBookClubCourse): BookClubCourse {
  const session = selectDisplaySession(course);
  return {
    id: course.id,
    sessionId: session?.id,
    bookTitle: course.bookTitle,
    lecturer: course.lecturer,
    lecturerBio: course.lecturerBio,
    summary: course.summary,
    nextSessionDate: session?.date || "",
    nextSessionTime: session?.time || "",
    place: session?.place || "",
    capacity: session?.capacity || 0,
    participantCount: session ? getSessionParticipantCount(session) : 0,
    notes: session?.notes || ""
  };
}

export async function fetchBookClubCourses(): Promise<BookClubCourse[]> {
  try {
    const response = await request<{ courses: ApiBookClubCourse[] }>("/api/book-club/courses");
    return response.data.courses.map(flattenCourse);
  } catch (error) {
    console.warn("fetchBookClubCourses fallback to mock", error);
    return bookClubCourses;
  }
}

export async function getBookClubCourse(id: string): Promise<BookClubCourse | undefined> {
  try {
    const response = await request<{ course: ApiBookClubCourse }>(`/api/book-club/courses/${id}`);
    return flattenCourse(response.data.course);
  } catch (error) {
    console.warn("getBookClubCourse fallback to mock", error);
    return bookClubCourses.find((course) => course.id === id);
  }
}

export async function submitBookClubSignup(course: BookClubCourse, payload: BookClubSignupPayload): Promise<BookClubCourse | undefined> {
  if (!course.sessionId) {
    throw new Error("当前课程暂无可报名场次");
  }

  const response = await request<{ course: ApiBookClubCourse | null }>(`/api/book-club/sessions/${course.sessionId}/signup`, {
    method: "POST",
    data: {
      name: payload.name,
      phone: payload.phone,
      participantCount: payload.participantCount,
      note: payload.note
    }
  });

  return response.data.course ? flattenCourse(response.data.course) : undefined;
}
