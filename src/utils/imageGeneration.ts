import type { SeedreamConfig, VisualBrief, AvatarProfile } from '@/types/game'

// 图像生成策略管理器
export class ImageGenerationStrategy {
  private lastImageData: string | null = null
  private generationHistory: string[] = []

  // 设置上一张图像数据
  setLastImage(imageData: string) {
    this.lastImageData = imageData
    this.generationHistory.push(imageData)
    
    // 限制历史记录长度
    if (this.generationHistory.length > 5) {
      this.generationHistory.shift()
    }
  }

  // 获取上一张图像
  getLastImage(): string | null {
    return this.lastImageData
  }

  // 决定生成策略：编辑 vs 全新生成
  determineGenerationMode(
    visualBrief: VisualBrief,
    avatarProfile: AvatarProfile,
    hasLastImage: boolean
  ): 'edit' | 'generate' {
    // 如果没有上一张图像，必须全新生成
    if (!hasLastImage) {
      return 'generate'
    }

    // 如果场景变化较大，使用全新生成
    const majorSceneChanges = [
      '换装', '变发型', '整容', '长大', '变老',
      '完全不同的环境', '室内转室外', '白天转夜晚'
    ]

    const briefText = Object.values(visualBrief).join(' ')
    const hasMajorChange = majorSceneChanges.some(change => 
      briefText.includes(change)
    )

    return hasMajorChange ? 'generate' : 'edit'
  }

  // 构建主要生成提示词
  buildMainPrompt(
    visualBrief: VisualBrief,
    avatarProfile: AvatarProfile,
    mode: 'edit' | 'generate'
  ): string {
    const baseCharacter = this.buildCharacterDescription(avatarProfile)
    const sceneDescription = this.buildSceneDescription(visualBrief)
    const styleGuide = this.buildStyleGuide(avatarProfile)
    
    if (mode === 'edit') {
      return `保持主角身份与构图一致（${avatarProfile.镜头} ${visualBrief['机位/镜头']}，${baseCharacter}，遵循${styleGuide}）。仅替换当回合场景与道具层：${sceneDescription}。其他区域不要改变；边界过渡自然；输出4K。`
    } else {
      return `${baseCharacter}，${sceneDescription}，${styleGuide}，${avatarProfile.镜头} ${visualBrief['机位/镜头']}构图，4K高质量输出。`
    }
  }

  // 构建局部编辑提示词
  buildEditOnlyPrompt(
    visualBrief: VisualBrief,
    avatarProfile: AvatarProfile
  ): string {
    // 识别可以进行局部编辑的元素
    const editableElements = this.identifyEditableElements(visualBrief)
    
    if (editableElements.length === 0) {
      return `保持当前构图，仅调整光线为${visualBrief['时间/光线']}，其余不变，4K。`
    }

    const primaryEdit = editableElements[0]
    return `仅将${primaryEdit.old}替换为${primaryEdit.new}，其余不变；风格与光线保持一致；输出4K。`
  }

  // 识别可编辑的元素
  private identifyEditableElements(visualBrief: VisualBrief): Array<{old: string, new: string}> {
    const edits: Array<{old: string, new: string}> = []

    // 道具变化
    if (visualBrief.道具 && visualBrief.道具 !== '无') {
      edits.push({
        old: '原有道具',
        new: visualBrief.道具
      })
    }

    // 场景细节变化
    const sceneKeywords = ['桌子', '椅子', '黑板', '讲台', '窗户', '门']
    const sceneText = visualBrief.场景
    sceneKeywords.forEach(keyword => {
      if (sceneText.includes(keyword)) {
        edits.push({
          old: '背景场景',
          new: keyword
        })
      }
    })

    // 光线变化
    if (visualBrief['时间/光线']) {
      edits.push({
        old: '当前光线',
        new: visualBrief['时间/光线']
      })
    }

    return edits.slice(0, 2) // 最多返回2个编辑点
  }

  // 构建角色描述
  private buildCharacterDescription(profile: AvatarProfile): string {
    return `${profile.性别}性角色，${profile.发型}，${profile.脸型}，${profile.肤色}肤色，${profile.体型}身材`
  }

  // 构建场景描述
  private buildSceneDescription(visualBrief: VisualBrief): string {
    const parts = []
    
    if (visualBrief.场景) parts.push(visualBrief.场景)
    if (visualBrief.姿态) parts.push(`${visualBrief.姿态}的姿态`)
    if (visualBrief.道具 && visualBrief.道具 !== '无') parts.push(`持有${visualBrief.道具}`)
    if (visualBrief.情绪) parts.push(`${visualBrief.情绪}的表情`)
    if (visualBrief['时间/光线']) parts.push(visualBrief['时间/光线'])

    return parts.join('，')
  }

  // 构建风格指南
  private buildStyleGuide(profile: AvatarProfile): string {
    const colorStr = profile.色板.join('/')
    return `色板${colorStr}、${profile.对比度}对比度、${profile.颗粒}颗粒`
  }

  // 生成负面提示词
  buildNegativePrompt(): string {
    return [
      // 质量相关
      '低质量', '模糊', '像素化', '扭曲', '变形',
      // 不适宜内容
      '不当内容', '暴力', '血腥', '性暗示',
      // 品牌和人物
      '品牌', '商标', '明星', '真实人物',
      // 技术问题
      '水印', '签名', '文字覆盖', '多个人物',
      // 风格限制
      '卡通', '动漫', '素描', '过度夸张'
    ].join(', ')
  }

  // 验证生成配置
  validateConfig(config: SeedreamConfig): boolean {
    // 检查必需字段
    if (!config.prompt_main || !config.prompt_edit_only) {
      return false
    }

    // 检查提示词长度
    if (config.prompt_main.length > 1000 || config.prompt_edit_only.length > 500) {
      return false
    }

    // 检查色板格式
    if (!config.style_guide.色板 || config.style_guide.色板.length !== 3) {
      return false
    }

    // 验证色值格式
    const colorRegex = /^#[0-9A-Fa-f]{6}$/
    const validColors = config.style_guide.色板.every(color => colorRegex.test(color))
    if (!validColors) {
      return false
    }

    return true
  }

  // 优化配置以确保质量
  optimizeConfig(config: SeedreamConfig): SeedreamConfig {
    const optimized = { ...config }

    // 确保提示词包含质量关键词
    if (!optimized.prompt_main.includes('4K') && !optimized.prompt_main.includes('高质量')) {
      optimized.prompt_main += '，4K高质量输出'
    }

    // 确保编辑提示词的准确性
    if (!optimized.prompt_edit_only.includes('其余不变')) {
      optimized.prompt_edit_only += '，其余不变'
    }

    // 标准化风格参数
    const validContrast = ['低', '中', '高']
    if (!validContrast.includes(optimized.style_guide.对比度)) {
      optimized.style_guide.对比度 = '中'
    }

    const validGrain = ['细', '中', '粗']
    if (!validGrain.includes(optimized.style_guide.颗粒)) {
      optimized.style_guide.颗粒 = '细'
    }

    return optimized
  }

  // 记录生成结果
  logGenerationResult(success: boolean, mode: 'edit' | 'generate', prompt: string) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] 图像生成 ${success ? '成功' : '失败'}:`, {
      mode,
      prompt: prompt.substring(0, 100) + '...',
      success
    })
  }

  // 获取生成统计
  getGenerationStats() {
    return {
      totalGenerated: this.generationHistory.length,
      hasLastImage: this.lastImageData !== null,
      historyCount: this.generationHistory.length
    }
  }

  // 清理资源
  cleanup() {
    this.lastImageData = null
    this.generationHistory = []
  }
}