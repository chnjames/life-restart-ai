/**
 * 完全 AI 驱动的事件系统
 * 替代传统的固定事件库，实现真正的动态人生模拟
 */
import { defineStore } from 'pinia'
import type { EventCard, Choice, GameSession, AvatarProfile, GameStats } from '@/types/game'
import { DoubaoService } from '@/services/openai'
import { useSettingsStore } from './settings'

export const useEventsStore = defineStore('events', {
  state: () => ({
    // AI 服务实例
    doubaoService: null as DoubaoService | null,
    
    // 动态事件缓存和历史
    eventCache: new Map<string, EventCard>(),
    eventHistory: [] as string[], // 最近使用的事件ID
    
    // 事件生成统计
    generationStats: {
      totalGenerated: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageGenerationTime: 0,
      lastGenerationTime: 0
    },
    
    // 当前筛选状态（保持兼容性）
    currentLabels: [] as string[],
    filteredEvents: [] as EventCard[],
    
    // 配置选项
    config: {
      enableAI: true,
      maxCacheSize: 100,
      maxRetries: 3,
      generationTimeout: 20000,
      fallbackEnabled: true,
      historyLength: 10
    }
  }),

  getters: {
    isAIReady: (state) => state.doubaoService !== null,
    
    totalCachedEvents: (state) => state.eventCache.size,
    
    recentEventIds: (state) => state.eventHistory.slice(-5),
    
    generationSuccessRate: (state) => {
      const total = state.generationStats.totalGenerated
      return total > 0 ? (state.generationStats.successfulGenerations / total * 100).toFixed(1) : '0'
    }
  },

  actions: {
    async isAIWorking(): Promise<boolean> {
      if (this.doubaoService) return true

      try {
        const settingsStore = useSettingsStore()
        
        if (!settingsStore.apiConfig.openai_api_key) {
          console.warn('⚠️ OpenAI API Key 未配置，AI 事件生成将不可用')
          return false
        }

        this.doubaoService = new DoubaoService(
          settingsStore.apiConfig.openai_api_key,
          settingsStore.apiConfig.openai_base_url || '/doubao'
        )
        
        console.log('✅ AI 事件生成服务初始化成功')
        return true
      } catch (error) {
        console.error('❌ 初始化 AI 服务失败:', error)
        this.doubaoService = null
        return false
      }
    },

    // 完全由 AI 生成事件库 - 替代固定的 initializeEventLibrary
    async initializeEventLibrary() {
      console.log('🤖 开始初始化 AI 驱动的事件系统...')
      
      // 初始化 AI 服务
      const aiReady = await this.initializeAI()
      
      // 清空旧的缓存
      this.eventCache.clear()
      this.eventHistory = []
      
      if (!aiReady) {
        console.warn('⚠️ AI 服务未就绪，将使用后备事件系统')
        return
      }

      console.log('✅ AI 事件系统初始化完成，准备动态生成事件')
    },

    // 核心方法：智能获取事件（纯 AI 驱动，无模板依赖）
    async getSmartEvent(session?: GameSession): Promise<EventCard | null> {
      console.log('🎯 开始纯AI事件生成...')
      
      if (!session) {
        console.error('❌ 缺少游戏会话信息，无法生成事件')
        return null
      }

      // 确保 AI 服务可用
      if (!this.isAIReady) {
        const aiInitialized = await this.initializeAI()
        if (!aiInitialized) {
          console.error('❌ AI 服务初始化失败，无法生成事件')
          return null
        }
      }

      // 单次尝试 AI 生成（避免多次重复调用）
      console.log('🤖 开始 AI 事件生成...')
      
      try {
        const aiEvent = await this.generateAIEvent(session)
        if (aiEvent) {
          this.recordEventUsage(aiEvent.id, 'ai')
          console.log('✅ AI 事件生成成功')
          return aiEvent
        }
      } catch (error) {
        console.warn('⚠️ AI 生成失败，使用后备事件:', error)
      }

      // AI 生成失败，返回紧急后备事件
      console.error('❌ AI 生成失败，返回紧急后备事件')
      const emergencyEvent = this.getFallbackEvent(session)
      this.recordEventUsage(emergencyEvent.id, 'fallback')
      return emergencyEvent
    },

    // AI 动态生成事件
    async generateAIEvent(session: GameSession): Promise<EventCard | null> {
      const startTime = Date.now()
      
      try {
        console.log('🤖 开始 AI 生成事件...')
        this.generationStats.totalGenerated++
        
        // 构建生成提示
        const prompt = this.buildEventGenerationPrompt(session)
        
        // 调用专门的事件生成API
        const response = await this.doubaoService!.generateLifeEvent(prompt)

        // 解析 AI 响应
        const aiEvent = this.parseAIResponse(response, session)
        
        if (aiEvent) {
          // 缓存事件
          this.eventCache.set(aiEvent.id, aiEvent)
          this.cleanupCache()
          
          // 更新统计
          const generationTime = Date.now() - startTime
          this.updateGenerationStats(true, generationTime)
          
          console.log('✅ AI 生成事件成功:', aiEvent.title)
          return aiEvent
        }
        
        throw new Error('AI 响应解析失败')
        
      } catch (error) {
        console.error('❌ AI 生成事件失败:', error)
        this.updateGenerationStats(false, Date.now() - startTime)
        return null
      }
    },

    // 构建 AI 生成提示 - 完全动态，无预设模板
    buildEventGenerationPrompt(session: GameSession): string {
      const age = session.current_age
      const stats = session.current_stats
      const flags = session.current_flags
      const recentEvents = this.eventHistory.slice(-5) // 增加历史事件数量以更好避重
      
      // 动态分析玩家特征
      const highestStat = this.getHighestStat(stats)
      const ageStage = this.getAgeStage(age)
      const personalityTraits = this.analyzePersonality(stats, flags)
      const lifeContext = this.generateLifeContext(age, stats, flags)
      
      return `
你是一个专业的人生模拟器事件生成器。请为玩家生成一个完全原创的人生事件，要求具有高度的真实性和个性化。

## 玩家档案
**基本信息:**
- 年龄: ${age}岁 (人生阶段: ${ageStage})
- 性别: ${session.avatar_profile.性别}
- 核心优势: ${highestStat} (${stats[highestStat as keyof GameStats]}/10分)

**个性画像:**
- 性格特征: ${personalityTraits.join(', ')}
- 生活状态: ${flags.slice(-3).join(', ') || '普通生活状态'}
- 人生背景: ${lifeContext}

**历史避重:**
${recentEvents.length > 0 ? `- 最近经历过的事件类型，请避免重复: ${recentEvents.join(', ')}` : '- 这是新的开始，可以生成任何合适的事件'}

## 创作要求
1. **真实性**: 事件必须是${age}岁${session.avatar_profile.性别}在现实生活中可能遇到的真实情况
2. **个性化**: 深度结合玩家的属性优势、性格特征和当前状态
3. **原创性**: 完全原创的事件，避免套用常见模板
4. **成长性**: 事件应该提供有意义的人生体验和成长机会
5. **选择多样性**: 3个选择应该代表不同的人生态度和价值观

## 事件类型建议
根据年龄${age}岁，可以考虑但不限于：
- 学习成长类事件（适合学生阶段）
- 职业发展类事件（适合工作阶段）
- 人际关系类事件（适合所有阶段）
- 健康生活类事件（适合所有阶段）
- 兴趣爱好类事件（适合所有阶段）
- 意外机遇类事件（适合所有阶段）
- 道德选择类事件（适合所有阶段）

**重要**: 请不要局限于上述类型，发挥创意生成独特的人生事件！

## 输出格式
请严格按照以下JSON格式输出，不要添加任何其他文字：

\`\`\`json
{
  "title": "事件标题（8-15字，吸引人且具体）",
  "description": "事件详细描述（180-250字，生动具体，有画面感，符合年龄和性别特征）",
  "labels": ["主题标签", "情感标签", "影响标签"],
  "choices": [
    {
      "text": "选择1标题（简洁有力）",
      "description": "选择1的详细描述和可能带来的后果（50-80字）"
    },
    {
      "text": "选择2标题（简洁有力）", 
      "description": "选择2的详细描述和可能带来的后果（50-80字）"
    },
    {
      "text": "选择3标题（简洁有力）",
      "description": "选择3的详细描述和可能带来的后果（50-80字）"
    }
  ]
}
\`\`\`

请确保生成的事件具有深度和意义，能够让玩家感受到真实的人生体验。
      `
    },

    // 生成生活背景描述
    generateLifeContext(age: number, stats: GameStats, flags: string[]): string {
      const contexts = []
      
      // 基于年龄的生活背景
      if (age <= 18) {
        contexts.push('正处于求学阶段，面临学业和成长的双重挑战')
      } else if (age <= 25) {
        contexts.push('刚步入社会，在探索职业道路和独立生活')
      } else if (age <= 35) {
        contexts.push('处于事业发展的关键期，可能面临职场竞争和人生选择')
      } else if (age <= 50) {
        contexts.push('人生阅历丰富，在事业和家庭中寻求平衡')
      } else {
        contexts.push('拥有丰富的人生经验，更注重生活品质和精神追求')
      }
      
      // 基于属性的背景
      const highestStat = this.getHighestStat(stats)
      if (stats[highestStat as keyof GameStats] >= 8) {
        if (highestStat === '智力') {
          contexts.push('以聪明才智著称，经常被人寻求建议')
        } else if (highestStat === '体质') {
          contexts.push('身体素质出众，热爱运动和健康生活')
        } else if (highestStat === '魅力') {
          contexts.push('个人魅力突出，在社交场合备受关注')
        }
      }
      
      // 基于标签的背景
      if (flags.length > 0) {
        const recentFlags = flags.slice(-2)
        contexts.push(`最近的生活状态: ${recentFlags.join('、')}`)
      }
      
      return contexts.join('；')
    },

    // 解析 AI 响应 - 纯 AI 驱动，无模板后备
    parseAIResponse(response: any, session: GameSession): EventCard | null {
      try {
        // 提取 JSON 内容
        let jsonContent = response
        
        if (typeof response === 'string') {
          // 尝试提取 JSON 代码块
          const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            jsonContent = jsonMatch[1]
          } else {
            // 尝试直接解析整个响应
            jsonContent = response.trim()
          }
        }
        
        const eventData = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent
        
        // 验证必需字段
        if (!eventData.title || !eventData.description || !eventData.choices) {
          throw new Error('AI 响应缺少必需字段')
        }
        
        // 验证选择数组
        if (!Array.isArray(eventData.choices) || eventData.choices.length < 2) {
          throw new Error('AI 响应选择数量不足')
        }
        
        // 生成唯一 ID
        const eventId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
        
        // 构建事件卡片
        const eventCard: EventCard = {
          id: eventId,
          title: eventData.title,
          description: eventData.description,
          labels: Array.isArray(eventData.labels) ? eventData.labels : ['AI生成'],
          choices: eventData.choices.map((choice: any, index: number) => ({
            id: `${eventId}_${String.fromCharCode(97 + index)}`,
            text: choice.text || `选择${index + 1}`,
            description: choice.description || '未知后果'
          }))
        }
        
        console.log('✅ AI 事件解析成功:', eventCard.title)
        return eventCard
        
      } catch (error) {
        console.error('❌ 解析 AI 响应失败:', error)
        console.error('原始响应:', response)
        
        // 不使用模板，直接返回 null，让系统重试或使用其他策略
        return null
      }
    },

    // 获取后备事件 - 仅在 AI 完全不可用时使用
    getFallbackEvent(session?: GameSession): EventCard {
      console.warn('⚠️ 使用最后的后备事件，建议检查 AI 服务配置')
      
      const eventId = `emergency_${Date.now()}`
      const age = session?.current_age || 20
      
      return {
        id: eventId,
        title: '人生转折点',
        description: `在${age}岁的这个关键时刻，你站在人生的十字路口，需要做出一个重要的决定。这个选择将影响你未来的道路。`,
        labels: ['转折', '选择', '人生'],
        choices: [
          { 
            id: `${eventId}_a`, 
            text: '勇敢探索', 
            description: '选择未知的道路，虽然充满挑战但可能带来意想不到的机遇' 
          },
          { 
            id: `${eventId}_b`, 
            text: '稳步前进', 
            description: '选择相对安全的路径，虽然平稳但可能错过一些机会' 
          },
          { 
            id: `${eventId}_c`, 
            text: '寻求指导', 
            description: '向有经验的人寻求建议，在他们的帮助下做出明智的选择' 
          }
        ]
      }
    },

    // 记录事件使用
    recordEventUsage(eventId: string, source: 'ai' | 'fallback') {
      this.eventHistory.push(eventId)
      
      // 保持历史记录长度
      if (this.eventHistory.length > this.config.historyLength) {
        this.eventHistory = this.eventHistory.slice(-this.config.historyLength)
      }
      
      console.log(`📝 记录事件使用: ${eventId} (${source})`)
    },

    // 更新生成统计
    updateGenerationStats(success: boolean, generationTime: number) {
      if (success) {
        this.generationStats.successfulGenerations++
      } else {
        this.generationStats.failedGenerations++
      }
      
      this.generationStats.lastGenerationTime = generationTime
      
      // 更新平均生成时间
      const total = this.generationStats.successfulGenerations + this.generationStats.failedGenerations
      this.generationStats.averageGenerationTime = 
        (this.generationStats.averageGenerationTime * (total - 1) + generationTime) / total
    },

    // 清理缓存
    cleanupCache() {
      if (this.eventCache.size > this.config.maxCacheSize) {
        // 删除最旧的事件
        const entries = Array.from(this.eventCache.entries())
        const toDelete = entries.slice(0, entries.length - this.config.maxCacheSize + 10)
        
        toDelete.forEach(([id]) => {
          this.eventCache.delete(id)
        })
        
        console.log(`🧹 清理缓存: 删除了 ${toDelete.length} 个旧事件`)
      }
    },

    // 分析玩家个性
    analyzePersonality(stats: GameStats, flags: string[]): string[] {
      const traits: string[] = []
      
      // 基于属性分析
      if (stats.智力 >= 8) traits.push('聪明')
      if (stats.体质 >= 8) traits.push('健康')
      if (stats.魅力 >= 8) traits.push('有魅力')
      if (stats.智力 >= 7 && stats.魅力 >= 7) traits.push('全面发展')
      
      // 基于标签分析
      if (flags.some(f => f.includes('学霸'))) traits.push('学术型')
      if (flags.some(f => f.includes('运动'))) traits.push('运动型')
      if (flags.some(f => f.includes('社交'))) traits.push('社交型')
      
      return traits.length > 0 ? traits : ['普通']
    },

    // 获取年龄阶段
    getAgeStage(age: number): string {
      if (age <= 12) return '童年'
      if (age <= 18) return '青少年'
      if (age <= 25) return '青年'
      if (age <= 35) return '成年'
      if (age <= 50) return '中年'
      if (age <= 65) return '壮年'
      return '老年'
    },

    // 获取最高属性
    getHighestStat(stats: GameStats): string {
      const statEntries = Object.entries(stats).filter(([key]) => key !== '金钱')
      const highest = statEntries.reduce((max, current) => 
        current[1] > max[1] ? current : max
      )
      return highest[0]
    },



    // 兼容性方法
    filterEvents(labels: string[], currentAge: number, flags: string[]) {
      // 为了保持兼容性，这里不做实际筛选
      // AI 系统会根据这些参数动态生成合适的事件
      this.currentLabels = labels
      console.log('🔍 事件筛选参数已记录:', { labels, currentAge, flags })
    },

    getRandomEvent(): EventCard | null {
      // 兼容性方法，返回通用事件
      return this.getFallbackEvent()
    },

    getEventById(id: string): EventCard | null {
      return this.eventCache.get(id) || null
    },

    addCustomEvent(event: EventCard) {
      this.eventCache.set(event.id, event)
    },

    // 重置系统（新游戏时调用）
    resetEventHistory() {
      this.eventHistory = []
      this.eventCache.clear()
      this.generationStats = {
        totalGenerated: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        averageGenerationTime: 0,
        lastGenerationTime: 0
      }
      console.log('🔄 事件系统已重置')
    }
  }
})