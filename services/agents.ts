import { AssistantMessage } from "../types/domain";
import { request } from "./request";

export async function askAssistant(message: string, history: AssistantMessage[]) {
  const normalized = message.trim();

  if (!normalized) {
    return "可以问我：生生读书会适合谁？亲子跑团怎么参加？生生文化是什么？";
  }

  try {
    const response = await request<{ answer: string }>("/api/shengsheng-skill/chat", {
      method: "POST",
      data: {
        message: normalized,
        history: history.slice(-6)
      }
    });

    if (response.data.answer) return response.data.answer;
  } catch (error) {
    console.warn("生生助手接口不可用，使用本地兜底回答", error);
  }

  if (normalized.includes("读书") || normalized.includes("课程") || normalized.includes("论语")) {
    return "生生读书会以经典共读、日常打卡和书友分享为核心。一期小程序会先提供课程列表、场次信息和轻量报名入口。";
  }

  if (normalized.includes("跑") || normalized.includes("亲子") || normalized.includes("活动")) {
    return "生生亲子跑团通过轻松晨跑连接家庭陪伴。一期小程序会展示活动时间、地点、路线、名额和报名表单。";
  }

  if (normalized.includes("生生") || normalized.includes("文化") || normalized.includes("使命")) {
    return "生生文化希望以读书、运动、游学和艺术美育等方式，让更多家庭在日常生活中亲近中华文化。";
  }

  if (history.length > 0) {
    return "这个问题暂时超出一期生生助手范围。我可以继续介绍生生读书会、亲子跑团、活动报名和品牌理念。";
  }

  return "我目前主要回答生生文化、读书会、亲子跑团和活动报名相关问题。";
}
