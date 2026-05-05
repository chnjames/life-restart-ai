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
      
      // 检查 API key 是否存在
      if (!this.apiConfig.openai_api_key) {
        console.warn('OpenAI API Key 未配置')
        return result
      }
      if (!this.apiConfig.seedream_api_key) {
        console.warn('Seedream API Key 未配置')
        return result
      }

      // 尝试实际验证 OpenAI API
      try {
        const testResponse = await fetch(`${this.apiConfig.openai_base_url}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiConfig.openai_api_key}`
          },
          body: JSON.stringify({
            model: 'doubao-1-5-pro-32k-250115',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 1
          })
        })
        result.openai = testResponse.ok
      } catch (error) {
        console.warn('OpenAI API 验证失败:', error)
        result.openai = false
      }

      // 尝试实际验证 Seedream API
      try {
        const testResponse = await fetch(`${this.apiConfig.seedream_base_url}/images/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiConfig.seedream_api_key}`
          },
          body: JSON.stringify({
            model: 'doubao-seedream-4-0-250828',
            prompt: 'test',
            response_format: 'url',
            size: '1K',
            stream: false,
            watermark: true
          })
        })
        result.seedream = testResponse.ok
      } catch (error) {
        console.warn('Seedream API 验证失败:', error)
        result.seedream = false
      }
      
      return result
    }
  }
})
