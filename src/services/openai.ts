import type { GameEngineInput, GameEngineOutput } from '@/types/game'

export class DoubaoService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string = '/doubao') {
    this.apiKey = apiKey
    // 在开发环境使用代理路径，生产环境使用完整URL
    this.baseUrl = import.meta.env.DEV ? baseUrl : (baseUrl.startsWith('/') ? 'https://ark.cn-beijing.volces.com/api/v3' : baseUrl)
  }

  // 专门用于生成人生事件的API调用
  async generateLifeEvent(prompt: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-1-5-pro-32k-250115',
          messages: [
            { 
              role: 'system', 
              content: `你是一个专业的人生模拟器事件生成器。请严格按照用户要求的JSON格式输出事件数据，不要添加任何其他文字或解释。` 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        throw new Error(`豆包AI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('生成事件API响应:', data)
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content received from 豆包AI API')
      }

      // 解析事件响应
      const parsed = this.parseEventResponse(content)
      console.log('✅ 事件解析成功:', parsed)
      return parsed
    } catch (error) {
      console.error('豆包AI Event Generation Error:', error)
      throw error
    }
  }

  // 解析事件生成响应
  private parseEventResponse(content: string): any {
    try {
      // 尝试从内容中提取 JSON
      let jsonStr = content.trim()
      
      // 尝试提取 JSON 代码块
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      } else {
        // 尝试提取纯 JSON 对象
        const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          jsonStr = jsonObjectMatch[0]
        }
      }

      const parsed = JSON.parse(jsonStr)
      console.log('✅ 事件JSON解析成功:', parsed)
      return parsed
    } catch (error) {
      console.error('Failed to parse event response:', error)
      console.error('Original content:', content)
      throw new Error('事件解析失败')
    }
  }

  async generateGameResponse(input: GameEngineInput): Promise<GameEngineOutput> {
    try {
      const systemPrompt = this.buildSystemPrompt()
      const userPrompt = this.buildUserPrompt(input)

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-1-5-pro-32k-250115',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`豦包AI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('data', data)
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content received from 豦包AI API')
      }

      return this.parseGameResponse(content, input)
    } catch (error) {
      console.error('豦包AI Service Error:', error)
      throw error
    }
  }

  private buildSystemPrompt(): string {
    return `【角色设定 / System】
你是"AI 人生重开·图文混合"的叙事与编排引擎，服务于一个纯前端本地运行的应用（技术栈：Vite + Vue3 + Pinia + Vue Router + Tailwind）。该应用直接调用：
- 豆包AI Chat Completions（模型: doubao-1-5-pro-32k-250115）产出文本与结构化指令；
- Seedream 4.0（生成/局部编辑）产出图像；
- 用户 API Key 本地配置（LocalStorage），无需自建后端。
你的输出必须**严格遵循 JSON Schema**，便于前端解析与直接调用 API。所有文字与图像提示词**仅使用中文**，避免品牌名与在世艺术家名，遵循健康向与可公开传播标准。

【总体目标 / Goals】
围绕"人生重开回合制选择"，在每个回合：
1) 基于玩家档案、当前属性、历史 Flags 与玩家选择，产出**简短结果文本**；
2) 给出**属性变化 JSON**与**新增 Flags**；
3) 推荐**下一步标签**（用于筛选下一张事件卡）；
4) 输出**可用于 Seedream 4.0 的图像关键信息**与**中文出图指令**（优先局部编辑）；
5) 输出必要的**合规修正建议**与**失败回退策略**（如触碰敏感边界或不可执行时）。

【图像生成策略 / Image Policy】
- **优先局部编辑**：若已有主角基线立绘/前一帧，则仅"替换场景/道具/光线/文字层"，保持主角身份与构图不变；必要时再做整图生成。
- **一致性**：稳住发型/肤色/脸型/镜头/色板/对比度/颗粒；为"编辑优先"设计明确、可执行的指令。
- **仅改某处**：采用"AI创造 + 规则引导"混合模式，30%概率由AI根据上下文自由创造编辑指令，70%概率从针对性规则库中选择，既保持创造力又确保合理性。指令应结合人物年龄阶段、当前场景、情绪状态等因素，智能生成具有故事性和情感表达力的局部编辑建议。
- **输出语言**：所有出图指令**只用中文**；避免品牌与在世艺术家名；内容健康、可发布。

【输出结构 / Output Schema（务必严格 JSON，字段齐全）】
{
  "result_text": "string ≤120字 // 本回合结果叙述，生动简洁",
  "delta_stats": { "智力": int, "体质": int, "魅力": int, "运气": int, "金钱": int }, 
  "flags_add": ["string", "..."],            // 长度≤2
  "next_labels": ["校园","家庭","兴趣"],     // 用于筛选下一张事件卡
  "visual_brief": {                          // 图像关键信息（中文）
    "姿态": "string",
    "场景": "string",
    "道具": "string",
    "时间/光线": "string",
    "情绪": "string",
    "机位/镜头": "string"                    // 如 "50mm 半身"
  },
  "seedream": {
    "mode": "edit | generate",               // 若已有上一帧图像，则优先 "edit"
    "prompt_main": "string",                 // 中文出图主指令（含风格指南与一致性约束）
    "prompt_edit_only": "string",            // 一条仅改某处的编辑微调指令（中文）
    "style_guide": {
      "色板": ["#xxxxxx","#yyyyyy","#zzzzzz"],
      "对比度": "低|中|高",
      "颗粒": "细|中|粗"
    },
    "subject_anchor": {                      // 主角锚点（与档案一致）
      "性别": "string",
      "发型": "string",
      "脸型": "string",
      "肤色": "string",
      "体型": "string"
    }
  },
  "safety": {
    "status": "ok | revise",                 // 若需合规修正则为 "revise"
    "notes": "string"                        // 简述修正点，如"建议改用校园健康向表达…"
  },
  "fallback": {
    "when": "string",                        // 何时采用回退（如触发敏感词、编辑失败）
    "plan": "string"                         // 回退方案（先出低清预览/改为文本先行等）
  }
}

必须输出严格符合上方 Schema 的 JSON，不要多余解释或前后缀文本。`
  }

  private buildUserPrompt(input: GameEngineInput): string {
    return `请基于以下输入生成游戏回合结果：

avatar_profile = ${JSON.stringify(input.avatar_profile, null, 2)}
stats = ${JSON.stringify(input.stats, null, 2)}
flags = ${JSON.stringify(input.flags, null, 2)}
choice_text = "${input.choice_text}"
mode = "${input.mode}"
runtime = ${JSON.stringify(input.runtime, null, 2)}

请输出严格符合 Schema 的 JSON，不要多余解释或前后缀文本。`
  }

  private parseGameResponse(content: string, input?: GameEngineInput): GameEngineOutput {
    try {
      // 尝试从内容中提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const jsonStr = jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      
      // 转换中文键名为英文键名
      const converted = this.convertChineseKeysToEnglish(parsed, input)
      
      // 验证必需字段
      this.validateGameOutput(converted)
      
      return converted as GameEngineOutput
    } catch (error) {
      console.error('Failed to parse game response:', error)
      console.error('Original content:', content)
      // 返回默认响应
      return this.getDefaultResponse(input)
    }
  }

  private validateGameOutput(output: any): void {
    const requiredFields = [
      'result_text', 'delta_stats', 'flags_add', 'next_labels',
      'visual_brief', 'seedream', 'safety', 'fallback'
    ]
    
    for (const field of requiredFields) {
      if (!(field in output)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
  }

  private convertChineseKeysToEnglish(chineseObj: any, input?: GameEngineInput): any {
    // 键名映射表
    const keyMap: { [key: string]: string } = {
      '结果文本': 'result_text',
      '属性变化': 'delta_stats',
      '新增 Flags': 'flags_add',
      '下一步标签': 'next_labels',
      '图像关键信息': 'visual_brief',
      '出图指令': 'seedream',
      '合规修正建议': 'safety',
      '失败回退策略': 'fallback',
      // 属性变化的键名
      '智力': '智力',
      '体质': '体质', 
      '魅力': '魅力',
      '运气': '运气',
      '金钱': '金钱',
      // 图像信息的键名
      '场景': '场景',
      '道具': '道具',
      '光线': '时间/光线',
      '姿态': '姿态',
      '情绪': '情绪',
      '机位/镜头': '机位/镜头'
    }

    if (chineseObj['结果文本']) {
      // 处理旧格式的中文返回
      const converted: any = {
        result_text: chineseObj['结果文本'] || '',
        delta_stats: {
          智力: 0,
          体质: 0,
          魅力: 0,
          运气: 0,
          金钱: 0
        },
        flags_add: chineseObj['新增 Flags'] || [],
        next_labels: chineseObj['下一步标签'] || ['日常'],
        visual_brief: {
          姿态: '站立',
          场景: chineseObj['图像关键信息']?.['场景'] || '日常环境',
          道具: chineseObj['图像关键信息']?.['道具'] || '无',
          '时间/光线': chineseObj['图像关键信息']?.['光线'] || '自然光',
          情绪: '平静',
          '机位/镜头': '50mm 半身'
        },
        seedream: {
          mode: 'generate' as const,
          prompt_main: chineseObj['出图指令'] || '简单场景，4K质量',
        prompt_edit_only: this.generateSmartEditPrompt({
          age: input?.avatar_profile?.起始年龄 || 20,
          scene: chineseObj['图像关键信息']?.['场景'] || '日常环境',
          emotion: chineseObj['图像关键信息']?.['情绪'] || '平静',
          activity: '日常',
          timeOfDay: chineseObj['图像关键信息']?.['光线'] || '自然光'
        }, {
          性别: input?.avatar_profile?.性别 || '女',
          发型: input?.avatar_profile?.发型 || '黑色长发',
          脸型: input?.avatar_profile?.脸型 || '鹅蛋脸',
          肤色: input?.avatar_profile?.肤色 || '自然',
          体型: input?.avatar_profile?.体型 || '中等',
          镜头: input?.avatar_profile?.镜头 || '50mm 半身'
        }),
          style_guide: {
            色板: ['#f5f5f5', '#8b9dc3', '#deb887'] as [string, string, string],
            对比度: '中' as const,
            颗粒: '细' as const
          },
          subject_anchor: {
            性别: input?.avatar_profile?.性别 || '女',
            发型: input?.avatar_profile?.发型 || '黑色长发',
            脸型: input?.avatar_profile?.脸型 || '鹅蛋脸',
            肤色: input?.avatar_profile?.肤色 || '自然',
            体型: input?.avatar_profile?.体型 || '中等'
          }
        },
        safety: {
          status: 'ok' as const,
          notes: chineseObj['合规修正建议'] || ''
        },
        fallback: {
          when: 'API调用异常',
          plan: chineseObj['失败回退策略'] || '使用默认内容继续游戏'
        }
      }

      // 处理属性变化
      if (chineseObj['属性变化']) {
        const attrs = chineseObj['属性变化']
        converted.delta_stats = {
          智力: (attrs['智力'] || 0) - 5, // 减去初始值得到变化量
          体质: (attrs['体质'] || 0) - 5,
          魅力: (attrs['魅力'] || 0) - 5,
          运气: (attrs['运气'] || 0) - 5,
          金钱: (attrs['金钱'] || 0) - 100 // 减去初始金钱
        }
      }

      return converted
    }

    // 如果已经是英文键名，直接返回
    return chineseObj
  }

  // 生成智能的图像编辑指令，结合角色参数和上下文引导
  private generateSmartEditPrompt(context?: {
    age?: number,
    scene?: string,
    emotion?: string,
    activity?: string,
    timeOfDay?: string
  }, characterInfo?: {
    性别?: string,
    发型?: string,
    脸型?: string,
    肤色?: string,
    体型?: string,
    镜头?: string
  }): string {
    // 30% 概率使用完全由AI自由创造的指令
    if (Math.random() < 0.3) {
      return this.generateCreativeEditPrompt(context, characterInfo)
    }

    // 70% 概率使用上下文引导的规则库指令
    return this.generateGuidedEditPrompt(context, characterInfo)
  }

  // 生成角色一致性描述
  private generateCharacterDescription(characterInfo?: {
    性别?: string,
    发型?: string,
    脸型?: string,
    肤色?: string,
    体型?: string,
    镜头?: string
  }): string {
    if (!characterInfo) return ''
    
    const parts = []
    if (characterInfo.性别 && characterInfo.性别 !== '不明') {
      parts.push(characterInfo.性别 === '男' ? '男性' : '女性')
    }
    if (characterInfo.发型 && characterInfo.发型 !== '普通') {
      parts.push(characterInfo.发型)
    }
    if (characterInfo.脸型 && characterInfo.脸型 !== '普通') {
      parts.push(characterInfo.脸型)
    }
    if (characterInfo.肤色 && characterInfo.肤色 !== '自然') {
      parts.push(`${characterInfo.肤色}肤色`)
    }
    if (characterInfo.体型 && characterInfo.体型 !== '中等') {
      parts.push(`${characterInfo.体型}体型`)
    }
    
    return parts.length > 0 ? `（人物特征：${parts.join('、')}）` : ''
  }

  // AI自由创造的编辑指令（保持创造力）
  private generateCreativeEditPrompt(context?: {
    age?: number,
    scene?: string,
    emotion?: string,
    activity?: string,
    timeOfDay?: string
  }, characterInfo?: {
    性别?: string,
    发型?: string,
    脸型?: string,
    肤色?: string,
    体型?: string,
    镜头?: string
  }): string {
    const contextHints = []
    
    if (context?.age) {
      const ageGroup = context.age < 12 ? '儿童' : 
                      context.age < 18 ? '青少年' : 
                      context.age < 60 ? '成年人' : '老年人'
      contextHints.push(`${ageGroup}阶段`)
    }
    
    if (context?.scene) contextHints.push(`${context.scene}场景`)
    if (context?.emotion) contextHints.push(`${context.emotion}情绪`)
    if (context?.activity) contextHints.push(`${context.activity}活动`)
    if (context?.timeOfDay) contextHints.push(`${context.timeOfDay}时段`)

    // 为AI提供创造性提示，但不限制具体选择
    const creativeTriggers = [
      "根据当前情境，仅微调一个能增强故事感的视觉元素",
      "仅改变一个细节来更好地反映角色此刻的内心状态",
      "仅调整一处环境元素来强化当前场景的氛围感",
      "仅添加或修改一个符合情境的象征性道具或细节",
      "仅优化光影效果来更好地诠释当前的时空背景",
      "仅调整一个视觉要素来增强画面的情感表达力"
    ]

    const baseTrigger = creativeTriggers[Math.floor(Math.random() * creativeTriggers.length)]
    const contextInfo = contextHints.length > 0 ? `（考虑${contextHints.join('、')}）` : ''
    const characterDesc = this.generateCharacterDescription(characterInfo)
    
    return `${baseTrigger}${contextInfo}，保持人物主体和整体构图不变${characterDesc}`
  }

  // 上下文引导的规则库指令（保持针对性）
  private generateGuidedEditPrompt(context?: {
    age?: number,
    scene?: string,
    emotion?: string,
    activity?: string,
    timeOfDay?: string
  }, characterInfo?: {
    性别?: string,
    发型?: string,
    脸型?: string,
    肤色?: string,
    体型?: string,
    镜头?: string
  }): string {
    const editPrompts = {
      // 年龄相关的编辑指令
      age: {
        child: [
          "仅将背景改为色彩鲜艳的儿童游乐场，保持人物不变",
          "仅调整人物表情为天真烂漫的笑容，背景和姿势不变",
          "仅添加儿童玩具作为道具，人物和场景保持原样"
        ],
        teen: [
          "仅将场景改为现代化校园环境，人物形象保持不变",
          "仅调整光线为青春活力的明亮色调，构图不变",
          "仅添加书包或学习用品，人物姿态和背景不变"
        ],
        adult: [
          "仅将背景更换为现代办公或都市环境，人物不变",
          "仅调整服装为职业装扮，面部和姿势保持原样",
          "仅改变光线为成熟稳重的暖色调，其他元素不变"
        ],
        elder: [
          "仅调整人物气质为沉稳智慧的长者风范，场景不变",
          "仅将背景改为宁静的公园或书房，人物形象保持",
          "仅添加眼镜或拐杖等符合年龄的道具，其他不变"
        ]
      },
      // 情绪相关的编辑指令
      emotion: {
        happy: [
          "仅调整人物面部表情为开心的笑容，其他元素不变",
          "仅增加欢快的色彩氛围，人物姿态和场景保持",
          "仅调整光线为明亮愉悦的暖色调，构图不变"
        ],
        sad: [
          "仅调整人物表情为略显忧郁，场景和姿势不变",
          "仅改变整体色调为偏冷的蓝灰色系，人物不变",
          "仅调整光线为柔和的阴天效果，其他保持"
        ],
        excited: [
          "仅调整人物姿态为更加活跃的动作，背景不变",
          "仅增强色彩饱和度营造兴奋氛围，人物面部保持",
          "仅添加动态效果线或光芒，人物和场景不变"
        ],
        calm: [
          "仅调整整体色调为宁静的淡雅色系，人物不变",
          "仅将光线调为柔和的散射光效果，构图保持",
          "仅简化背景元素突出宁静感，人物状态不变"
        ]
      }
    }

    // 根据上下文选择合适的编辑指令
    const availablePrompts: string[] = []

    if (context?.age) {
      const ageGroup = context.age < 12 ? 'child' : 
                      context.age < 18 ? 'teen' : 
                      context.age < 60 ? 'adult' : 'elder'
      availablePrompts.push(...editPrompts.age[ageGroup])
    }

    if (context?.emotion) {
      const emotionType = context.emotion.includes('开心') || context.emotion.includes('快乐') ? 'happy' :
                         context.emotion.includes('难过') || context.emotion.includes('悲伤') ? 'sad' :
                         context.emotion.includes('兴奋') || context.emotion.includes('激动') ? 'excited' : 'calm'
      availablePrompts.push(...editPrompts.emotion[emotionType])
    }

    // 如果没有特定上下文，使用通用创造性指令
    if (availablePrompts.length === 0) {
      return this.generateCreativeEditPrompt(context, characterInfo)
    }

    // 随机选择一个合适的编辑指令，并添加角色特征
    const basePrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
    const characterDesc = this.generateCharacterDescription(characterInfo)
    
    return `${basePrompt}${characterDesc}`
  }

  private getDefaultResponse(input?: GameEngineInput): GameEngineOutput {
    return {
      result_text: "你做出了选择，时间继续向前流淌。",
      delta_stats: { 智力: 0, 体质: 0, 魅力: 0, 运气: 0, 金钱: 0 },
      flags_add: [],
      next_labels: ["日常", "成长"],
      visual_brief: {
        姿态: "思考状",
        场景: "日常环境",
        道具: "无",
        "时间/光线": "自然光",
        情绪: "平静",
        "机位/镜头": "50mm 半身"
      },
      seedream: {
        mode: "generate",
        prompt_main: "一个人在思考，自然光线，简洁背景，4K质量",
        prompt_edit_only: this.generateSmartEditPrompt({
          age: input?.avatar_profile?.起始年龄 || 20,
          scene: "日常环境",
          emotion: "平静",
          activity: "思考",
          timeOfDay: "白天"
        }, {
          性别: input?.avatar_profile?.性别 || "不明",
          发型: input?.avatar_profile?.发型 || "普通",
          脸型: input?.avatar_profile?.脸型 || "普通",
          肤色: input?.avatar_profile?.肤色 || "自然",
          体型: input?.avatar_profile?.体型 || "中等",
          镜头: input?.avatar_profile?.镜头 || "50mm 半身"
        }),
        style_guide: {
          色板: ["#f5f5f5", "#8b9dc3", "#deb887"],
          对比度: "中",
          颗粒: "细"
        },
        subject_anchor: {
          性别: input?.avatar_profile?.性别 || "不明",
          发型: input?.avatar_profile?.发型 || "普通",
          脸型: input?.avatar_profile?.脸型 || "普通",
          肤色: input?.avatar_profile?.肤色 || "自然",
          体型: input?.avatar_profile?.体型 || "中等"
        }
      },
      safety: {
        status: "ok",
        notes: ""
      },
      fallback: {
        when: "API调用失败",
        plan: "使用文本模式继续游戏"
      }
    }
  }
}
