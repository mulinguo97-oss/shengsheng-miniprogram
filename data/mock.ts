import { ActivityPost, BookClubCourse, ParentRunEvent } from "../types/domain";

export const activityPosts: ActivityPost[] = [
  {
    id: "culture-salon",
    title: "传统文化沙龙报名开启",
    summary: "围绕经典阅读、家庭陪伴与城市文化实践展开交流。",
    dateTime: "2026-07-20 15:00",
    place: "深圳南山",
    category: "文化沙龙",
    isPinned: true
  },
  {
    id: "reading-review",
    title: "读书会阶段复盘",
    summary: "整理共读节奏、书友反馈与下一阶段学习计划。",
    dateTime: "2026-07-18 19:30",
    place: "线上共读",
    category: "读书会"
  }
];

export const bookClubCourses: BookClubCourse[] = [
  {
    id: "lunyu",
    bookTitle: "王老师讲论语",
    lecturer: "王老师",
    lecturerBio: "长期研读儒家经典，擅长把经典文本与家庭教育、日常修身结合讲解。",
    summary: "从经典章句进入日常修身，适合希望系统理解儒家思想的家庭与青年读者。",
    nextSessionDate: "2026-07-06",
    nextSessionTime: "19:30",
    place: "生生书房一号厅",
    capacity: 40,
    participantCount: 36,
    notes: "建议提前阅读《论语》学而篇，现场安排导读、讨论和摘句分享。"
  },
  {
    id: "yijing",
    bookTitle: "陈老师讲易经",
    lecturer: "陈老师",
    lecturerBio: "专注《易经》义理与传统文化教育，强调从变化观理解生活选择。",
    summary: "用清晰方式理解《易经》的结构、卦象与人生智慧。",
    nextSessionDate: "2026-07-09",
    nextSessionTime: "19:30",
    place: "生生书房二号厅",
    capacity: 36,
    participantCount: 28,
    notes: "从《易经》的基本结构、经传关系和乾坤两卦开始。"
  }
];

export const parentRunEvents: ParentRunEvent[] = [
  {
    id: "run-2026-07-05",
    date: "2026-07-05",
    time: "07:30",
    title: "深圳湾亲子晨跑",
    place: "深圳湾公园日出剧场",
    distance: "3 公里",
    capacity: 60,
    signupCount: 42,
    notes: "适合 5 岁以上亲子家庭，现场包含热身、慢跑和亲子拉伸。"
  },
  {
    id: "run-2026-07-12",
    date: "2026-07-12",
    time: "07:20",
    title: "人才公园家庭节奏跑",
    place: "人才公园南门集合",
    distance: "2.5 公里",
    capacity: 48,
    signupCount: 31,
    notes: "以轻松配速完成家庭协作跑，建议提前 10 分钟到场签到。"
  }
];
