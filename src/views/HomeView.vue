<template>
  <div class="text-center">
    <!-- 主标题 -->
    <div class="mb-12">
      <h1 class="text-5xl font-bold text-gray-800 mb-4">
        AI 人生重开
      </h1>
      <p class="text-xl text-gray-600 mb-2">图文混合版本</p>
      <p class="text-gray-500">体验全新的人生选择，每个决定都会塑造你的未来</p>
    </div>

    <!-- 功能特色 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div class="game-card text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">AI 智能叙事</h3>
        <p class="text-gray-600 text-sm">基于豆包AI的智能剧情生成，每次游戏都有独特的体验</p>
      </div>

      <div class="game-card text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">动态图像生成</h3>
        <p class="text-gray-600 text-sm">集成 Seedream 4.0，实时生成配套图像，图文并茂的游戏体验</p>
      </div>

      <div class="game-card text-center">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">本地运行</h3>
        <p class="text-gray-600 text-sm">纯前端应用，数据本地存储，保护隐私的同时提供流畅体验</p>
      </div>
    </div>

    <!-- 游戏状态 -->
    <div class="game-card mb-8">
      <div v-if="hasActiveSession" class="text-left">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">继续游戏</h3>
          <button
            @click="clearSession"
            class="text-sm text-red-600 hover:text-red-800"
          >
            清除存档
          </button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ currentAge }}岁</div>
            <div class="text-sm text-gray-600">当前年龄</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ currentRound }}</div>
            <div class="text-sm text-gray-600">游戏回合</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ currentFlags.length }}</div>
            <div class="text-sm text-gray-600">状态标签</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">¥{{ currentStats.金钱 }}</div>
            <div class="text-sm text-gray-600">金钱</div>
          </div>
        </div>

        <div class="flex justify-center">
          <router-link
            to="/game"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            继续游戏
          </router-link>
        </div>
      </div>

      <div v-else class="text-center">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">开始新的人生</h3>
        <p class="text-gray-600 mb-4">创建你的角色，开始全新的人生旅程</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <router-link
        to="/game"
        class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        {{ hasActiveSession ? '继续游戏' : '开始新游戏' }}
      </router-link>
      
      <router-link
        to="/settings"
        class="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        API 设置
      </router-link>
    </div>

    <!-- API 配置提醒 -->
    <div v-if="!isAPIConfigured" class="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div class="flex items-center justify-center text-amber-800">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        请先在设置页面配置豆包AI API 密钥
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="mt-12 text-left">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-start">
            <span class="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">1</span>
            <span>在设置页面配置您的豆包AI ARK API 密钥</span>
          </div>
          <div class="flex items-start">
            <span class="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">2</span>
            <span>创建您的虚拟角色，设置外观和初始属性</span>
          </div>
          <div class="flex items-start">
            <span class="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">3</span>
            <span>在每个回合中做出选择，观察结果和属性变化</span>
          </div>
        </div>
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-start">
            <span class="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">4</span>
            <span>每个选择都会影响后续的事件和可选项</span>
          </div>
          <div class="flex items-start">
            <span class="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">5</span>
            <span>AI 会实时生成配套图像，增强沉浸感</span>
          </div>
          <div class="flex items-start">
            <span class="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">6</span>
            <span>游戏进度自动保存，可随时继续</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()

// 加载设置和游戏状态
settingsStore.loadSettings()
gameStore.loadSession()

const hasActiveSession = computed(() => gameStore.hasActiveSession)
const currentAge = computed(() => gameStore.currentAge)
const currentRound = computed(() => gameStore.currentRound)
const currentStats = computed(() => gameStore.currentStats)
const currentFlags = computed(() => gameStore.currentFlags)
const isAPIConfigured = computed(() => settingsStore.isAPIConfigured)

const clearSession = () => {
  if (confirm('确定要清除当前存档吗？此操作不可恢复。')) {
    gameStore.clearSession()
  }
}
</script>