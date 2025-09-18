import { defineStore } from 'pinia'
import type { GameSession, GameStats, AvatarProfile, GameRound, EventCard, Choice } from '@/types/game'

export const useGameStore = defineStore('game', {
  state: () => ({
    currentSession: null as GameSession | null,
    isGameRunning: false,
    currentEventCard: null as EventCard | null,
    pendingChoice: null as Choice | null,
    isProcessing: false,
    lastGeneratedImage: null as string | null,
    gameMode: 'show' as 'fast' | 'show'
  }),

  getters: {
    hasActiveSession: (state) => state.currentSession !== null,
    currentAge: (state) => state.currentSession?.current_age || 0,
    currentRound: (state) => state.currentSession?.current_round || 0,
    currentStats: (state) => state.currentSession?.current_stats || {
      智力: 0,
      体质: 0,
      魅力: 0,
      运气: 0,
      金钱: 0
    },
    currentFlags: (state) => state.currentSession?.current_flags || [],
    avatarProfile: (state) => state.currentSession?.avatar_profile,
    gameHistory: (state) => state.currentSession?.history || []
  },

  actions: {
    // 创建新游戏会话
    createNewSession(avatarProfile: AvatarProfile, initialStats: GameStats) {
      const newSession: GameSession = {
        id: `session_${Date.now()}`,
        avatar_profile: avatarProfile,
        current_stats: { ...initialStats },
        current_flags: ['初始状态'],
        current_age: avatarProfile.起始年龄,
        current_round: 0,
        history: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      this.currentSession = newSession
      this.isGameRunning = true
      this.saveSession()
    },

    // 更新当前事件卡
    setCurrentEventCard(eventCard: EventCard) {
      this.currentEventCard = eventCard
    },

    // 设置待处理的选择
    setPendingChoice(choice: Choice) {
      this.pendingChoice = choice
    },

    // 处理回合结果
    processRoundResult(round: GameRound) {
      if (!this.currentSession) return

      // 更新会话状态
      this.currentSession.current_stats = {
        智力: this.currentSession.current_stats.智力 + round.ai_output.delta_stats.智力,
        体质: this.currentSession.current_stats.体质 + round.ai_output.delta_stats.体质,
        魅力: this.currentSession.current_stats.魅力 + round.ai_output.delta_stats.魅力,
        运气: this.currentSession.current_stats.运气 + round.ai_output.delta_stats.运气,
        金钱: this.currentSession.current_stats.金钱 + round.ai_output.delta_stats.金钱
      }

      // 添加新的 flags
      round.ai_output.flags_add.forEach(flag => {
        if (!this.currentSession!.current_flags.includes(flag)) {
          this.currentSession!.current_flags.push(flag)
        }
      })

      // 更新年龄和回合数
      this.currentSession.current_age += 1
      this.currentSession.current_round += 1
      this.currentSession.updated_at = new Date().toISOString()

      // 添加到历史记录
      this.currentSession.history.push(round)

      // 清理临时状态
      this.currentEventCard = null
      this.pendingChoice = null
      
      this.saveSession()
    },

    // 设置处理状态
    setProcessing(processing: boolean) {
      this.isProcessing = processing
    },

    // 设置生成的图像
    setGeneratedImage(imageUrl: string) {
      this.lastGeneratedImage = imageUrl
    },

    // 设置游戏模式
    setGameMode(mode: 'fast' | 'show') {
      this.gameMode = mode
    },

    // 保存会话到本地存储
    saveSession() {
      if (this.currentSession) {
        localStorage.setItem('current_game_session', JSON.stringify(this.currentSession))
      }
    },

    // 从本地存储加载会话
    loadSession() {
      const savedSession = localStorage.getItem('current_game_session')
      if (savedSession) {
        try {
          this.currentSession = JSON.parse(savedSession)
          this.isGameRunning = true
        } catch (error) {
          console.error('Failed to load saved session:', error)
          this.clearSession()
        }
      }
    },

    // 清理会话
    clearSession() {
      this.currentSession = null
      this.isGameRunning = false
      this.currentEventCard = null
      this.pendingChoice = null
      this.isProcessing = false
      this.lastGeneratedImage = null
      localStorage.removeItem('current_game_session')
    },

    // 结束游戏
    endGame() {
      this.isGameRunning = false
      // 保留会话数据用于查看历史，但标记为已结束
    }
  }
})