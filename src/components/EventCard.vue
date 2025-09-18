<template>
  <div class="game-card">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="text-xl font-bold text-gray-800">{{ event.title }}</h3>
        <div class="flex space-x-2 mt-2">
          <span 
            v-for="label in event.labels"
            :key="label"
            class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
          >
            {{ label }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 图像区域 -->
      <div class="lg:w-1/2">
        <div 
          class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center"
          :class="{ 'border-solid border-gray-400': generatedImage }"
        >
          <img 
            v-if="generatedImage"
            :src="generatedImage"
            :alt="event.title"
            class="w-full h-full object-cover"
          />
          <div v-else-if="isGeneratingImage" class="text-center text-gray-500">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div class="text-sm">生成图像中...</div>
          </div>
          <div v-else class="text-center text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
            <div class="text-sm">等待图像生成</div>
          </div>
        </div>
        
        <!-- 图像生成信息 -->
        <div v-if="imageInfo" class="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <div class="grid grid-cols-2 gap-2">
            <div>模式: {{ imageInfo.mode === 'edit' ? '局部编辑' : '全新生成' }}</div>
            <div>风格: {{ imageInfo.style_guide.对比度 }}对比度 / {{ imageInfo.style_guide.颗粒 }}颗粒</div>
          </div>
          <div class="mt-1">色板: 
            <span 
              v-for="color in imageInfo.style_guide.色板"
              :key="color"
              class="inline-block w-3 h-3 rounded-full ml-1 border border-gray-300"
              :style="{ backgroundColor: color }"
            ></span>
          </div>
        </div>
      </div>

      <!-- 文本区域 -->
      <div class="lg:w-1/2">
        <div class="mb-4">
          <p class="text-gray-700 leading-relaxed">{{ event.description }}</p>
        </div>

        <!-- 结果文本 -->
        <div v-if="resultText" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 class="text-sm font-medium text-blue-800 mb-2">结果</h4>
          <p class="text-blue-700">{{ resultText }}</p>
        </div>

        <!-- 选择按钮 -->
        <div class="space-y-3">
          <button
            v-for="choice in event.choices"
            :key="choice.id"
            @click="$emit('choose', choice)"
            :disabled="isProcessing"
            class="choice-button"
            :class="{ 
              'opacity-50 cursor-not-allowed': isProcessing,
              'border-blue-500 bg-blue-50': selectedChoice?.id === choice.id
            }"
          >
            <div class="font-medium text-gray-800">{{ choice.text }}</div>
            <div v-if="choice.description" class="text-sm text-gray-600 mt-1">
              {{ choice.description }}
            </div>
          </button>
        </div>

        <!-- 处理状态 -->
        <div v-if="isProcessing" class="mt-4 flex items-center justify-center text-blue-600">
          <div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
          <span class="text-sm">处理中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventCard, Choice, SeedreamConfig } from '@/types/game'

interface Props {
  event: EventCard
  resultText?: string
  generatedImage?: string
  isGeneratingImage?: boolean
  isProcessing?: boolean
  selectedChoice?: Choice
  imageInfo?: SeedreamConfig
}

interface Emits {
  (e: 'choose', choice: Choice): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>