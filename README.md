# AI 人生重开 · 纯智能版

一个基于 Vue 3 + TypeScript 的纯前端人生重开模拟游戏。所有事件由豆包 AI 实时生成，配图由 Seedream 图像模型渲染，每次重开都是独一无二的人生故事。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-FF6B6B.svg)](https://console.volcengine.com/ark)

## 核心特性

**纯 AI 驱动事件系统**
- 零预设剧本，所有事件由豆包 AI 基于玩家属性、年龄、历史经历动态生成
- 自动分析历史事件避免重复，按年龄阶段适配事件类型

**智能图像生成**
- Seedream 为每个事件生成专属配图，优先使用局部编辑保持角色外观一致性
- 角色档案包含性别、发型、脸型、肤色、体型、色板等参数，确保跨回合连贯

**纯前端架构**
- 100% 前端实现，无需后端部署
- 所有数据存储在浏览器 localStorage，不上传服务器
- 内置 Vite 开发代理解决 CORS 问题
- 支持纯文本模式（关闭图像生成）

## 快速开始

### 环境要求

- Node.js 18+
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）

### 安装与运行

```bash
git clone https://github.com/chnjames/life-restart-ai.git
cd life-restart-ai
npm install
npm run dev
```

浏览器访问 `http://localhost:3000`

### API 配置

启动后在应用的 **设置页面** 中配置以下信息（非环境变量文件）：

**豆包 AI API（必需，用于事件生成）**
- API Key：在 [火山方舟控制台](https://console.volcengine.com/ark) 获取
- Base URL：默认 `https://ark.cn-beijing.volces.com/api/v3`（开发环境自动通过代理转发，无需修改）

**Seedream API（可选，用于图像生成）**
- API Key：与豆包 AI 使用同一个 ARK API Key
- Base URL：默认 `https://ark.cn-beijing.volces.com/api/v3`

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3.4（Composition API） |
| 开发语言 | TypeScript 5.2 |
| 状态管理 | Pinia 2.1 |
| 路由 | Vue Router 4.2 |
| 样式 | Tailwind CSS 3.3 |
| 构建工具 | Vite 4.4 |
| AI 服务 | 豆包 AI（文本）+ Seedream（图像）|

## 项目结构

```
src/
├── components/           # 游戏组件
│   ├── StatsPanel.vue       # 属性面板
│   ├── EventCard.vue        # 事件卡片
│   └── CharacterCreator.vue # 角色创建
├── views/                # 页面视图
│   ├── HomeView.vue         # 首页
│   ├── GameView.vue         # 主游戏界面
│   └── SettingsView.vue     # 设置页面
├── stores/               # 状态管理（Pinia）
│   ├── game.ts              # 游戏会话状态
│   ├── settings.ts          # API 配置与偏好
│   ├── events.ts            # AI 事件生成系统
│   └── lifeEvents.ts        # 年龄阶段事件引擎
├── services/             # 核心服务
│   ├── openai.ts            # 豆包 AI 集成（DoubaoService）
│   ├── seedream.ts          # Seedream 图像集成
│   ├── gameEngine.ts        # 游戏引擎（回合处理 + 图像协调）
│   └── lifeEventEngine.ts   # 年龄阶段事件引擎
├── types/
│   └── game.ts              # TypeScript 类型定义
├── utils/
│   ├── imageGeneration.ts   # 图像生成策略
│   └── safety.ts            # 内容安全检查
├── App.vue                  # 根组件（导航 + 布局）
├── main.ts                  # 入口（含路由配置）
└── style.css                # 全局样式 + 设计令牌
```

## 使用指南

### 角色创建

在游戏页面创建角色：设定姓名、性别、起始年龄，选择发型、脸型、肤色、体型等外观参数，分配 20 点属性到智力、体质、魅力、运气，并选择角色色板预设。

### 游戏流程

1. 阅读 AI 生成的事件描述和配图
2. 从 2-4 个选项中做出选择
3. 观察属性变化和结果反馈
4. 继续下一个人生阶段（年龄递增）

### 数据管理

- 游戏存档自动保存到 localStorage
- 支持导出/导入存档数据（JSON 格式）
- 可在设置页面一键清除所有本地数据

## 开发指南

```bash
npm run dev      # 启动开发服务器
npm run build    # 类型检查 + 生产构建
npm run lint     # ESLint 代码检查
npm run format   # Prettier 格式化
```

### Vite 开发代理

开发环境内置两个代理，解决浏览器 CORS 限制：

- `/doubao` → `https://ark.cn-beijing.volces.com/api/v3`（文本 AI）
- `/seedream` → `https://ark.cn-beijing.volces.com/api/v3`（图像 AI）

生产环境需要在设置页面填写完整的 API Base URL。

### AI 事件生成流程

```
玩家行动 → 分析当前状态 → 构建动态 Prompt → 豆包 AI 生成事件
→ 解析 JSON 响应 → 验证事件数据 → Seedream 生成配图 → 展示事件卡片
```

事件生成失败时自动降级到后备事件系统，保证游戏不中断。

## 贡献

欢迎提交 Issue 和 Pull Request。

1. 在 GitHub 上 Fork 本项目
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## 联系方式

- 问题反馈：[GitHub Issues](https://github.com/chnjames/life-restart-ai/issues)
- 邮箱：[chnrural910@gmail.com](mailto:chnrural910@gmail.com)

## 许可证

[MIT License](LICENSE)
