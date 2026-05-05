/**
 * AI 驱动的人生事件引擎
 * 基于 lifeRestart 项目理念，用 AI 替代 Excel 表格
 * 实现动态、个性化的人生事件生成
 */

import type { GameSession, EventCard, GameStats, AvatarProfile } from '@/types/game'
import type { DoubaoService } from './openai'

// 年龄阶段定义
export interface AgeStage {
  name: string
  minAge: number
  maxAge: number
  baseLabels: string[]
  commonEvents: string[]
  statInfluence: Partial<GameStats>
}

// 事件权重配置
export interface EventWeight {
  baseWeight: number
  ageMultiplier: number
  statRequirements: Partial<GameStats>
  flagRequirements: string[]
  exclusiveFlags: string[]
}

// AI 事件生成配置
export interface AIEventConfig {
  contextDepth: number // 考虑多少轮历史
  personalityWeight: number // 个性化权重
  randomnessLevel: number // 随机性水平 0-1
  creativityBoost: number // 创意加成
}

export class LifeEventEngine {
  private doubaoService: DoubaoService

  // 年龄阶段配置
  private ageStages: AgeStage[] = []

  // AI 事件生成配置
  private aiConfig: AIEventConfig = {
    contextDepth: 3,
    personalityWeight: 0.5,
    randomnessLevel: 0.3,
    creativityBoost: 0.2
  }

  // 事件历史记录
  private eventHistory: EventCard[] = []

  constructor(doubaoService: DoubaoService) {
    this.doubaoService = doubaoService
    this.initializeAgeStages()
  }

  /**
   * 初始化事件历史（空实现，保持兼容）
   */
  private initializeEventHistory() {
    this.eventHistory = []
  }

  /**
   * 初始化年龄阶段配置
   * 模仿 lifeRestart 的年龄-事件关联系统
   */
  private initializeAgeStages() {
    this.ageStages = [
      {
        name: '幼儿期',
        minAge: 0,
        maxAge: 5,
        baseLabels: ['家庭', '启蒙', '天真'],
        commonEvents: ['家庭教育', '早期学习', '性格形成'],
        statInfluence: { 智力: 0.1, 体质: 0.2, 魅力: 0.1 }
      },
      {
        name: '童年期',
        minAge: 6,
        maxAge: 12,
        baseLabels: ['学校', '友谊', '探索'],
        commonEvents: ['小学生活', '兴趣发现', '社交启蒙'],
        statInfluence: { 智力: 0.3, 体质: 0.2, 魅力: 0.2 }
      },
      {
        name: '青春期',
        minAge: 13,
        maxAge: 18,
        baseLabels: ['青春', '叛逆', '成长', '学业'],
        commonEvents: ['中学压力', '青春烦恼', '升学选择', '初恋'],
        statInfluence: { 智力: 0.4, 体质: 0.3, 魅力: 0.4 }
      },
      {
        name: '青年期',
        minAge: 19,
        maxAge: 30,
        baseLabels: ['大学', '工作', '恋爱', '独立'],
        commonEvents: ['高等教育', '职业选择', '恋爱结婚', '经济独立'],
        statInfluence: { 智力: 0.5, 体质: 0.2, 魅力: 0.5, 金钱: 0.6 }
      },
      {
        name: '成年期',
        minAge: 31,
        maxAge: 50,
        baseLabels: ['事业', '家庭', '责任', '成就'],
        commonEvents: ['事业发展', '家庭建设', '子女教育', '财富积累'],
        statInfluence: { 智力: 0.3, 魅力: 0.3, 金钱: 0.8 }
      },
      {
        name: '中年期',
        minAge: 51,
        maxAge: 65,
        baseLabels: ['稳定', '传承', '健康', '智慧'],
        commonEvents: ['职业巅峰', '健康关注', '经验传承', '人生反思'],
        statInfluence: { 智力: 0.6, 体质: -0.1, 金钱: 0.5 }
      },
      {
        name: '老年期',
        minAge: 66,
        maxAge: 100,
        baseLabels: ['退休', '健康', '回忆', '传承'],
        commonEvents: ['退休生活', '健康问题', '家族传承', '人生总结'],
        statInfluence: { 智力: 0.4, 体质: -0.3, 魅力: 0.2 }
      }
    ]
  }

  /**
   * 核心方法：生成年龄相关的事件
   * 这是替代 Excel 表格的核心逻辑
   */
  async generateAgeBasedEvent(session: GameSession): Promise<EventCard | null> {
    try {
      const currentAge = session.current_age
      const ageStage = this.getCurrentAgeStage(currentAge)
      
      console.log(`为 ${currentAge} 岁生成事件 (${ageStage.name})`)

      // 1. 分析当前游戏状态
      const gameContext = this.analyzeGameContext(session, ageStage)
      
      // 2. 生成 AI 提示词
      const prompt = this.buildAgeBasedPrompt(session, ageStage, gameContext)
      
      // 3. 调用 AI 生成事件
      const aiResponse = await this.doubaoService.generateLifeEvent(prompt)

      // 4. 解析并验证事件
      const event = await this.parseAIEvent(aiResponse, session, ageStage)
      
      if (event) {
        this.eventHistory.push(event)
        console.log(`成功生成事件: ${event.title}`)
      }
      
      return event
    } catch (error) {
      console.error('生成年龄事件失败:', error)
      return this.generateFallbackEvent(session)
    }
  }

  /**
   * 获取当前年龄阶段
   */
  private getCurrentAgeStage(age: number): AgeStage {
    return this.ageStages.find(stage => 
      age >= stage.minAge && age <= stage.maxAge
    ) || this.ageStages[this.ageStages.length - 1] // 默认返回最后一个阶段
  }

  /**
   * 分析游戏上下文
   * 模仿 lifeRestart 的条件判断系统
   */
  private analyzeGameContext(session: GameSession, ageStage: AgeStage) {
    const stats = session.current_stats
    const flags = session.current_flags
    const age = session.current_age
    const recentHistory = session.history.slice(-this.aiConfig.contextDepth)

    return {
      // 属性分析
      dominantStat: this.getDominantStat(stats),
      statProfile: this.getStatProfile(stats),
      
      // 年龄特征
      ageStage: ageStage.name,
      ageProgress: (age - ageStage.minAge) / (ageStage.maxAge - ageStage.minAge),
      
      // 历史模式
      recentThemes: this.extractRecentThemes(recentHistory),
      eventDiversity: this.calculateEventDiversity(recentHistory),
      
      // 状态标签
      activeFlags: flags.slice(-5), // 最近的5个标签
      personalityTraits: this.extractPersonalityTraits(flags),
      
      // 生活轨迹
      lifeTrajectory: this.analyzeLifeTrajectory(session),
      potentialPaths: this.identifyPotentialPaths(session, ageStage)
    }
  }

  /**
   * 构建年龄相关的 AI 提示词
   * 这是核心的 AI 指导逻辑
   */
  private buildAgeBasedPrompt(session: GameSession, ageStage: AgeStage, context: any): string {
    const age = session.current_age
    const stats = session.current_stats
    const profile = session.avatar_profile

    return `
# 人生重开模拟器 - ${age}岁事件生成

## 角色信息
- **年龄**: ${age}岁 (${ageStage.name})
- **性别**: ${profile.性别}
- **属性**: 智力${stats.智力} 体质${stats.体质} 魅力${stats.魅力} 运气${stats.运气} 金钱${stats.金钱}
- **主导属性**: ${context.dominantStat}
- **性格特征**: ${context.personalityTraits.join(', ')}

## 年龄阶段特征
- **阶段**: ${ageStage.name} (${ageStage.minAge}-${ageStage.maxAge}岁)
- **核心主题**: ${ageStage.baseLabels.join(', ')}
- **常见事件**: ${ageStage.commonEvents.join(', ')}
- **阶段进度**: ${Math.round(context.ageProgress * 100)}%

## 当前状态
- **活跃标签**: ${context.activeFlags.join(', ')}
- **最近主题**: ${context.recentThemes.join(', ')}
- **人生轨迹**: ${context.lifeTrajectory}
- **潜在路径**: ${context.potentialPaths.join(', ')}

## 生成要求
请为这个${age}岁的${profile.性别}生成一个符合年龄特征的人生事件：

1. **年龄适宜性**: 事件必须符合${age}岁${ageStage.name}的特征
2. **个性化**: 基于角色的属性和历史经历
3. **成长性**: 事件应该推动角色发展
4. **现实性**: 符合真实人生的可能性
5. **选择性**: 提供3个有意义的不同选择

## 事件结构
\`\`\`json
{
  "id": "age_${age}_[unique_suffix]",
  "title": "事件标题",
  "description": "详细的事件描述，体现年龄特征和个人状况",
  "labels": ["年龄相关标签", "主题标签", "影响标签"],
  "choices": [
    {
      "id": "choice_a",
      "text": "选择A",
      "description": "选择A的详细说明和可能后果"
    },
    {
      "id": "choice_b", 
      "text": "选择B",
      "description": "选择B的详细说明和可能后果"
    },
    {
      "id": "choice_c",
      "text": "选择C", 
      "description": "选择C的详细说明和可能后果"
    }
  ]
}
\`\`\`

Please ensure事件具有以下特点：
- 符合${ageStage.name}的典型经历
- 反映角色的${context.dominantStat}优势
- 与最近的事件主题有所区别
- 为角色的未来发展提供机会
- 选择之间有明显的权衡和后果差异

现在请生成这个事件：
`
  }

  /**
   * 解析 AI 生成的事件
   */
  private async parseAIEvent(aiResponse: any, session: GameSession, ageStage: AgeStage): Promise<EventCard | null> {
    try {
      // 尝试从 AI 响应中提取 JSON
      let eventData: any
      
      if (typeof aiResponse === 'string') {
        // 提取 JSON 部分
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          eventData = JSON.parse(jsonMatch[1])
        } else {
          // 尝试直接解析
          eventData = JSON.parse(aiResponse)
        }
      } else {
        eventData = aiResponse
      }

      // 验证事件数据
      if (!this.validateEventData(eventData, session.current_age)) {
        console.warn('AI 生成的事件数据无效，使用模板生成')
        return this.generateTemplateEvent(session, ageStage)
      }

      // 构建标准事件对象
      const event: EventCard = {
        id: eventData.id || `age_${session.current_age}_${Date.now()}`,
        title: eventData.title,
        description: eventData.description,
        labels: eventData.labels || ageStage.baseLabels,
        choices: eventData.choices.map((choice: any, index: number) => ({
          id: choice.id || `${eventData.id}_${String.fromCharCode(97 + index)}`,
          text: choice.text,
          description: choice.description
        })),
        minAge: ageStage.minAge,
        maxAge: ageStage.maxAge
      }

      return event
    } catch (error) {
      console.error('解析 AI 事件失败:', error)
      return this.generateTemplateEvent(session, ageStage)
    }
  }

  /**
   * 验证事件数据的有效性
   */
  private validateEventData(data: any, age: number): boolean {
    return !!(
      data &&
      data.title &&
      data.description &&
      data.choices &&
      Array.isArray(data.choices) &&
      data.choices.length === 3 &&
      data.choices.every((choice: any) => choice.text && choice.description)
    )
  }

  /**
   * 生成模板事件（AI 失败时的后备方案）
   */
  private generateTemplateEvent(session: GameSession, ageStage: AgeStage): EventCard {
    const age = session.current_age
    const templates = this.getAgeTemplates(ageStage)
    const template = templates[Math.floor(Math.random() * templates.length)]

    return {
      id: `template_${age}_${Date.now()}`,
      title: template.title.replace('{age}', age.toString()),
      description: template.description.replace('{age}', age.toString()),
      labels: [...ageStage.baseLabels, ...template.labels],
      choices: template.choices,
      minAge: ageStage.minAge,
      maxAge: ageStage.maxAge
    }
  }

  /**
   * 获取年龄阶段的事件模板
   */
  private getAgeTemplates(ageStage: AgeStage) {
    const templates: any = {
      '幼儿期': [
        {
          title: '早期教育',
          description: '在{age}岁的时候，你的父母为你选择了不同的教育方式。',
          labels: ['教育', '家庭'],
          choices: [
            { id: 'a', text: '专注智力开发', description: '通过各种益智游戏提升思维能力' },
            { id: 'b', text: '注重体能训练', description: '多参加户外活动，锻炼身体' },
            { id: 'c', text: '培养社交能力', description: '多与其他小朋友互动玩耍' }
          ]
        }
      ],
      '童年期': [
        {
          title: '小学生活',
          description: '{age}岁的你在小学里遇到了新的挑战和机会。',
          labels: ['学校', '成长'],
          choices: [
            { id: 'a', text: '努力学习', description: '专心听课，认真完成作业' },
            { id: 'b', text: '积极参与活动', description: '参加各种课外活动和比赛' },
            { id: 'c', text: '广交朋友', description: '与同学们建立深厚的友谊' }
          ]
        }
      ],
      '青春期': [
        {
          title: '青春烦恼',
          description: '{age}岁的你开始面临青春期的各种困惑和选择。',
          labels: ['青春', '成长', '选择'],
          choices: [
            { id: 'a', text: '专注学业', description: '把精力投入到学习中，为未来打基础' },
            { id: 'b', text: '探索兴趣', description: '尝试不同的爱好，寻找真正的兴趣' },
            { id: 'c', text: '关注外表', description: '开始注意自己的形象和魅力' }
          ]
        }
      ],
      '青年期': [
        {
          title: '人生选择',
          description: '{age}岁的你站在人生的十字路口，需要做出重要决定。',
          labels: ['选择', '未来', '机会'],
          choices: [
            { id: 'a', text: '追求事业', description: '全力投入工作，追求职业成功' },
            { id: 'b', text: '寻找爱情', description: '专注于寻找人生伴侣' },
            { id: 'c', text: '平衡发展', description: '在各个方面都保持平衡发展' }
          ]
        }
      ],
      '成年期': [
        {
          title: '中年挑战',
          description: '{age}岁的你面临着事业和家庭的双重压力。',
          labels: ['责任', '压力', '成就'],
          choices: [
            { id: 'a', text: '专注事业', description: '把更多精力投入到事业发展上' },
            { id: 'b', text: '照顾家庭', description: '更多时间陪伴家人，关注家庭和谐' },
            { id: 'c', text: '寻求平衡', description: '努力在事业和家庭之间找到平衡' }
          ]
        }
      ],
      '中年期': [
        {
          title: '人生反思',
          description: '{age}岁的你开始反思自己的人生轨迹和未来方向。',
          labels: ['反思', '智慧', '传承'],
          choices: [
            { id: 'a', text: '继续奋斗', description: '保持进取心，继续追求更高目标' },
            { id: 'b', text: '享受生活', description: '开始更多地享受生活的美好' },
            { id: 'c', text: '传承经验', description: '将自己的经验传授给年轻人' }
          ]
        }
      ],
      '老年期': [
        {
          title: '晚年时光',
          description: '{age}岁的你开始享受人生的黄昏时光。',
          labels: ['回忆', '健康', '家庭'],
          choices: [
            { id: 'a', text: '关注健康', description: '更加注重身体健康和养生' },
            { id: 'b', text: '享受天伦', description: '与家人共度美好时光' },
            { id: 'c', text: '回顾人生', description: '回顾和总结自己的人生经历' }
          ]
        }
      ]
    }

    return templates[ageStage.name] || templates['青年期']
  }

  /**
   * 生成后备事件
   */
  private generateFallbackEvent(session: GameSession): EventCard {
    const age = session.current_age
    const ageStage = this.getCurrentAgeStage(age)
    
    return {
      id: `fallback_${age}_${Date.now()}`,
      title: '平凡的一天',
      description: `${age}岁的你度过了平凡但充实的一天，每个选择都在塑造着你的未来。`,
      labels: ['日常', '成长'],
      choices: [
        { id: 'fallback_a', text: '专注提升', description: '利用这个机会提升自己的能力' },
        { id: 'fallback_b', text: '休息调整', description: '给自己一些时间休息和调整' },
        { id: 'fallback_c', text: '规划未来', description: '思考和规划接下来的人生方向' }
      ],
      minAge: ageStage.minAge,
      maxAge: ageStage.maxAge
    }
  }

  // 辅助方法
  private getDominantStat(stats: GameStats): string {
    const entries = Object.entries(stats).filter(([key]) => key !== '金钱')
    return entries.reduce((max, current) => current[1] > max[1] ? current : max)[0]
  }

  private getStatProfile(stats: GameStats): string {
    const { 智力, 体质, 魅力, 运气 } = stats
    if (智力 > 7) return '智慧型'
    if (体质 > 7) return '体能型'
    if (魅力 > 7) return '魅力型'
    if (运气 > 7) return '幸运型'
    return '平衡型'
  }

  private extractRecentThemes(history: any[]): string[] {
    return history.flatMap(round => round.event_card?.labels || [])
      .filter((label, index, arr) => arr.indexOf(label) === index)
      .slice(0, 5)
  }

  private calculateEventDiversity(history: any[]): number {
    const themes = this.extractRecentThemes(history)
    return themes.length / Math.max(history.length, 1)
  }

  private extractPersonalityTraits(flags: string[]): string[] {
    const personalityFlags = flags.filter(flag => 
      ['内向', '外向', '乐观', '悲观', '勤奋', '懒惰', '善良', '自私'].some(trait => 
        flag.includes(trait)
      )
    )
    return personalityFlags.slice(-3)
  }

  private analyzeLifeTrajectory(session: GameSession): string {
    const stats = session.current_stats
    const age = session.current_age
    
    if (age < 20) return '求学阶段'
    if (age < 30) return '探索阶段'
    if (age < 50) return '建设阶段'
    if (age < 65) return '成熟阶段'
    return '享受阶段'
  }

  private identifyPotentialPaths(session: GameSession, ageStage: AgeStage): string[] {
    const stats = session.current_stats
    const paths = []
    
    if (stats.智力 > 6) paths.push('学术路线')
    if (stats.体质 > 6) paths.push('运动路线')
    if (stats.魅力 > 6) paths.push('社交路线')
    if (stats.金钱 > 1000) paths.push('商业路线')
    
    return paths.length > 0 ? paths : ['普通路线']
  }

  /**
   * 获取事件生成统计
   */
  getGenerationStats() {
    return {
      totalGenerated: this.eventHistory.length,
      ageDistribution: this.getAgeDistribution(),
      themeDistribution: this.getThemeDistribution(),
      aiConfig: this.aiConfig
    }
  }

  private getAgeDistribution() {
    const distribution: { [key: string]: number } = {}
    this.eventHistory.forEach(event => {
      const stage = this.ageStages.find(s => 
        event.minAge && event.maxAge && 
        event.minAge >= s.minAge && event.maxAge <= s.maxAge
      )?.name || '未知'
      distribution[stage] = (distribution[stage] || 0) + 1
    })
    return distribution
  }

  private getThemeDistribution() {
    const themes: { [key: string]: number } = {}
    this.eventHistory.forEach(event => {
      event.labels.forEach(label => {
        themes[label] = (themes[label] || 0) + 1
      })
    })
    return themes
  }

  /**
   * 清理历史记录
   */
  cleanup() {
    this.eventHistory = []
  }
}
