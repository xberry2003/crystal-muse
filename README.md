# Crystal Muse

一个面向 **灵感触发 / 情绪梳理 / 夜间复盘** 场景的 AI 陪伴式对话产品。

Crystal Muse 不只是一个通用聊天框，而是尝试把 AI 对话做成一个更有主题感、连续使用感的轻产品：  
支持多模式对话、流式回复、语音输入、历史会话管理、今日水晶卡片与 7 日能量回顾。

---

## 项目简介

Crystal Muse 聚焦三个核心场景：

- **今日灵感**：给用户一个轻量启发和行动切口
- **情绪梳理**：先接住情绪，再帮助表达和整理
- **夜间复盘**：回看一天状态，并沉淀出“今日水晶”

在夜间复盘模式下，系统会从模型输出中解析结构化结果，生成：

- 今日状态
- 今日水晶
- 匹配原因
- 温和建议

同时，系统会把最近 7 天的夜间复盘结果保存在本地，形成右侧的：

- **本周能量手串**
- **最近记录**

---

## 项目亮点

### 1. 多模式 AI 陪伴交互
围绕“今日灵感 / 情绪梳理 / 夜间复盘”三种模式设计不同交互入口与回复风格，而不是单一通用聊天。

### 2. Node.js BFF 封装 Prompt 策略
在服务端根据不同 `mode` 封装 Prompt 策略，统一请求第三方模型接口与流式响应协议，而不是前端直接调用模型。

### 3. SSE 流式输出
基于 `SSE + ReadableStream + TextDecoder` 实现逐字生成效果，提升 AI 陪伴场景下的自然交互体验。

### 4. “今日水晶”结构化反馈
在夜间复盘模式下，将模型输出解析为结构化结果，并以下方卡片的形式展示，增强产品记忆点。

### 5. 7 日连续回顾
将夜间复盘结果写入本地记录，形成“本周能量手串 / 最近记录”，让对话不只停留在单次使用。

### 6. 输入与会话体验补全
支持：

- 历史会话持久化
- 会话新建 / 切换 / 删除 / 重命名
- 停止生成
- 失败重试
- 语音输入（Web Speech API）

---

## 技术栈

### 前端
- React
- Vite
- TypeScript
- React.lazy
- Suspense
- localStorage

### 后端
- Node.js
- Express
- TypeScript

### AI / 交互能力
- OpenRouter API
- SSE
- Web Speech API

---

## 项目结构

```bash
crystal_muse/
├─ apps/
│  ├─ client/                 # 前端应用
│  │  ├─ src/
│  │  │  ├─ components/       # Sidebar / MessageList / ChatBox / VoiceRecorder / RightPanel 等
│  │  │  ├─ hooks/            # useChatSessions 等
│  │  │  ├─ utils/            # crystal 解析等工具
│  │  │  ├─ App.tsx
│  │  │  └─ index.css
│  │
│  └─ server/                 # Node.js BFF 服务
│     ├─ src/
│     │  ├─ controllers/
│     │  ├─ routes/
│     │  ├─ services/         # openrouterService / groqService / geminiService 等
│     │  ├─ app.ts
│     │  └─ index.ts
│
├─ packages/
│  └─ shared/                 # 前后端共享类型
│     └─ src/
│        ├─ chat.ts
│        └─ index.ts
│
├─ package.json
├─ pnpm-workspace.yaml
└─ README.md