import { bookClubCourses } from "../data/mock";
import { BookClubCourse } from "../types/domain";

export async function fetchBookClubCourses(): Promise<BookClubCourse[]> {
  return bookClubCourses;
}

export async function getBookClubCourse(id: string): Promise<BookClubCourse | undefined> {
  return bookClubCourses.find((course) => course.id === id);
}
