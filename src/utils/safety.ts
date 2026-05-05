import type { GameEngineOutput, GameStats, AvatarProfile } from '@/types/game'

// 内容安全检查器
export class ContentSafetyChecker {
  private sensitiveKeywords: string[] = [
    // 暴力相关
    '暴力', '打斗', '血腥', '伤害', '武器', '刀', '枪', '死亡',
    // 不当内容
    '性', '色情', '裸体', '暴露', '诱惑',
    // 政治敏感
    '政治', '政府', '领导人', '抗议', '革命',
    // 其他敏感
    '赌博', '毒品', '犯罪', '违法', '自杀', '自残'
  ]

  private brandKeywords: string[] = [
    '苹果', 'Apple', '微软', 'Microsoft', '谷歌', 'Google',
    '腾讯', '阿里巴巴', '字节跳动', 'TikTok', '微信', 'QQ',
    '可口可乐', '麦当劳', '肯德基', '星巴克', 'Nike', 'Adidas'
  ]

  // 检查文本内容安全性
  checkTextSafety(text: string): { isSafe: boolean; issues: string[] } {
    const issues: string[] = []
    const lowerText = text.toLowerCase()

    // 检查敏感词汇
    for (const keyword of this.sensitiveKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        issues.push(`包含敏感词汇: ${keyword}`)
      }
    }

    // 检查品牌名称
    for (const brand of this.brandKeywords) {
      if (lowerText.includes(brand.toLowerCase())) {
        issues.push(`包含品牌名称: ${brand}`)
      }
    }

    // 检查长度合理性
    if (text.length > 500) {
      issues.push('文本过长，可能影响用户体验')
    }

    return {
      isSafe: issues.length === 0,
      issues
    }
  }

  // 修正文本内容
  sanitizeText(text: string): string {
    let sanitized = text

    // 替换敏感词汇
    this.sensitiveKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi')
      sanitized = sanitized.replace(regex, '***')
    })

    // 替换品牌名称
    this.brandKeywords.forEach(brand => {
      const regex = new RegExp(brand, 'gi')
      sanitized = sanitized.replace(regex, '[品牌名]')
    })

    return sanitized
  }

  // 检查图像提示词安全性
  checkImagePromptSafety(prompt: string): { isSafe: boolean; issues: string[] } {
    const issues: string[] = []

    // 检查基本文本安全性
    const textCheck = this.checkTextSafety(prompt)
    issues.push(...textCheck.issues)

    // 图像特定检查
    const imageUnsafeKeywords = [
      '裸体', '暴露', '性感', '诱惑', '挑逗',
      '血腥', '暴力', '恐怖', '惊悚',
      '真实人物', '明星', '艺术家名字'
    ]

    for (const keyword of imageUnsafeKeywords) {
      if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
        issues.push(`图像提示词包含不当内容: ${keyword}`)
      }
    }

    return {
      isSafe: issues.length === 0,
      issues
    }
  }

  // 修正图像提示词
  sanitizeImagePrompt(prompt: string): string {
    let sanitized = this.sanitizeText(prompt)

    // 图像特定替换
    const imageReplacements = {
      '裸体': '正常着装',
      '暴露': '得体',
      '性感': '优雅',
      '血腥': '干净',
      '暴力': '和谐',
      '恐怖': '友好'
    }

    Object.entries(imageReplacements).forEach(([bad, good]) => {
      const regex = new RegExp(bad, 'gi')
      sanitized = sanitized.replace(regex, good)
    })

    return sanitized
  }
}

// 属性变化验证器
export class StatsValidator {
  private maxStatValue = 20
  private minStatValue = 0
  private maxSingleDelta = 5
  private maxMoneyDelta = 1000

  // 验证属性变化的合理性
  validateStatsChange(
    currentStats: GameStats,
    deltaStats: GameStats,
    age: number
  ): { isValid: boolean; adjustedDelta: GameStats; warnings: string[] } {
    const warnings: string[] = []
    const adjustedDelta = { ...deltaStats }

    // 验证智力变化
    const newIntelligence = currentStats.智力 + deltaStats.智力
    if (newIntelligence < this.minStatValue) {
      adjustedDelta.智力 = this.minStatValue - currentStats.智力
      warnings.push('智力调整：防止低于最小值')
    } else if (newIntelligence > this.maxStatValue) {
      adjustedDelta.智力 = this.maxStatValue - currentStats.智力
      warnings.push('智力调整：防止超过最大值')
    } else if (Math.abs(deltaStats.智力) > this.maxSingleDelta) {
      adjustedDelta.智力 = deltaStats.智力 > 0 ? this.maxSingleDelta : -this.maxSingleDelta
      warnings.push('智力调整：单次变化过大')
    }

    // 验证体质变化
    const newStrength = currentStats.体质 + deltaStats.体质
    if (newStrength < this.minStatValue) {
      adjustedDelta.体质 = this.minStatValue - currentStats.体质
      warnings.push('体质调整：防止低于最小值')
    } else if (newStrength > this.maxStatValue) {
      adjustedDelta.体质 = this.maxStatValue - currentStats.体质
      warnings.push('体质调整：防止超过最大值')
    } else if (Math.abs(deltaStats.体质) > this.maxSingleDelta) {
      adjustedDelta.体质 = deltaStats.体质 > 0 ? this.maxSingleDelta : -this.maxSingleDelta
      warnings.push('体质调整：单次变化过大')
    }

    // 验证魅力变化
    const newCharm = currentStats.魅力 + deltaStats.魅力
    if (newCharm < this.minStatValue) {
      adjustedDelta.魅力 = this.minStatValue - currentStats.魅力
      warnings.push('魅力调整：防止低于最小值')
    } else if (newCharm > this.maxStatValue) {
      adjustedDelta.魅力 = this.maxStatValue - currentStats.魅力
      warnings.push('魅力调整：防止超过最大值')
    } else if (Math.abs(deltaStats.魅力) > this.maxSingleDelta) {
      adjustedDelta.魅力 = deltaStats.魅力 > 0 ? this.maxSingleDelta : -this.maxSingleDelta
      warnings.push('魅力调整：单次变化过大')
    }

    // 验证运气变化
    const newLuck = currentStats.运气 + deltaStats.运气
    if (newLuck < this.minStatValue) {
      adjustedDelta.运气 = this.minStatValue - currentStats.运气
      warnings.push('运气调整：防止低于最小值')
    } else if (newLuck > this.maxStatValue) {
      adjustedDelta.运气 = this.maxStatValue - currentStats.运气
      warnings.push('运气调整：防止超过最大值')
    } else if (Math.abs(deltaStats.运气) > this.maxSingleDelta) {
      adjustedDelta.运气 = deltaStats.运气 > 0 ? this.maxSingleDelta : -this.maxSingleDelta
      warnings.push('运气调整：单次变化过大')
    }

    // 验证金钱变化
    const newMoney = currentStats.金钱 + deltaStats.金钱
    if (newMoney < -10000) {
      adjustedDelta.金钱 = -10000 - currentStats.金钱
      warnings.push('金钱调整：防止负债过多')
    } else if (Math.abs(deltaStats.金钱) > this.maxMoneyDelta) {
      adjustedDelta.金钱 = deltaStats.金钱 > 0 ? this.maxMoneyDelta : -this.maxMoneyDelta
      warnings.push('金钱调整：单次变化过大')
    }

    return {
      isValid: warnings.length === 0,
      adjustedDelta,
      warnings
    }
  }

  // 验证属性的年龄合理性
  validateAgeAppropriate(stats: GameStats, age: number): string[] {
    const warnings: string[] = []

    // 年轻人应该有较高的体质和较低的金钱
    if (age < 25) {
      if (stats.金钱 > 10000) {
        warnings.push('年轻人拥有过多金钱，不够现实')
      }
    }

    // 老年人应该有较低的体质
    if (age > 60) {
      if (stats.体质 > 15) {
        warnings.push('老年人体质过高，不够现实')
      }
    }

    // 检查属性总和的合理性
    const totalStats = stats.智力 + stats.体质 + stats.魅力 + stats.运气
    if (totalStats > 60) {
      warnings.push('总属性过高，角色过于完美')
    } else if (totalStats < 10) {
      warnings.push('总属性过低，角色过于弱势')
    }

    return warnings
  }
}

// 回退策略管理器
export class FallbackManager {
  // 生成默认的安全回退
  generateSafeFallback(originalOutput: GameEngineOutput): GameEngineOutput {
    return {
      result_text: '时间继续流逝，你在人生的道路上又迈出了一步。虽然这一次的经历平淡无奇，但每个选择都在塑造着你的未来。',
      delta_stats: { 智力: 0, 体质: 0, 魅力: 0, 运气: 0, 金钱: 0 },
      flags_add: [],
      next_labels: ['日常', '成长', '反思'],
      visual_brief: {
        姿态: '思考状',
        场景: '安静的房间',
        道具: '无',
        '时间/光线': '柔和的自然光',
        情绪: '平静',
        '机位/镜头': '50mm 半身'
      },
      seedream: {
        mode: 'generate',
        prompt_main: '一个人在安静的房间里思考，柔和的自然光线，简洁干净的背景，平静的表情，50mm半身构图，4K高质量输出',
        prompt_edit_only: '保持当前构图，仅调整光线为更加温暖的色调，其余不变，4K',
        style_guide: {
          色板: ['#f5f5f5', '#8b9dc3', '#deb887'],
          对比度: '中',
          颗粒: '细'
        },
        subject_anchor: originalOutput.seedream.subject_anchor
      },
      safety: {
        status: 'ok',
        notes: '使用安全回退内容'
      },
      fallback: {
        when: '原内容触发安全检查',
        plan: '已切换为安全的通用内容'
      }
    }
  }

  // 处理 API 错误的回退
  generateAPIErrorFallback(): GameEngineOutput {
    return {
      result_text: '由于技术原因，这一刻的记忆有些模糊。不过，生活还在继续，新的机会总会出现。',
      delta_stats: { 智力: 1, 体质: 0, 魅力: 0, 运气: 0, 金钱: 0 },
      flags_add: ['技术故障经历'],
      next_labels: ['日常', '科技', '适应'],
      visual_brief: {
        姿态: '耸肩',
        场景: '普通环境',
        道具: '无',
        '时间/光线': '正常光线',
        情绪: '无奈但接受',
        '机位/镜头': '50mm 半身'
      },
      seedream: {
        mode: 'generate',
        prompt_main: '一个人显得有些无奈但能接受现状，普通的环境，正常光线，50mm半身构图，4K高质量输出',
        prompt_edit_only: '保持当前构图，仅调整表情为更加乐观，其余不变，4K',
        style_guide: {
          色板: ['#f0f0f0', '#7a7a7a', '#4a4a4a'],
          对比度: '中',
          颗粒: '细'
        },
        subject_anchor: {
          性别: '不明',
          发型: '普通',
          脸型: '普通',
          肤色: '自然',
          体型: '中等'
        }
      },
      safety: {
        status: 'ok',
        notes: 'API错误回退'
      },
      fallback: {
        when: 'API调用失败',
        plan: '已提供离线备用内容'
      }
    }
  }

  // 处理图像生成失败的回退
  generateImageFailureFallback(originalOutput: GameEngineOutput): GameEngineOutput {
    const fallback = { ...originalOutput }
    
    // 简化图像配置
    fallback.seedream.mode = 'generate'
    fallback.seedream.prompt_main = '简单的人物形象，干净的背景，4K质量'
    fallback.seedream.prompt_edit_only = '保持简洁，4K质量'
    
    fallback.fallback = {
      when: '图像生成失败',
      plan: '继续文本模式游戏，稍后重试图像生成'
    }

    return fallback
  }
}

// 综合安全系统
export class SafetySystem {
  private contentChecker = new ContentSafetyChecker()
  private statsValidator = new StatsValidator()
  private fallbackManager = new FallbackManager()

  // 综合安全检查
  performSafetyCheck(
    output: GameEngineOutput,
    currentStats: GameStats,
    age: number
  ): {
    isSafe: boolean
    adjustedOutput: GameEngineOutput
    warnings: string[]
  } {
    const warnings: string[] = []
    let adjustedOutput = { ...output }

    // 1. 检查文本内容安全性
    const textCheck = this.contentChecker.checkTextSafety(output.result_text)
    if (!textCheck.isSafe) {
      warnings.push(...textCheck.issues)
      adjustedOutput.result_text = this.contentChecker.sanitizeText(output.result_text)
    }

    // 2. 检查图像提示词安全性
    const imageCheck = this.contentChecker.checkImagePromptSafety(output.seedream.prompt_main)
    if (!imageCheck.isSafe) {
      warnings.push(...imageCheck.issues)
      adjustedOutput.seedream.prompt_main = this.contentChecker.sanitizeImagePrompt(output.seedream.prompt_main)
      adjustedOutput.seedream.prompt_edit_only = this.contentChecker.sanitizeImagePrompt(output.seedream.prompt_edit_only)
    }

    // 3. 验证属性变化
    const statsCheck = this.statsValidator.validateStatsChange(currentStats, output.delta_stats, age)
    if (!statsCheck.isValid) {
      warnings.push(...statsCheck.warnings)
      adjustedOutput.delta_stats = statsCheck.adjustedDelta
    }

    // 4. 检查年龄适宜性
    const newStats = {
      智力: currentStats.智力 + adjustedOutput.delta_stats.智力,
      体质: currentStats.体质 + adjustedOutput.delta_stats.体质,
      魅力: currentStats.魅力 + adjustedOutput.delta_stats.魅力,
      运气: currentStats.运气 + adjustedOutput.delta_stats.运气,
      金钱: currentStats.金钱 + adjustedOutput.delta_stats.金钱
    }
    const ageWarnings = this.statsValidator.validateAgeAppropriate(newStats, age)
    warnings.push(...ageWarnings)

    // 5. 如果问题太多，使用安全回退
    const isSafe = warnings.length < 5 // 允许少量警告

    if (!isSafe) {
      adjustedOutput = this.fallbackManager.generateSafeFallback(output)
      adjustedOutput.safety.status = 'revise'
      adjustedOutput.safety.notes = `检测到多个安全问题，已使用安全回退: ${warnings.join('; ')}`
    } else if (warnings.length > 0) {
      adjustedOutput.safety.status = 'revise'
      adjustedOutput.safety.notes = `内容已调整: ${warnings.join('; ')}`
    }

    return {
      isSafe,
      adjustedOutput,
      warnings
    }
  }

  // 处理异常情况
  handleException(error: Error, originalOutput?: GameEngineOutput): GameEngineOutput {
    console.error('安全系统处理异常:', error)

    if (error.message.includes('API')) {
      return this.fallbackManager.generateAPIErrorFallback()
    } else if (error.message.includes('图像') || error.message.includes('image')) {
      return originalOutput 
        ? this.fallbackManager.generateImageFailureFallback(originalOutput)
        : this.fallbackManager.generateAPIErrorFallback()
    } else {
      return this.fallbackManager.generateAPIErrorFallback()
    }
  }
}
