// 游戏核心类型定义

export interface GameStats {
  智力: number
  体质: number
  魅力: number
  运气: number
  金钱: number
}

export interface AvatarProfile {
  性别: string
  发型: string
  脸型: string
  肤色: string
  体型: string
  起始年龄: number
  色板: [string, string, string]
  对比度: '低' | '中' | '高'
  颗粒: '细' | '中' | '粗'
  镜头: string
}

export interface VisualBrief {
  姿态: string
  场景: string
  道具: string
  '时间/光线': string
  情绪: string
  '机位/镜头': string
}

export interface StyleGuide {
  色板: [string, string, string]
  对比度: '低' | '中' | '高'
  颗粒: '细' | '中' | '粗'
}

export interface SubjectAnchor {
  性别: string
  发型: string
  脸型: string
  肤色: string
  体型: string
}

export interface SeedreamConfig {
  mode: 'edit' | 'generate'
  prompt_main: string
  prompt_edit_only: string
  style_guide: StyleGuide
  subject_anchor: SubjectAnchor
}

export interface SafetyInfo {
  status: 'ok' | 'revise'
  notes: string
}

export interface FallbackInfo {
  when: string
  plan: string
}

export interface GameEngineOutput {
  result_text: string
  delta_stats: GameStats
  flags_add: string[]
  next_labels: string[]
  visual_brief: VisualBrief
  seedream: SeedreamConfig
  safety: SafetyInfo
  fallback: FallbackInfo
}

export interface GameEngineInput {
  avatar_profile: AvatarProfile
  stats: GameStats
  flags: string[]
  choice_text: string
  mode: 'fast' | 'show'
  runtime: {
    stack: string
    llm: string
    image: string
  }
}

export interface EventCard {
  id: string
  title: string
  description: string
  choices: Choice[]
  labels: string[]
  minAge?: number
  maxAge?: number
  requiredFlags?: string[]
  excludeFlags?: string[]
}

export interface Choice {
  id: string
  text: string
  description?: string
}

export interface GameSession {
  id: string
  avatar_profile: AvatarProfile
  current_stats: GameStats
  current_flags: string[]
  current_age: number
  current_round: number
  history: GameRound[]
  created_at: string
  updated_at: string
}

export interface GameRound {
  round: number
  age: number
  event_card: EventCard
  choice_made: Choice
  ai_output: GameEngineOutput
  generated_image?: string
  timestamp: string
}

export interface APIConfig {
  openai_api_key: string
  openai_base_url: string
  seedream_api_key: string
  seedream_base_url: string
}