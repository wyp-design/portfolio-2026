import type { Project, SiteContent } from "./types";

export const siteCopy: SiteContent = {
  name: "YOUR.NAME",
  shortRole: { zh: "数字产品设计师", en: "Digital Product Designer" },
  location: { zh: "上海 · 面向世界", en: "Shanghai · Working globally" },
  heroTitle: {
    line1: { zh: "让复杂变清晰", en: "MAKE COMPLEX" },
    line2: { zh: "让体验有感觉", en: "FEEL CLEAR" },
  },
  intro: {
    zh: "我把复杂系统变成清晰、有人情味的数字体验。",
    en: "I turn complex systems into clear, human digital experiences.",
  },
  heroIndex: "001 / PORTFOLIO / 2026",
  scrollLabel: { zh: "向下探索", en: "Scroll to explore" },
  manifestoIntro: { zh: "我相信好的设计不是装饰。", en: "I believe good design is not decoration." },
  manifestoLine1: { zh: "它是对问题的理解，", en: "IT IS UNDERSTANDING," },
  manifestoLine2: { zh: "也是对人的尊重。", en: "AND RESPECT FOR PEOPLE." },
  workLabel: { zh: "精选作品", en: "Selected work" },
  workIntro: {
    zh: "横跨 AI、移动产品、设计系统与数据体验。",
    en: "Across AI, mobile, design systems, and data experiences.",
  },
  bio: {
    zh: "专注 UI/UX、产品策略与设计系统。我喜欢在逻辑与感觉之间工作：让界面经得起推敲，也让使用它的人感到轻松。",
    en: "I work across UI/UX, product strategy, and design systems—balancing rigorous logic with experiences that feel effortless.",
  },
  aboutLabel: { zh: "关于我", en: "About" },
  aboutHeadline: {
    zh: "策略的脑，手艺人的心。",
    en: "A strategist’s mind. A maker’s heart.",
  },
  capabilities: [
    { zh: "产品策略", en: "Product strategy" },
    { zh: "体验设计", en: "Experience design" },
    { zh: "界面与动效", en: "Interface & motion" },
    { zh: "设计系统", en: "Design systems" },
  ],
  contactLabel: { zh: "一起创造", en: "Let’s create" },
  contactHeadline: { zh: "有意思的东西。", en: "SOMETHING WITH MEANING." },
  email: "hello@yourname.design",
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "Behance", href: "https://www.behance.net" },
    { label: "GitHub", href: "https://github.com" },
  ],
};

export const projects: Project[] = [
  {
    slug: "atlas-ai",
    title: { zh: "Atlas AI 工作台", en: "Atlas AI Workspace" },
    summary: {
      zh: "让跨职能团队能看懂、控制并复用 AI 工作流。",
      en: "Making AI workflows legible, controllable, and reusable for cross-functional teams.",
    },
    year: "2026",
    role: { zh: "产品设计 / 研究", en: "Product Design / Research" },
    category: { zh: "AI 产品", en: "AI Product" },
    accent: "#9aff58",
    order: 1,
    featured: true,
    metrics: [
      { value: "42%", label: { zh: "任务时间降低", en: "faster task completion" } },
      { value: "3.1×", label: { zh: "工作流复用", en: "workflow reuse" } },
      { value: "18", label: { zh: "用户访谈", en: "user interviews" } },
    ],
    sections: [
      {
        eyebrow: { zh: "背景", en: "Context" },
        title: { zh: "AI 很强，但过程像一个黑盒。", en: "Powerful AI, opaque process." },
        body: {
          zh: "团队需要的不只是一个聊天框，而是一套能理解上下文、审阅步骤并安全复用的工作方式。",
          en: "Teams needed more than a chat box: they needed a way to understand context, review steps, and reuse successful work safely.",
        },
        tone: "light",
      },
      {
        eyebrow: { zh: "设计方向", en: "Design direction" },
        title: { zh: "把提示词变成可见的系统。", en: "Turn prompts into a visible system." },
        body: {
          zh: "我将任务拆成可组合节点，让输入、判断、工具和输出都能被检查、复制与协作。",
          en: "I decomposed tasks into composable nodes so inputs, decisions, tools, and outputs could be inspected, copied, and shared.",
        },
        tone: "blue",
      },
      {
        eyebrow: { zh: "结果", en: "Outcome" },
        title: { zh: "更快完成，也更敢于交付。", en: "Faster work, stronger confidence." },
        body: {
          zh: "首轮可用性测试显示，透明的运行状态和历史版本显著降低了误操作与重复劳动。",
          en: "Early usability testing showed that transparent run states and version history reduced errors and duplicated work.",
        },
        tone: "dark",
      },
    ],
  },
  {
    slug: "mori-health",
    title: { zh: "Mori 健康陪伴", en: "Mori Health Companion" },
    summary: { zh: "把长期健康管理变成温和、可持续的日常动作。", en: "Turning long-term health management into gentle daily action." },
    year: "2025",
    role: { zh: "体验设计", en: "Experience Design" },
    category: { zh: "移动应用", en: "Mobile App" },
    accent: "#ff786b",
    order: 2,
    metrics: [],
    sections: [
      {
        eyebrow: { zh: "挑战", en: "Challenge" },
        title: { zh: "健康提醒不该带来压力。", en: "Health reminders should not create anxiety." },
        body: { zh: "我们重新设计了目标、记录和反馈语言，让用户关注趋势而不是失败。", en: "We reframed goals, tracking, and feedback around progress rather than failure." },
        tone: "light",
      },
    ],
  },
  {
    slug: "northstar-system",
    title: { zh: "Northstar 设计系统", en: "Northstar Design System" },
    summary: { zh: "为四条产品线建立共享语言与可靠的交付方式。", en: "A shared language and reliable delivery model across four product lines." },
    year: "2025",
    role: { zh: "设计系统负责人", en: "Design Systems Lead" },
    category: { zh: "设计系统", en: "Design System" },
    accent: "#7e7cff",
    order: 3,
    metrics: [],
    sections: [
      {
        eyebrow: { zh: "系统", en: "System" },
        title: { zh: "组件只是开始，协作才是产品。", en: "Components were the start. Collaboration was the product." },
        body: { zh: "通过令牌、组件、贡献规范和质量看板，把一致性变成团队能力。", en: "Tokens, components, contribution rules, and quality dashboards made consistency a team capability." },
        tone: "dark",
      },
    ],
  },
  {
    slug: "field-notes",
    title: { zh: "Field Notes", en: "Field Notes" },
    summary: { zh: "面向实地研究的轻量记录与洞察工具。", en: "A lightweight capture and synthesis tool for field research." },
    year: "2024",
    role: { zh: "产品设计", en: "Product Design" },
    category: { zh: "工具", en: "Tooling" },
    accent: "#ffda45",
    order: 4,
    metrics: [],
    sections: [
      {
        eyebrow: { zh: "方法", en: "Method" },
        title: { zh: "让线索在离开现场前连接起来。", en: "Connect signals before leaving the field." },
        body: { zh: "照片、语音、标签和参与者信息在同一条时间线上汇合。", en: "Photos, audio, tags, and participant context converge on one timeline." },
        tone: "lime",
      },
    ],
  },
  {
    slug: "signal-dashboard",
    title: { zh: "Signal 数据驾驶舱", en: "Signal Data Console" },
    summary: { zh: "帮助运营团队从大量数据中快速找到可行动信号。", en: "Helping operations teams find actionable signals in dense data." },
    year: "2024",
    role: { zh: "UI/UX 设计", en: "UI/UX Design" },
    category: { zh: "数据产品", en: "Data Product" },
    accent: "#5dd8ff",
    order: 5,
    metrics: [],
    sections: [
      {
        eyebrow: { zh: "结果", en: "Outcome" },
        title: { zh: "从看报表，到做决定。", en: "From reading reports to making decisions." },
        body: { zh: "围绕异常、影响和建议动作重组信息层级。", en: "The hierarchy was rebuilt around anomalies, impact, and recommended action." },
        tone: "blue",
      },
    ],
  },
];
