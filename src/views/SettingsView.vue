<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">API 设置</h1>

    <div class="space-y-8">
      <!-- API 配置 -->
      <div class="game-card">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">API 配置</h2>
        
        <!-- 豆包AI 配置 -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :class="openaiConfigured ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            豆包AI 配置
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                API Key
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="apiConfig.openai_api_key"
                type="password"
                placeholder="sk-..."
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @blur="saveSettings"
              />
              <p class="text-xs text-gray-500 mt-1">
                在 <a href="https://console.volcengine.com/ark" target="_blank" class="text-blue-600 hover:underline">豆包AI ARK</a> 获取您的 API Key
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
              <input
                v-model="apiConfig.openai_base_url"
                type="url"
                placeholder="/doubao"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @blur="saveSettings"
              />
              <p class="text-xs text-gray-500 mt-1">
                开发环境使用 "/doubao" 代理路径，生产环境使用完整 URL
              </p>
            </div>
          </div>
        </div>

        <!-- Seedream 配置 -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :class="seedreamConfigured ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            Seedream 配置
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                API Key
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="apiConfig.seedream_api_key"
                type="password"
                placeholder="sk-..."
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @blur="saveSettings"
              />
              <p class="text-xs text-gray-500 mt-1">
                使用与上方相同的豆包AI ARK API Key，或在 <a href="https://console.volcengine.com/ark" target="_blank" class="text-blue-600 hover:underline">豆包AI ARK</a> 获取
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
              <input
                v-model="apiConfig.seedream_base_url"
                type="url"
                placeholder="/seedream"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @blur="saveSettings"
              />
              <p class="text-xs text-gray-500 mt-1">
                开发环境使用 "/seedream" 代理路径，生产环境使用完整 URL
              </p>
            </div>
          </div>
        </div>

        <!-- API 测试 -->
        <div class="pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">API 连接状态</span>
            <button
              @click="testAPIs"
              :disabled="isTestingAPIs"
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isTestingAPIs ? '测试中...' : '测试连接' }}
            </button>
          </div>
          
          <div v-if="apiTestResults" class="mt-3 space-y-2">
            <div class="flex items-center text-sm">
              <div 
                class="w-2 h-2 rounded-full mr-2"
                :class="apiTestResults.openai ? 'bg-green-500' : 'bg-red-500'"
              ></div>
              <span :class="apiTestResults.openai ? 'text-green-700' : 'text-red-700'">
                豆包AI: {{ apiTestResults.openai ? '连接正常' : '连接失败' }}
              </span>
            </div>
            <div class="flex items-center text-sm">
              <div 
                class="w-2 h-2 rounded-full mr-2"
                :class="apiTestResults.seedream ? 'bg-green-500' : 'bg-red-500'"
              ></div>
              <span :class="apiTestResults.seedream ? 'text-green-700' : 'text-red-700'">
                Seedream: {{ apiTestResults.seedream ? '连接正常' : '连接失败' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏偏好设置 -->
      <div class="game-card">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">游戏偏好</h2>
        
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700">自动保存</label>
              <p class="text-xs text-gray-500">自动保存游戏进度</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="preferences.autoSave"
                type="checkbox"
                class="sr-only peer"
                @change="saveSettings"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700">启用图像生成</label>
              <p class="text-xs text-gray-500">使用 Seedream API 生成游戏图像，禁用后仅显示文本</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="preferences.enableImageGeneration"
                type="checkbox"
                class="sr-only peer"
                @change="saveSettings"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">图像质量</label>
            <select
              v-model="preferences.imageQuality"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="saveSettings"
            >
              <option value="low">低 (512x512)</option>
              <option value="medium">中 (768x768)</option>
              <option value="high">高 (1024x1024)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文字显示速度</label>
            <select
              v-model="preferences.textSpeed"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="saveSettings"
            >
              <option value="slow">慢</option>
              <option value="normal">正常</option>
              <option value="fast">快</option>
            </select>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700">声音效果</label>
              <p class="text-xs text-gray-500">启用游戏音效（暂未实现）</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="preferences.soundEnabled"
                type="checkbox"
                class="sr-only peer"
                @change="saveSettings"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">主题</label>
            <select
              v-model="preferences.theme"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="saveSettings"
            >
              <option value="light">浅色主题</option>
              <option value="dark">深色主题（暂未实现）</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="game-card">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">数据管理</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div>
              <h3 class="text-sm font-medium text-amber-800">导出游戏数据</h3>
              <p class="text-xs text-amber-700">将游戏设置和存档导出为 JSON 文件</p>
            </div>
            <button
              @click="exportData"
              class="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              导出
            </button>
          </div>

          <div class="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <h3 class="text-sm font-medium text-blue-800">导入游戏数据</h3>
              <p class="text-xs text-blue-700">从 JSON 文件导入游戏设置和存档</p>
            </div>
            <div>
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                class="hidden"
                @change="importData"
              />
              <button
                @click="($refs.fileInput as HTMLInputElement)?.click()"
                class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                导入
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <h3 class="text-sm font-medium text-red-800">重置所有数据</h3>
              <p class="text-xs text-red-700">清除所有设置和游戏存档（不可恢复）</p>
            </div>
            <button
              @click="resetAllData"
              class="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="game-card">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">关于</h2>
        
        <div class="text-sm text-gray-600 space-y-3">
          <div>
            <strong>AI 人生重开 图文混合版</strong> v1.0.0
          </div>
          <div>
            技术栈: Vite + Vue3 + Pinia + Vue Router + Tailwind CSS
          </div>
          <div>
            AI 服务: 豆包AI + Seedream 4.0
          </div>
          <div>
            这是一个纯前端应用，所有数据均存储在本地，保护您的隐私安全。
          </div>
          <div class="pt-2 border-t border-gray-200">
            <a href="https://github.com/chnjames/life-restart-ai" target="_blank" class="text-blue-600 hover:underline">
              GitHub 源码
            </a>
            ·
            <a href="#" class="text-blue-600 hover:underline">
              使用说明
            </a>
            ·
            <a href="https://github.com/chnjames/life-restart-ai/issues" class="text-blue-600 hover:underline">
              问题反馈
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useGameStore } from '@/stores/game'

const settingsStore = useSettingsStore()
const gameStore = useGameStore()

const isTestingAPIs = ref(false)
const apiTestResults = ref<{ openai: boolean; seedream: boolean } | null>(null)

const apiConfig = computed({
  get: () => settingsStore.apiConfig,
  set: (value) => settingsStore.updateAPIConfig(value)
})

const preferences = computed({
  get: () => settingsStore.preferences,
  set: (value) => settingsStore.updatePreferences(value)
})

const openaiConfigured = computed(() => settingsStore.openaiConfigured)
const seedreamConfigured = computed(() => settingsStore.seedreamConfigured)

onMounted(() => {
  settingsStore.loadSettings()
})

const saveSettings = () => {
  settingsStore.saveSettings()
}

const testAPIs = async () => {
  isTestingAPIs.value = true
  apiTestResults.value = null
  
  try {
    const results = await settingsStore.validateAPIConfig()
    apiTestResults.value = results
  } catch (error) {
    console.error('API 测试失败:', error)
    apiTestResults.value = { openai: false, seedream: false }
  } finally {
    isTestingAPIs.value = false
  }
}

const exportData = () => {
  try {
    const data = {
      settings: {
        apiConfig: settingsStore.apiConfig,
        preferences: settingsStore.preferences
      },
      gameSession: gameStore.currentSession,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-life-restart-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('数据导出成功！')
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请检查浏览器权限')
  }
}

const importData = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      // 导入设置
      if (data.settings) {
        if (data.settings.apiConfig) {
          settingsStore.updateAPIConfig(data.settings.apiConfig)
        }
        if (data.settings.preferences) {
          settingsStore.updatePreferences(data.settings.preferences)
        }
      }
      
      // 导入游戏会话
      if (data.gameSession) {
        // 这里需要验证游戏会话数据的有效性
        gameStore.currentSession = data.gameSession
        gameStore.isGameRunning = true
        gameStore.saveSession()
      }
      
      alert('数据导入成功！')
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
}

const resetAllData = () => {
  if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
    settingsStore.resetSettings()
    gameStore.clearSession()
    apiTestResults.value = null
    alert('所有数据已重置')
  }
}
</script>