import { Book, BookAccess } from "../types/domain";

const guestAccess: BookAccess = {
  status: "guest",
  authorized: false,
  message: "登录后可查看管理员为你开通的书籍内容。"
};

const author = {
  id: "zhao-lingling",
  name: "赵玲玲",
  biography: "赵玲玲老师著作。作者详细介绍将在后台内容管理中持续完善。"
};

export const featuredBooks: Book[] = [
  {
    id: "chengqi-kongzi-shijiao",
    slug: "chengqi-kongzi-shijiao",
    title: "成器比成功更重要—孔子的人生时教",
    subtitle: "赵玲玲老师著作",
    summary: "从孔子的人生智慧出发，理解成长、成器与人生时序。",
    introduction: "本书详细介绍将在后台内容管理中持续完善。",
    coverUrl: "/assets/activity-book-club.jpg",
    author,
    access: guestAccess,
    resources: []
  },
  {
    id: "philosophy-bath-once-in-life",
    slug: "philosophy-bath-once-in-life",
    title: "一生至少一次的哲学浴",
    subtitle: "赵玲玲老师著作",
    summary: "以哲学阅读打开自我观察、思考与日常实践的新入口。",
    introduction: "本书详细介绍将在后台内容管理中持续完善。",
    coverUrl: "/assets/activity-book-club.jpg",
    author,
    access: guestAccess,
    resources: []
  }
];

export function findFeaturedBook(id: string) {
  return featuredBooks.find((book) => book.id === id || book.slug === id);
}

export function selectFeaturedBooks(serverBooks: Book[]) {
  return featuredBooks.map((featuredBook) => (
    serverBooks.find((book) => (
      book.id === featuredBook.id
      || book.slug === featuredBook.slug
      || book.title === featuredBook.title
    )) || featuredBook
  ));
}
