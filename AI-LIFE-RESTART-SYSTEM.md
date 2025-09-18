# 🎮 AI 驱动的人生重开模拟器

## 项目概述

基于经典的 [lifeRestart](https://github.com/VickScarlet/lifeRestart) 项目理念，我们开发了一个全新的 AI 驱动人生事件系统。该系统用人工智能替代了传统的 Excel 表格驱动模式，实现了真正的动态、个性化人生模拟体验。

## 🔄 系统对比

### 传统 Excel 驱动系统 ❌
- **固定事件库**：所有事件都预先定义在表格中
- **有限可能性**：事件数量受限于表格大小
- **重复性高**：容易陷入固定的事件循环（如 sports_001）
- **缺乏个性化**：所有玩家体验相似的事件序列
- **难以扩展**：添加新事件需要手动编辑表格
- **静态映射**：年龄-事件关系固化

### AI 驱动动态系统 ✅
- **动态生成**：AI 实时创造独特的人生事件
- **无限可能**：每次游戏都能产生全新的体验
- **智能避重**：系统自动避免重复和循环
- **高度个性化**：基于玩家属性、历史、年龄定制事件
- **自动扩展**：AI 持续学习和优化事件生成
- **智能关联**：年龄-事件关系由 AI 动态判断

## 🏗️ 系统架构

### 核心组件

#### 1. LifeEventEngine (`src/services/lifeEventEngine.ts`)
人生事件引擎的核心类，负责：
- **年龄阶段管理**：定义 7 个人生阶段（幼儿期到老年期）
- **AI 事件生成**：调用豆包AI API 生成个性化事件
- **上下文分析**：分析玩家状态、历史、属性
- **事件验证**：确保生成的事件符合年龄和逻辑
- **模板后备**：AI 失败时提供高质量模板事件

#### 2. LifeEventsStore (`src/stores/lifeEvents.ts`)
事件管理存储，提供：
- **缓存机制**：避免重复生成相同条件的事件
- **性能统计**：跟踪 AI 成功率、生成时间等
- **重试机制**：AI 失败时的智能重试策略
- **历史管理**：记录和分析事件生成模式

#### 3. 年龄阶段系统
```javascript
const ageStages = [
  { name: '幼儿期', minAge: 0, maxAge: 5, themes: ['家庭', '启蒙', '天真'] },
  { name: '童年期', minAge: 6, maxAge: 12, themes: ['学校', '友谊', '探索'] },
  { name: '青春期', minAge: 13, maxAge: 18, themes: ['青春', '叛逆', '成长'] },
  { name: '青年期', minAge: 19, maxAge: 30, themes: ['大学', '工作', '恋爱'] },
  { name: '成年期', minAge: 31, maxAge: 50, themes: ['事业', '家庭', '责任'] },
  { name: '中年期', minAge: 51, maxAge: 65, themes: ['稳定', '传承', '健康'] },
  { name: '老年期', minAge: 66, maxAge: 100, themes: ['退休', '健康', '回忆'] }
]
```

## 🤖 AI 生成机制

### 1. 智能提示词构建
系统为每个年龄和状态构建详细的 AI 提示词：

```javascript
const prompt = `
# 人生重开模拟器 - ${age}岁事件生成

## 角色信息
- 年龄: ${age}岁 (${ageStage.name})
- 性别: ${profile.性别}
- 属性: 智力${stats.智力} 体质${stats.体质} 魅力${stats.魅力}
- 主导属性: ${dominantStat}

## 年龄阶段特征
- 阶段: ${ageStage.name}
- 核心主题: ${ageStage.baseLabels.join(', ')}
- 常见事件: ${ageStage.commonEvents.join(', ')}

## 生成要求
请生成一个符合${age}岁${ageStage.name}特征的人生事件...
`
```

### 2. 上下文感知生成
AI 会考虑多个维度：
- **年龄适宜性**：确保事件符合当前年龄段
- **属性匹配**：高智力玩家更容易遇到学术事件
- **历史连贯性**：避免与最近事件重复
- **个性化定制**：基于玩家的选择历史
- **现实合理性**：确保事件在现实中可能发生

### 3. 多层后备机制
```
AI 生成 (70% 成功率)
    ↓ 失败
智能模板 (基于年龄和属性)
    ↓ 失败  
通用后备事件 (100% 可用)
```

## 📊 核心特性

### 1. 年龄精准匹配
- **16岁**：学业压力、青春烦恼、升学选择
- **26岁**：职业发展、恋爱结婚、经济独立
- **36岁**：事业巅峰、家庭责任、子女教育
- **56岁**：健康关注、经验传承、人生反思
- **76岁**：退休生活、家族传承、健康养生

### 2. 个性化体验
```javascript
// 智力型玩家 (智力 >= 7)
events.push({
  title: '学术研究机会',
  description: '你的学术能力得到认可...',
  choices: ['深入研究', '理性分析', '寻求合作']
})

// 魅力型玩家 (魅力 >= 7)  
events.push({
  title: '社交领导机会',
  description: '你的个人魅力吸引了众人...',
  choices: ['积极领导', '魅力说服', '建立人脉']
})
```

### 3. 智能权重系统
```javascript
// 权重计算示例
let weight = 1.0
if (event.labels.includes('学习') && stats.智力 > 7) {
  weight *= 1.5  // 高智力玩家更容易遇到学习事件
}
if (recentEvents.includes(event.theme)) {
  weight *= 0.3  // 降低重复事件权重
}
if (event.source === 'ai') {
  weight *= 1.2  // AI 生成事件获得额外权重
}
```

### 4. 历史学习机制
- **事件历史追踪**：记录最近 10 个事件
- **重复避免**：智能过滤最近 3 个事件的主题
- **模式识别**：分析玩家的选择偏好
- **适应性调整**：根据历史优化后续事件生成

## 🎯 解决的核心问题

### 问题 1: 事件重复循环
**原问题**：玩家容易卡在 `sports_001` 等固定事件上
**解决方案**：
- AI 动态生成避免固定 ID
- 智能权重系统降低重复概率
- 历史追踪机制主动避免重复

### 问题 2: 缺乏个性化
**原问题**：所有玩家体验相似的事件序列
**解决方案**：
- 基于属性的个性化生成
- 历史选择影响后续事件
- 年龄阶段精准匹配

### 问题 3: 扩展性限制
**原问题**：添加新事件需要手动编辑表格
**解决方案**：
- AI 自动生成无限事件
- 模板系统支持快速扩展
- 配置化的年龄阶段管理

## 📈 性能优化

### 1. 缓存机制
```javascript
// 缓存键构建
const cacheKey = `${age}_${statsHash}_${flagsHash}_${historyHash}`
if (eventCache.has(cacheKey)) {
  return eventCache.get(cacheKey)  // 直接返回缓存
}
```

### 2. 智能重试
```javascript
// 最多重试 3 次，每次间隔递增
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const event = await aiGeneration()
    if (validateEvent(event)) return event
  } catch (error) {
    await sleep(1000 * attempt)  // 1s, 2s, 3s
  }
}
```

### 3. 超时保护
```javascript
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('生成超时')), 10000)
})
const event = await Promise.race([aiGeneration(), timeoutPromise])
```

## 🧪 测试和验证

### 测试页面
- **`test-ai-life-events.html`**：完整的 AI 事件系统演示
- **`test-event-system.html`**：事件多样性和避重测试
- **`test-cors-fix-final.html`**：API 集成测试

### 关键指标
- **事件多样性**：目标 >80%（避免重复）
- **AI 成功率**：目标 >70%（AI 生成成功）
- **生成速度**：目标 <3秒（包含重试）
- **年龄适宜性**：目标 100%（事件符合年龄）

## 🚀 使用方法

### 1. 系统集成
```javascript
// 在 GameView.vue 中
import { useLifeEventsStore } from '@/stores/lifeEvents'

const lifeEventsStore = useLifeEventsStore()

// 生成年龄相关事件
const event = await lifeEventsStore.generateEventForAge(gameSession)
```

### 2. 配置选项
```javascript
// 在 lifeEvents store 中
config: {
  enableAI: true,           // 启用 AI 生成
  cacheSize: 100,          // 缓存大小
  maxRetries: 3,           // 最大重试次数
  generationTimeout: 10000  // 生成超时时间
}
```

### 3. 监控和调试
```javascript
// 获取生成统计
const stats = lifeEventsStore.generationStats
console.log('AI 成功率:', stats.aiSuccessRate)
console.log('平均生成时间:', stats.averageGenerationTime)
console.log('缓存命中率:', stats.cacheHitRate)
```

## 🔮 未来扩展

### 1. 高级 AI 功能
- **情感分析**：基于玩家情绪状态生成事件
- **社交网络**：考虑 NPC 关系的复杂事件
- **长期规划**：AI 预测和规划玩家的人生轨迹

### 2. 多模态生成
- **图像生成**：为每个事件生成配套图像
- **音频叙述**：AI 语音讲述事件内容
- **视频片段**：动态展示关键人生时刻

### 3. 社区功能
- **事件分享**：玩家分享有趣的 AI 生成事件
- **集体学习**：AI 从所有玩家的选择中学习
- **排行榜**：基于人生成就的全球排名

## 📋 技术栈

- **前端框架**：Vue 3 + TypeScript + Pinia
- **AI 服务**：豆包AI doubao-1-5-pro-32k-250115 / Seedream 4.0
- **图像生成**：Seedream 4.0
- **构建工具**：Vite
- **样式框架**：Tailwind CSS

## 🎉 总结

这个 AI 驱动的人生重开系统成功解决了传统 Excel 驱动模式的核心问题：

1. **✅ 消除重复循环**：不再卡在固定事件上
2. **✅ 实现真正个性化**：每个玩家都有独特体验  
3. **✅ 提供无限可能性**：AI 创造无穷的人生故事
4. **✅ 保持年龄适宜性**：精准匹配人生阶段特征
5. **✅ 支持持续扩展**：系统可以不断学习和改进

通过将 AI 的创造力与传统游戏的结构化设计相结合，我们创造了一个真正动态、个性化的人生模拟体验。每一次重开都是全新的人生旅程，充满未知的可能性和惊喜！

---

*"人生如戏，但现在 AI 是编剧。每个选择都写就独特的人生剧本。"* 🎭✨