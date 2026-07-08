import { ActivityPost, BookClubCourse, ParentRunEvent } from "../types/domain";

export const activityPosts: ActivityPost[] = [
  {
    id: "culture-salon-2024-05-25",
    title: "传统文化沙龙报名开启",
    summary: "围绕经典阅读、礼乐生活与城市文化实践展开交流，欢迎新老朋友参加。",
    dateTime: "2024-05-25 15:00",
    place: "南山区文化馆",
    category: "文化沙龙",
    cover: "heroCultureScene",
    isPinned: true,
    contentHtml: "<p>本期传统文化沙龙围绕经典阅读、礼乐生活与城市文化实践展开交流。现场将设置主题分享、自由提问与小组讨论三个环节。</p><p>欢迎关注传统文化、家庭教育和城市公共文化的朋友报名参与。</p>"
  },
  {
    id: "lunyu-reading-2024-05-18",
    title: "共读《论语》 感悟生活智慧",
    summary: "以章句为线索，从日常处重新理解修身、处世与家庭陪伴。",
    dateTime: "2024-05-18 14:00",
    place: "深圳书房",
    category: "生生读书会",
    cover: "bookClubScene",
    contentHtml: "<p>本次读书会以《论语》选章为线索，结合家庭、工作和日常沟通场景展开讨论。</p><p>活动希望让经典从文本回到生活，帮助参与者建立长期共读节奏。</p>"
  },
  {
    id: "parent-run-2024-05-12",
    title: "亲子跑团活动圆满落幕",
    summary: "在清晨跑道中完成亲子协作训练，让运动成为家庭陪伴的一部分。",
    dateTime: "2024-05-12 07:30",
    place: "深圳湾公园",
    category: "生生亲子跑团",
    cover: "parentRunScene",
    contentHtml: "<p>亲子跑团在深圳湾公园完成分组热身、轻量跑步和家庭协作任务。</p><p>活动强调安全、陪伴和持续运动习惯，让跑步成为亲子沟通的一部分。</p>"
  },
  {
    id: "morning-reading-2024-04-28",
    title: "生生文化晨读小组复盘",
    summary: "围绕晨读节奏、共学反馈与下一阶段阅读计划进行阶段整理。",
    dateTime: "2024-04-28 08:00",
    place: "线上共读",
    category: "读书会",
    cover: "bookClubScene",
    contentHtml: "<p>晨读小组完成阶段复盘，整理了共读节奏、打卡反馈和下一阶段书目安排。</p>"
  },
  {
    id: "family-culture-2024-04-20",
    title: "家庭文化陪伴计划发布",
    summary: "从亲子阅读、节气行动和家庭记录三个方向建立长期陪伴计划。",
    dateTime: "2024-04-20 10:30",
    place: "生生文化空间",
    category: "家庭文化",
    cover: "aboutShengshengMark",
    contentHtml: "<p>家庭文化陪伴计划从亲子阅读、节气行动和家庭记录三个方向展开，鼓励家庭以轻量方式建立文化生活。</p>"
  },
  {
    id: "spring-run-2024-04-13",
    title: "春日亲子跑训练营回顾",
    summary: "通过分组热身、轻量跑步和亲子任务卡，帮助家庭建立运动习惯。",
    dateTime: "2024-04-13 07:20",
    place: "人才公园",
    category: "跑团活动",
    cover: "parentRunScene",
    contentHtml: "<p>春日亲子跑训练营通过分组热身、轻量跑步和亲子任务卡，帮助家庭建立稳定运动习惯。</p>"
  }
];

export const bookClubCourses: BookClubCourse[] = [
  {
    id: "book-club-lunyu",
    sessionId: "book-club-lunyu-2026-07-13",
    bookTitle: "王老师讲论语",
    lecturer: "王老师",
    lecturerBio: "长期研读儒家经典，擅长把《论语》的修身、齐家与当代生活场景结合讲解。",
    summary: "从经典章句进入日常修养，适合希望系统理解儒家思想的家庭与青年读者。",
    nextSessionDate: "2026-07-13",
    nextSessionTime: "19:30",
    place: "生生书房一号厅",
    capacity: 40,
    participantCount: 0,
    notes: "围绕为政以德、君子人格与家庭教育展开讨论。"
  },
  {
    id: "book-club-yijing",
    sessionId: "book-club-yijing-2026-07-09",
    bookTitle: "陈老师讲易经",
    lecturer: "陈老师",
    lecturerBio: "专注《易经》义理与传统文化教育，强调从变化观、时位观理解生活选择。",
    summary: "用简明方式理解《易经》的结构、卦象与人生智慧，适合零基础参与。",
    nextSessionDate: "2026-07-09",
    nextSessionTime: "19:30",
    place: "生生书房二号厅",
    capacity: 36,
    participantCount: 0,
    notes: "从《易经》的基本结构、经传关系和乾坤两卦开始。"
  }
];

export const parentRunEvents: ParentRunEvent[] = [
  {
    id: "3",
    date: "2026-06-21",
    time: "07:30",
    title: "春茧亲子跑回顾",
    place: "深圳湾体育中心",
    distance: "2 公里",
    capacity: 50,
    signupCount: 0,
    guestSignupCount: 0,
    notes: "过往活动记录，用于展示过往时间和报名节奏。"
  },
  {
    id: "1",
    date: "2026-07-05",
    time: "07:30",
    title: "深圳湾亲子晨跑",
    place: "深圳湾公园日出剧场",
    distance: "3 公里",
    capacity: 60,
    signupCount: 0,
    guestSignupCount: 0,
    notes: "适合 5 岁以上亲子家庭，现场包含热身、慢跑和亲子拉伸。"
  },
  {
    id: "2",
    date: "2026-07-12",
    time: "07:20",
    title: "人才公园家庭节奏跑",
    place: "人才公园南门集合",
    distance: "2.5 公里",
    capacity: 48,
    signupCount: 0,
    guestSignupCount: 0,
    notes: "以轻松配速完成家庭协作跑，建议提前 10 分钟到场签到。"
  }
];
