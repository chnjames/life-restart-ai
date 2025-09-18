import { DoubaoService } from './openai'
import { SeedreamService } from './seedream'
import type {
  GameEngineInput,
  GameEngineOutput,
  GameSession,
  EventCard,
  Choice,
  GameRound,
  AvatarProfile,
  GameStats
} from '@/types/game'

export class GameEngine {
  private doubaoService: DoubaoService
  private seedreamService: SeedreamService
  private useMockImage: boolean

  // 公开 doubaoService 供事件系统使用
  get doubaoServiceInstance() {
    return this.doubaoService
  }

  constructor(
    doubaoApiKey: string,
    seedreamApiKey: string,
    doubaoBaseUrl?: string,
    seedreamBaseUrl?: string,
    useMockImage: boolean = false
  ) {
    this.doubaoService = new DoubaoService(doubaoApiKey, doubaoBaseUrl)
    this.seedreamService = new SeedreamService(seedreamApiKey, seedreamBaseUrl)
    this.useMockImage = useMockImage
  }

  // 处理玩家选择，生成游戏回合结果
  async processPlayerChoice(
    session: GameSession,
    eventCard: EventCard,
    choice: Choice
  ): Promise<GameRound> {
    try {
      // 构建输入数据
      const input: GameEngineInput = {
        avatar_profile: session.avatar_profile,
        stats: session.current_stats,
        flags: session.current_flags,
        choice_text: `${choice.text}${choice.description ? `: ${choice.description}` : ''}`,
        mode: 'show', // 默认图文模式
        runtime: {
          stack: 'Vite+Vue3+Pinia+Tailwind',
          llm: '豆包AI Chat Completions',
          image: 'Seedream 4.0'
        }
      }

      // 获取 AI 响应
      const aiOutput = await this.doubaoService.generateGameResponse(input)

      // 验证和修正 AI 输出
      const validatedOutput = this.validateAndFixOutput(aiOutput, session)

      // 生成图像（如果需要）
      let generatedImage: string | undefined
      console.log('📞 检查图像生成条件:', {
        mode: input.mode,
        useMockImage: this.useMockImage,
        seedreamConfig: validatedOutput.seedream
      })
      
      if (input.mode === 'show') {
        try {
          console.log('🎨 开始生成图像...')
          if (this.useMockImage) {
            console.log('🎨 使用模拟图像生成')
            generatedImage = await this.seedreamService.mockGenerateImage(
              validatedOutput.seedream,
              this.getLastImage(session)
            )
          } else {
            console.log('🎨 使用真实 API 生成图像')
            generatedImage = await this.seedreamService.generateImage(
              validatedOutput.seedream,
              this.getLastImage(session)
            )
          }
          console.log('✅ 图像生成成功:', generatedImage ? '有图像数据' : '空图像')
        } catch (error) {
          console.error('❌ 图像生成失败:', error)
          console.warn('图像生成失败，继续文本模式:', error)
          // 图像生成失败不影响游戏继续
        }
      } else {
        console.log('📝 非图文模式，跳过图像生成')
      }

      // 构建游戏回合结果
      const gameRound: GameRound = {
        round: session.current_round + 1,
        age: session.current_age + 1,
        event_card: eventCard,
        choice_made: choice,
        ai_output: validatedOutput,
        generated_image: generatedImage,
        timestamp: new Date().toISOString()
      }

      return gameRound
    } catch (error) {
      console.error('处理玩家选择时出错:', error)
      throw new Error(`游戏引擎错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 验证和修正 AI 输出
  private validateAndFixOutput(output: GameEngineOutput, session: GameSession): GameEngineOutput {
    const fixed = { ...output }

    // 确保属性变化在合理范围内
    Object.keys(fixed.delta_stats).forEach(key => {
      const statKey = key as keyof GameStats
      const currentValue = session.current_stats[statKey]
      const delta = fixed.delta_stats[statKey]
      
      // 限制单次变化幅度
      if (Math.abs(delta) > 5) {
        fixed.delta_stats[statKey] = delta > 0 ? 5 : -5
      }
      
      // 确保不会变成负数（除了金钱）
      if (statKey !== '金钱' && currentValue + delta < 0) {
        fixed.delta_stats[statKey] = -currentValue
      }
    })

    // 限制新增 flags 数量
    if (fixed.flags_add.length > 3) {
      fixed.flags_add = fixed.flags_add.slice(0, 3)
    }

    // 确保 next_labels 不为空
    if (fixed.next_labels.length === 0) {
      fixed.next_labels = ['日常', '成长']
    }

    // 验证图像配置
    if (!fixed.visual_brief) {
      fixed.visual_brief = {
        姿态: '站立',
        场景: '日常环境',
        道具: '无',
        '时间/光线': '自然光',
        情绪: '平静',
        '机位/镜头': '50mm 半身'
      }
    }

    return fixed
  }

  // 获取最后一张生成的图像
  private getLastImage(session: GameSession): string | undefined {
    const history = session.history
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].generated_image) {
        return history[i].generated_image
      }
    }
    return undefined
  }

  // 创建默认角色档案
  static createDefaultAvatarProfile(): AvatarProfile {
    return {
      性别: '女',
      发型: '黑色长发',
      脸型: '鹅蛋脸',
      肤色: '自然偏白',
      体型: '中等',
      起始年龄: 16,
      色板: ['#e8f4f8', '#7fb3d3', '#2c5aa0'],
      对比度: '中',
      颗粒: '细',
      镜头: '50mm'
    }
  }

  // 创建默认初始属性
  static createDefaultStats(): GameStats {
    return {
      智力: 5,
      体质: 5,
      魅力: 5,
      运气: 5,
      金钱: 100
    }
  }

  // 生成随机角色档案
  static generateRandomAvatarProfile(): AvatarProfile {
    const genders = ['男', '女']
    const hairStyles = ['短发', '长发', '卷发', '直发', '马尾']
    const faceShapes = ['鹅蛋脸', '圆脸', '方脸', '长脸']
    const skinTones = ['白皙', '自然', '偏黄', '健康小麦色']
    const bodyTypes = ['瘦', '中等', '微胖', '健壮']
    
    const colorPalettes = [
      ['#e8f4f8', '#7fb3d3', '#2c5aa0'], // 蓝色系
      ['#f5f1e8', '#d4a574', '#8b4513'], // 棕色系
      ['#f0f8e8', '#8fbc8f', '#2e8b57'], // 绿色系
      ['#fdf2f8', '#dda0dd', '#8b008b'], // 紫色系
      ['#fff8f0', '#ffa07a', '#cd5c5c']  // 橙色系
    ]

    const contrasts = ['低', '中', '高'] as const
    const grains = ['细', '中', '粗'] as const
    const lenses = ['35mm', '50mm', '85mm']

    return {
      性别: genders[Math.floor(Math.random() * genders.length)],
      发型: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      脸型: faceShapes[Math.floor(Math.random() * faceShapes.length)],
      肤色: skinTones[Math.floor(Math.random() * skinTones.length)],
      体型: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
      起始年龄: 16 + Math.floor(Math.random() * 5), // 16-20岁
      色板: colorPalettes[Math.floor(Math.random() * colorPalettes.length)] as [string, string, string],
      对比度: contrasts[Math.floor(Math.random() * contrasts.length)],
      颗粒: grains[Math.floor(Math.random() * grains.length)],
      镜头: lenses[Math.floor(Math.random() * lenses.length)]
    }
  }

  // 生成随机初始属性
  static generateRandomStats(): GameStats {
    const totalPoints = 20 // 总属性点数
    const minStat = 2 // 最小属性值
    const maxStat = 8 // 最大属性值

    let stats = {
      智力: minStat,
      体质: minStat,
      魅力: minStat,
      运气: minStat,
      金钱: 50 + Math.floor(Math.random() * 101) // 50-150
    }

    let remainingPoints = totalPoints - (minStat * 4)

    // 随机分配剩余属性点
    const statKeys = ['智力', '体质', '魅力', '运气'] as const
    while (remainingPoints > 0) {
      const randomStat = statKeys[Math.floor(Math.random() * statKeys.length)]
      if (stats[randomStat] < maxStat) {
        stats[randomStat]++
        remainingPoints--
      }
    }

    return stats
  }
}