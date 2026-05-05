/**
 * 人生事件存储 - 集成 AI 驱动的事件引擎
 * 替代传统的 Excel 表格驱动系统
 */

import { defineStore } from 'pinia'
import type { EventCard, GameSession } from '@/types/game'
import { LifeEventEngine } from '@/services/lifeEventEngine'
import { DoubaoService } from '@/services/openai'
import { useSettingsStore } from './settings'

export const useLifeEventsStore = defineStore('lifeEvents', {
  state: () => ({
    // AI 事件引擎
    eventEngine: null as LifeEventEngine | null,
    
    // 事件缓存
    eventCache: new Map<string, EventCard>(),
    
    // 生成历史
    generationHistory: [] as {
      age: number
      eventId: string
      timestamp: string
      source: 'ai' | 'template' | 'fallback'
    }[],
    
    // 性能统计
    stats: {
      totalGenerated: 0,
      aiSuccessRate: 0,
      averageGenerationTime: 0,
      cacheHitRate: 0
    },
    
    // 配置
    config: {
      enableAI: true,
      cacheSize: 100,
      maxRetries: 3,
      generationTimeout: 10000
    }
  }),

  getters: {
    isInitialized: (state) => state.eventEngine !== null,
    
    generationStats: (state) => ({
      ...state.stats,
      historyCount: state.generationHistory.length,
      cacheSize: state.eventCache.size
    }),
    
    recentEvents: (state) => 
      state.generationHistory
        .slice(-10)
        .map(h => state.eventCache.get(h.eventId))
        .filter(Boolean) as EventCard[]
  },

  actions: {
    /**
     * 初始化事件引擎
     */
    async initializeEngine() {
      if (this.eventEngine) return

      try {
        const settingsStore = useSettingsStore()
        const openaiService = new DoubaoService(
          settingsStore.apiConfig.openai_api_key || '',
          settingsStore.apiConfig.openai_base_url || '/doubao'
        )
        
        this.eventEngine = new LifeEventEngine(openaiService)
        console.log('人生事件引擎初始化成功')
      } catch (error) {
        console.error('初始化事件引擎失败:', error)
        // 不抛出错误，允许后续使用后备方案
        this.eventEngine = null
      }
    },

    /**
     * 核心方法：为指定年龄生成事件
     * 这是替代 Excel 表格查找的核心逻辑
     */
    async generateEventForAge(session: GameSession): Promise<EventCard | null> {
      if (!this.eventEngine) {
        await this.initializeEngine()
      }

      const startTime = Date.now()
      const age = session.current_age
      const cacheKey = this.buildCacheKey(session)

      try {
        // 1. 检查缓存
        if (this.eventCache.has(cacheKey)) {
          this.updateStats('cache_hit')
          return this.eventCache.get(cacheKey)!
        }

        // 2. 生成新事件
        console.log(`为 ${age} 岁生成新事件...`)
        
        let event: EventCard | null = null
        let source: 'ai' | 'template' | 'fallback' = 'fallback'

        if (this.config.enableAI) {
          // 尝试 AI 生成
          event = await this.tryAIGeneration(session)
          if (event) {
            source = 'ai'
          }
        }

        // 3. AI 失败时使用模板
        if (!event && this.eventEngine) {
          event = await this.eventEngine.generateAgeBasedEvent(session)
          source = 'template'
        }

        // 4. 最终后备方案
        if (!event) {
          event = this.generateEmergencyFallback(session)
          source = 'fallback'
        }

        // 5. 缓存和记录
        if (event) {
          this.cacheEvent(cacheKey, event)
          this.recordGeneration(age, event.id, source)
          this.updateStats('generation_success', Date.now() - startTime)
        }

        return event
      } catch (error) {
        console.error(`生成 ${age} 岁事件失败:`, error)
        this.updateStats('generation_failure')
        return this.generateEmergencyFallback(session)
      }
    },

    /**
     * 尝试 AI 生成事件
     */
    async tryAIGeneration(session: GameSession): Promise<EventCard | null> {
      if (!this.eventEngine) return null

      const maxRetries = this.config.maxRetries
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`AI 生成尝试 ${attempt}/${maxRetries}`)
          
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('生成超时')), this.config.generationTimeout)
          })

          const generationPromise = this.eventEngine.generateAgeBasedEvent(session)
          
          const event = await Promise.race([generationPromise, timeoutPromise])
          
          if (event && this.validateEvent(event, session)) {
            console.log(`AI 生成成功 (尝试 ${attempt})`)
            return event
          }
        } catch (error) {
          lastError = error as Error
          console.warn(`AI 生成尝试 ${attempt} 失败:`, error)
          
          if (attempt < maxRetries) {
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          }
        }
      }

      console.error('AI 生成最终失败:', lastError)
      return null
    },

    /**
     * 验证生成的事件
     */
    validateEvent(event: EventCard, session: GameSession): boolean {
      const age = session.current_age
      
      return !!(
        event &&
        event.id &&
        event.title &&
        event.description &&
        event.choices &&
        event.choices.length === 3 &&
        event.labels &&
        event.labels.length > 0 &&
        // 年龄适宜性检查
        (!event.minAge || age >= event.minAge) &&
        (!event.maxAge || age <= event.maxAge)
      )
    },

    /**
     * 生成紧急后备事件
     */
    generateEmergencyFallback(session: GameSession): EventCard {
      const age = session.current_age
      const ageStage = this.getAgeStageForAge(age)
      
      return {
        id: `emergency_${age}_${Date.now()}`,
        title: `${age}岁的选择`,
        description: `在${age}岁的这个${ageStage}，你面临着人生的又一个选择点。每个决定都会影响你的未来发展。`,
        labels: [ageStage, '选择', '成长'],
        choices: [
          {
            id: 'emergency_a',
            text: '积极进取',
            description: '选择更加积极主动的人生态度'
          },
          {
            id: 'emergency_b', 
            text: '稳健发展',
            description: '保持稳定，循序渐进地发展'
          },
          {
            id: 'emergency_c',
            text: '随遇而安',
            description: '顺其自然，接受生活的安排'
          }
        ]
      }
    },

    /**
     * 根据年龄获取人生阶段
     */
    getAgeStageForAge(age: number): string {
      if (age <= 5) return '幼儿期'
      if (age <= 12) return '童年期'
      if (age <= 18) return '青春期'
      if (age <= 30) return '青年期'
      if (age <= 50) return '成年期'
      if (age <= 65) return '中年期'
      return '老年期'
    },

    /**
     * 构建缓存键
     */
    buildCacheKey(session: GameSession): string {
      const age = session.current_age
      const statsHash = this.hashStats(session.current_stats)
      const flagsHash = this.hashFlags(session.current_flags)
      const historyHash = this.hashHistory(session.history.slice(-3))
      
      return `${age}_${statsHash}_${flagsHash}_${historyHash}`
    },

    /**
     * 缓存事件
     */
    cacheEvent(key: string, event: EventCard) {
      // 限制缓存大小
      if (this.eventCache.size >= this.config.cacheSize) {
        const firstKey = this.eventCache.keys().next().value
        if (firstKey) {
          this.eventCache.delete(firstKey)
        }
      }
      
      this.eventCache.set(key, event)
    },

    /**
     * 记录生成历史
     */
    recordGeneration(age: number, eventId: string, source: 'ai' | 'template' | 'fallback') {
      this.generationHistory.push({
        age,
        eventId,
        timestamp: new Date().toISOString(),
        source
      })

      // 限制历史记录长度
      if (this.generationHistory.length > 1000) {
        this.generationHistory = this.generationHistory.slice(-500)
      }
    },

    /**
     * 更新统计信息
     */
    updateStats(type: string, value?: number) {
      switch (type) {
        case 'generation_success':
          this.stats.totalGenerated++
          if (value) {
            this.stats.averageGenerationTime = 
              (this.stats.averageGenerationTime + value) / 2
          }
          break
        case 'generation_failure':
          // 记录失败但不增加总数
          break
        case 'cache_hit':
          // 更新缓存命中率
          const totalRequests = this.generationHistory.length + 1
          const cacheHits = this.generationHistory.filter(h => h.source === 'ai').length
          this.stats.cacheHitRate = cacheHits / totalRequests
          break
      }

      // 计算 AI 成功率
      const aiGenerations = this.generationHistory.filter(h => h.source === 'ai').length
      this.stats.aiSuccessRate = aiGenerations / Math.max(this.stats.totalGenerated, 1)
    },

    /**
     * 获取年龄相关的事件建议
     */
    getAgeEventSuggestions(age: number): string[] {
      const suggestions: { [key: string]: string[] } = {
        '幼儿期': ['家庭教育', '早期启蒙', '性格塑造', '基础能力'],
        '童年期': ['学校生活', '友谊建立', '兴趣发现', '基础学习'],
        '青春期': ['学业压力', '青春烦恼', '兴趣爱好', '初恋体验'],
        '青年期': ['高等教育', '职业选择', '恋爱结婚', '经济独立'],
        '成年期': ['事业发展', '家庭建设', '子女教育', '财富积累'],
        '中年期': ['职业巅峰', '健康关注', '经验传承', '人生反思'],
        '老年期': ['退休生活', '健康养生', '家族传承', '人生回顾']
      }

      const stage = this.getAgeStageForAge(age)
      return suggestions[stage] || suggestions['青年期']
    },

    /**
     * 分析事件生成模式
     */
    analyzeGenerationPatterns() {
      const patterns = {
        ageDistribution: {} as { [key: number]: number },
        sourceDistribution: {} as { [key: string]: number },
        timeDistribution: {} as { [key: string]: number },
        successTrends: [] as number[]
      }

      this.generationHistory.forEach(record => {
        // 年龄分布
        patterns.ageDistribution[record.age] = 
          (patterns.ageDistribution[record.age] || 0) + 1

        // 来源分布
        patterns.sourceDistribution[record.source] = 
          (patterns.sourceDistribution[record.source] || 0) + 1

        // 时间分布（按小时）
        const hour = new Date(record.timestamp).getHours()
        patterns.timeDistribution[hour] = 
          (patterns.timeDistribution[hour] || 0) + 1
      })

      return patterns
    },

    // 辅助方法
    hashStats(stats: any): string {
      return Object.values(stats).join('_')
    },

    hashFlags(flags: string[]): string {
      return flags.slice(-5).sort().join('_')
    },

    hashHistory(history: any[]): string {
      if (history.length === 0) return 'empty'
      return history.map(h => h.event_card?.id || '').join('_')
    },

    /**
     * 清理和重置
     */
    cleanup() {
      this.eventCache.clear()
      this.generationHistory = []
      this.stats = {
        totalGenerated: 0,
        aiSuccessRate: 0,
        averageGenerationTime: 0,
        cacheHitRate: 0
      }
    },

    /**
     * 导出数据（用于分析）
     */
    exportData() {
      return {
        generationHistory: this.generationHistory,
        stats: this.stats,
        patterns: this.analyzeGenerationPatterns(),
        config: this.config
      }
    }
  }
})
