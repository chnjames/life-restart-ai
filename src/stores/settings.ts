import { defineStore } from 'pinia'
import type { APIConfig } from '@/types/game'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    apiConfig: {
      openai_api_key: '', // 需要用户配置豆包AI的ARK_API_KEY
      openai_base_url: '/doubao', // 使用代理路径，开发环境代理到豆包AI
      seedream_api_key: '', // 需要用户配置豆包AI的ARK_API_KEY（图像生成）
      seedream_base_url: '/seedream' // 使用代理路径，开发环境代理到豆包AI
    } as APIConfig,
    preferences: {
      autoSave: true,
      imageQuality: 'high' as 'low' | 'medium' | 'high',
      textSpeed: 'normal' as 'slow' | 'normal' | 'fast',
      soundEnabled: false,
      theme: 'light' as 'light' | 'dark',
      enableImageGeneration: true // 新增：是否启用图像生成
    }
  }),

  getters: {
    isAPIConfigured: (state) => {
      return !!(state.apiConfig.openai_api_key && state.apiConfig.seedream_api_key)
    },
    openaiConfigured: (state) => !!state.apiConfig.openai_api_key,
    seedreamConfigured: (state) => !!state.apiConfig.seedream_api_key
  },

  actions: {
    // 更新 API 配置
    updateAPIConfig(config: Partial<APIConfig>) {
      this.apiConfig = { ...this.apiConfig, ...config }
      this.saveSettings()
    },

    // 更新偏好设置
    updatePreferences(prefs: Partial<typeof this.preferences>) {
      this.preferences = { ...this.preferences, ...prefs }
      this.saveSettings()
    },

    // 保存设置到本地存储
    saveSettings() {
      localStorage.setItem('ai_life_restart_settings', JSON.stringify({
        apiConfig: this.apiConfig,
        preferences: this.preferences
      }))
    },

    // 从本地存储加载设置
    loadSettings() {
      const savedSettings = localStorage.getItem('ai_life_restart_settings')
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          if (settings.apiConfig) {
            this.apiConfig = { ...this.apiConfig, ...settings.apiConfig }
          }
          if (settings.preferences) {
            this.preferences = { ...this.preferences, ...settings.preferences }
          }
        } catch (error) {
          console.error('Failed to load settings:', error)
        }
      }
    },

    // 重置设置
    resetSettings() {
      this.apiConfig = {
        openai_api_key: '', // 需要用户配置豆包AI的ARK_API_KEY
        openai_base_url: '/doubao', // 使用代理路径
        seedream_api_key: '', // 需要用户配置豆包AI的ARK_API_KEY（图像生成）
        seedream_base_url: '/seedream' // 使用代理路径
      }
      this.preferences = {
        autoSave: true,
        imageQuality: 'high',
        textSpeed: 'normal',
        soundEnabled: false,
        theme: 'light',
        enableImageGeneration: true
      }
      localStorage.removeItem('ai_life_restart_settings')
    },

    // 验证 API 配置
    async validateAPIConfig(): Promise<{ openai: boolean; seedream: boolean }> {
      const result = { openai: false, seedream: false }
      
      // 这里可以添加实际的 API 验证逻辑
      // 现在只是简单检查是否有 API key
      result.openai = !!this.apiConfig.openai_api_key
      result.seedream = !!this.apiConfig.seedream_api_key
      
      return result
    }
  }
})
