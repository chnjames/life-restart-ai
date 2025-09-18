<template>
  <div>
    <!-- 游戏主界面 -->
    <div v-if="!showCharacterCreator && hasActiveSession" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧属性面板 -->
      <div class="lg:col-span-1">
        <StatsPanel
          :stats="currentStats"
          :profile="avatarProfile"
          :flags="currentFlags"
          :age="currentAge"
          :round="currentRound"
          :delta-stats="lastDeltaStats || undefined"
        />
      </div>

      <!-- 中间事件卡片 -->
      <div class="lg:col-span-2">
        <EventCard
          v-if="currentEventCard"
          :event="currentEventCard"
          :result-text="lastResultText"
          :generated-image="lastGeneratedImage || undefined"
          :is-generating-image="isGeneratingImage"
          :is-processing="isProcessing"
          :selected-choice="pendingChoice || undefined"
          :image-info="lastAIOutput?.seedream || undefined"
          @choose="handleChoice"
        />
        
        <!-- 等待下一个事件 -->
        <div v-else class="game-card text-center">
          <div v-if="isLoadingEvent" class="py-8">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div class="text-gray-600">生成下一个事件中...</div>
          </div>
          <div v-else class="py-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">准备下一个人生阶段</h3>
            <button
              @click="generateNextEvent"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              继续游戏
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色创建界面 -->
    <div v-else-if="showCharacterCreator">
      <CharacterCreator
        @confirm="createCharacter"
        @cancel="cancelCharacterCreation"
      />
    </div>

    <!-- 无活跃会话时的界面 -->
    <div v-else class="text-center">
      <div class="game-card max-w-md mx-auto">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">开始新的人生</h2>
        <p class="text-gray-600 mb-6">创建您的虚拟角色，开始人生重开之旅</p>
        
        <div v-if="!isAPIConfigured" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div class="text-amber-800 text-sm">
            <svg class="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            请先在设置页面配置 API 密钥
          </div>
        </div>
        
        <div class="space-y-3">
          <button
            @click="startNewGame"
            :disabled="!isAPIConfigured"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            创建角色
          </button>
          
          <router-link
            to="/settings"
            class="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            API 设置
          </router-link>
        </div>
      </div>
    </div>

    <!-- 游戏历史面板 -->
    <div v-if="hasActiveSession && gameHistory.length > 0" class="mt-8">
      <div class="game-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">游戏历史</h3>
          <button
            @click="showHistory = !showHistory"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            {{ showHistory ? '隐藏' : '显示' }}历史
          </button>
        </div>
        
        <div v-show="showHistory" class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="round in gameHistory.slice().reverse()"
            :key="round.round"
            class="p-4 bg-gray-50 rounded-lg border"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-800">
                第 {{ round.round }} 回合 ({{ round.age }}岁)
              </span>
              <span class="text-xs text-gray-500">{{ formatTime(round.timestamp) }}</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
              <strong>事件:</strong> {{ round.event_card.title }}
            </div>
            <div class="text-sm text-gray-600 mb-2">
              <strong>选择:</strong> {{ round.choice_made.text }}
            </div>
            <div class="text-sm text-gray-700">
              <strong>结果:</strong> {{ round.ai_output.result_text }}
            </div>
            <div v-if="round.generated_image" class="mt-2">
              <img 
                :src="round.generated_image" 
                :alt="round.event_card.title"
                class="w-24 h-24 object-cover rounded border cursor-pointer"
                @click="showImageModal(round.generated_image)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图像模态框 -->
    <div
      v-if="modalImage"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="modalImage = null"
    >
      <div class="max-w-4xl max-h-4xl p-4">
        <img
          :src="modalImage"
          alt="历史图像"
          class="max-w-full max-h-full object-contain rounded"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { useEventsStore } from '@/stores/events'
import { useLifeEventsStore } from '@/stores/lifeEvents'
import { GameEngine } from '@/services/gameEngine'
import StatsPanel from '@/components/StatsPanel.vue'
import EventCard from '@/components/EventCard.vue'
import CharacterCreator from '@/components/CharacterCreator.vue'
import type { AvatarProfile, GameStats, Choice, SeedreamConfig, GameEngineOutput } from '@/types/game'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const eventsStore = useEventsStore()
const lifeEventsStore = useLifeEventsStore()

const showCharacterCreator = ref(false)
const isLoadingEvent = ref(false)
const isGeneratingImage = ref(false)
const showHistory = ref(false)
const modalImage = ref<string | null>(null)
const lastResultText = ref('')
const lastDeltaStats = ref<GameStats | null>(null)
const lastAIOutput = ref<GameEngineOutput | null>(null)

// 计算属性
const hasActiveSession = computed(() => gameStore.hasActiveSession)
const isAPIConfigured = computed(() => settingsStore.isAPIConfigured)
const currentStats = computed(() => gameStore.currentStats)
const currentFlags = computed(() => gameStore.currentFlags)
const currentAge = computed(() => gameStore.currentAge)
const currentRound = computed(() => gameStore.currentRound)
const avatarProfile = computed(() => gameStore.avatarProfile)
const currentEventCard = computed(() => gameStore.currentEventCard)
const isProcessing = computed(() => gameStore.isProcessing)
const pendingChoice = computed(() => gameStore.pendingChoice)
const lastGeneratedImage = computed(() => gameStore.lastGeneratedImage)
const gameHistory = computed(() => gameStore.gameHistory)

onMounted(() => {
  settingsStore.loadSettings()
  gameStore.loadSession()
  eventsStore.initializeEventLibrary()
  
  // 如果有活跃会话但没有当前事件，生成下一个事件
  if (hasActiveSession.value && !currentEventCard.value) {
    generateNextEvent()
  }
})

const startNewGame = () => {
  if (!isAPIConfigured.value) {
    alert('请先配置 API 设置')
    return
  }
  showCharacterCreator.value = true
}

const createCharacter = (profile: AvatarProfile, stats: GameStats) => {
  gameStore.createNewSession(profile, stats)
  showCharacterCreator.value = false
  generateNextEvent()
}

const cancelCharacterCreation = () => {
  showCharacterCreator.value = false
}

const generateNextEvent = async () => {
  isLoadingEvent.value = true
  
  try {
    // 根据当前状态筛选事件
    let nextLabels: string[]
    
    if (currentRound.value === 0) {
      // 游戏开始时使用开始标签
      nextLabels = ['开始', '选择']
    } else if (lastAIOutput.value?.next_labels && lastAIOutput.value.next_labels.length > 0) {
      // 使用AI推荐的标签
      nextLabels = lastAIOutput.value.next_labels
    } else {
      // 根据当前属性和年龄动态生成标签
      nextLabels = generateDynamicLabels()
    }
    
    console.log('筛选事件标签:', nextLabels, '当前回合:', currentRound.value)
    eventsStore.filterEvents(nextLabels, currentAge.value, currentFlags.value)
    
    // 智能获取事件（结合静态和 AI 生成）
    let event = await eventsStore.getSmartEvent(gameStore.currentSession || undefined)
    
    // 如果上面已经尝试过 AI 生成但失败，则直接使用通用事件
    if (!event) {
      console.warn('没有找到匹配的事件，使用后备事件')
      event = eventsStore.getFallbackEvent(gameStore.currentSession || undefined)
    }
    
    // 设置当前事件卡片（这一步很关键！）
    if (event) {
      console.log('✅ 选中事件:', event.title, 'ID:', event.id)
      gameStore.setCurrentEventCard(event)
    } else {
      console.error('❌ 没有可用的事件，这不应该发生')
    }
  } catch (error) {
    console.error('生成事件失败:', error)
    alert('生成事件失败，请检查网络连接或 API 配置')
  } finally {
    isLoadingEvent.value = false
  }
}

// 根据当前状态动态生成标签
const generateDynamicLabels = (): string[] => {
  const labels: string[] = []
  const stats = currentStats.value
  const age = currentAge.value
  const flags = currentFlags.value
  
  // 基于年龄的标签
  if (age < 20) {
    labels.push('校园', '青春', '学习')
  } else if (age < 30) {
    labels.push('工作', '恋爱', '成长')
  } else if (age < 50) {
    labels.push('事业', '家庭', '责任')
  } else {
    labels.push('智慧', '回顾', '传承')
  }
  
  // 基于属性的标签
  if (stats.智力 > 8) {
    labels.push('学术', '知识', '智慧')
  }
  if (stats.体质 > 8) {
    labels.push('运动', '健康', '活力')
  }
  if (stats.魅力 > 8) {
    labels.push('社交', '人际', '魅力')
  }
  if (stats.运气 > 8) {
    labels.push('机遇', '惊喜', '好运')
  }
  if (stats.金钱 > 500) {
    labels.push('投资', '消费', '财富')
  }
  
  // 基于状态标签的推荐
  if (flags.includes('学霸')) {
    labels.push('学术', '研究', '教育')
  }
  if (flags.includes('运动员')) {
    labels.push('体育', '竞技', '健身')
  }
  
  // 确保至少有一些基础标签
  labels.push('日常', '挑战', '成长')
  
  // 去重并返回前6个标签
  return [...new Set(labels)].slice(0, 6)
}

const handleChoice = async (choice: Choice) => {
  if (!currentEventCard.value || isProcessing.value) return
  
  gameStore.setPendingChoice(choice)
  gameStore.setProcessing(true)
  
  try {
    console.log('开始处理玩家选择:', choice.text)
    console.log('图像生成设置:', settingsStore.preferences.enableImageGeneration)
    
    // 创建游戏引擎实例
    const gameEngine = new GameEngine(
      settingsStore.apiConfig.openai_api_key,
      settingsStore.apiConfig.seedream_api_key,
      settingsStore.apiConfig.openai_base_url,
      settingsStore.apiConfig.seedream_base_url,
      !settingsStore.preferences.enableImageGeneration // 根据设置决定是否使用模拟图像
    )
    
    console.log('API 配置:', {
      openai_configured: !!settingsStore.apiConfig.openai_api_key,
      seedream_configured: !!settingsStore.apiConfig.seedream_api_key,
      use_mock_image: !settingsStore.preferences.enableImageGeneration
    })
    
    // 处理玩家选择
    const gameRound = await gameEngine.processPlayerChoice(
      gameStore.currentSession!,
      currentEventCard.value,
      choice
    )
    
    // 更新游戏状态
    lastResultText.value = gameRound.ai_output.result_text
    lastDeltaStats.value = gameRound.ai_output.delta_stats
    lastAIOutput.value = gameRound.ai_output
    
    // 处理图像生成
    if (gameRound.generated_image) {
      console.log('图像生成成功:', gameRound.generated_image.substring(0, 50) + '...')
      gameStore.setGeneratedImage(gameRound.generated_image)
    } else {
      console.warn('未生成图像，可能是 API 调用失败或图像生成被禁用')
    }
    
    gameStore.processRoundResult(gameRound)
    
    // 等待一段时间显示结果，然后生成下一个事件
    setTimeout(() => {
      generateNextEvent()
      lastResultText.value = ''
      lastDeltaStats.value = null
    }, 3000)
    
  } catch (error) {
    console.error('处理选择失败:', error)
    alert(`处理选择失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    gameStore.setProcessing(false)
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const showImageModal = (imageUrl: string) => {
  modalImage.value = imageUrl
}
</script>