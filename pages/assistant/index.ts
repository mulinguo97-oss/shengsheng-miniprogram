import { askAssistant } from "../../services/agents";
import { AssistantMessage } from "../../types/domain";

Page({
  data: {
    inputValue: "",
    messages: [
      {
        role: "assistant",
        content: "你好，我是生生助手。可以咨询生生文化、读书会、亲子跑团和活动报名。"
      }
    ] as AssistantMessage[],
    loading: false
  },

  onInput(event: WechatMiniprogram.Input) {
    this.setData({ inputValue: event.detail.value });
  },

  async sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.loading) return;

    const nextMessages = [
      ...this.data.messages,
      { role: "user" as const, content }
    ];

    this.setData({
      inputValue: "",
      messages: nextMessages,
      loading: true
    });

    try {
      const answer = await askAssistant(content, nextMessages);
      this.setData({
        messages: [
          ...nextMessages,
          { role: "assistant" as const, content: answer }
        ]
      });
    } catch (error) {
      this.setData({
        messages: [
          ...nextMessages,
          {
            role: "assistant" as const,
            content: error instanceof Error ? error.message : "生生助手暂时不可用，请稍后再试。"
          }
        ]
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  askPreset(event: WechatMiniprogram.TouchEvent) {
    const question = event.currentTarget.dataset.question as string;
    this.setData({ inputValue: question });
    void this.sendMessage();
  }
});
