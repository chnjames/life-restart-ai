<template>
  <div class="game-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">创建角色</h3>
      <button 
        @click="generateRandom"
        class="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        随机生成
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 基础信息 -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">性别</label>
          <select 
            v-model="profile.性别"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">发型</label>
          <select 
            v-model="profile.发型"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="短发">短发</option>
            <option value="长发">长发</option>
            <option value="卷发">卷发</option>
            <option value="直发">直发</option>
            <option value="马尾">马尾</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">脸型</label>
          <select 
            v-model="profile.脸型"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="鹅蛋脸">鹅蛋脸</option>
            <option value="圆脸">圆脸</option>
            <option value="方脸">方脸</option>
            <option value="长脸">长脸</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">肤色</label>
          <select 
            v-model="profile.肤色"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="白皙">白皙</option>
            <option value="自然">自然</option>
            <option value="偏黄">偏黄</option>
            <option value="健康小麦色">健康小麦色</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">体型</label>
          <select 
            v-model="profile.体型"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="瘦">瘦</option>
            <option value="中等">中等</option>
            <option value="微胖">微胖</option>
            <option value="健壮">健壮</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">起始年龄</label>
          <input 
            v-model.number="profile.起始年龄"
            type="number"
            min="16"
            max="25"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <!-- 风格设置 -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            色板预设
            <button 
              @click="generateRandomColors"
              class="ml-2 text-xs text-blue-600 hover:text-blue-800"
            >
              随机
            </button>
          </label>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="(palette, index) in colorPalettes"
              :key="index"
              @click="profile.色板 = palette"
              class="cursor-pointer p-2 border rounded-md hover:border-blue-500 transition-colors"
              :class="{ 'border-blue-500 ring-2 ring-blue-200': arraysEqual(profile.色板, palette) }"
            >
              <div class="flex space-x-1">
                <div 
                  v-for="color in palette"
                  :key="color"
                  class="w-6 h-6 rounded border border-gray-300"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- 自定义色板 -->
          <div class="mt-3">
            <div class="text-xs text-gray-600 mb-2">自定义色板</div>
            <div class="flex space-x-2">
              <input 
                v-for="(color, index) in profile.色板"
                :key="index"
                v-model="profile.色板[index]"
                type="color"
                class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">对比度</label>
          <select 
            v-model="profile.对比度"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="低">低</option>
            <option value="中">中</option>
            <option value="高">高</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">颗粒</label>
          <select 
            v-model="profile.颗粒"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="细">细</option>
            <option value="中">中</option>
            <option value="粗">粗</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">镜头</label>
          <select 
            v-model="profile.镜头"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="35mm">35mm (广角)</option>
            <option value="50mm">50mm (标准)</option>
            <option value="85mm">85mm (人像)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 初始属性分配 -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-lg font-medium text-gray-800 mb-4">初始属性分配</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">智力</label>
          <input 
            v-model.number="stats.智力"
            type="range"
            min="1"
            max="10"
            class="w-full mb-1"
            @input="checkTotalPoints"
          />
          <div class="text-center text-sm text-gray-600">{{ stats.智力 }}</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">体质</label>
          <input 
            v-model.number="stats.体质"
            type="range"
            min="1"
            max="10"
            class="w-full mb-1"
            @input="checkTotalPoints"
          />
          <div class="text-center text-sm text-gray-600">{{ stats.体质 }}</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">魅力</label>
          <input 
            v-model.number="stats.魅力"
            type="range"
            min="1"
            max="10"
            class="w-full mb-1"
            @input="checkTotalPoints"
          />
          <div class="text-center text-sm text-gray-600">{{ stats.魅力 }}</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">运气</label>
          <input 
            v-model.number="stats.运气"
            type="range"
            min="1"
            max="10"
            class="w-full mb-1"
            @input="checkTotalPoints"
          />
          <div class="text-center text-sm text-gray-600">{{ stats.运气 }}</div>
        </div>
      </div>
      
      <div class="mt-4 text-center">
        <div class="text-sm text-gray-600">
          已用属性点: {{ totalUsedPoints }} / {{ maxPoints }}
          <span v-if="totalUsedPoints > maxPoints" class="text-red-600 ml-2">
            超出 {{ totalUsedPoints - maxPoints }} 点
          </span>
        </div>
        <button 
          @click="randomizeStats"
          class="mt-2 text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          随机分配
        </button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-6 flex justify-end space-x-3">
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        取消
      </button>
      <button
        @click="$emit('confirm', profile, stats)"
        :disabled="totalUsedPoints > maxPoints"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        确认创建
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AvatarProfile, GameStats } from '@/types/game'
import { GameEngine } from '@/services/gameEngine'

interface Emits {
  (e: 'confirm', profile: AvatarProfile, stats: GameStats): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

const maxPoints = 24

const profile = ref<AvatarProfile>(GameEngine.createDefaultAvatarProfile())
const stats = ref<GameStats>({
  智力: 5,
  体质: 5,
  魅力: 5,
  运气: 5,
  金钱: 100
})

const colorPalettes = [
  ['#e8f4f8', '#7fb3d3', '#2c5aa0'], // 蓝色系
  ['#f5f1e8', '#d4a574', '#8b4513'], // 棕色系
  ['#f0f8e8', '#8fbc8f', '#2e8b57'], // 绿色系
  ['#fdf2f8', '#dda0dd', '#8b008b'], // 紫色系
  ['#fff8f0', '#ffa07a', '#cd5c5c'], // 橙色系
  ['#f8f8f2', '#c0c0c0', '#696969'], // 灰色系
]

const totalUsedPoints = computed(() => {
  return stats.value.智力 + stats.value.体质 + stats.value.魅力 + stats.value.运气
})

const generateRandom = () => {
  profile.value = GameEngine.generateRandomAvatarProfile()
  stats.value = GameEngine.generateRandomStats()
}

const generateRandomColors = () => {
  const randomPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)]
  profile.value.色板 = [...randomPalette] as [string, string, string]
}

const randomizeStats = () => {
  const newStats = GameEngine.generateRandomStats()
  stats.value.智力 = newStats.智力
  stats.value.体质 = newStats.体质
  stats.value.魅力 = newStats.魅力
  stats.value.运气 = newStats.运气
}

const checkTotalPoints = () => {
  // 自动调整以确保不超过最大点数
  if (totalUsedPoints.value > maxPoints) {
    const excess = totalUsedPoints.value - maxPoints
    // 从最高的属性中减去多余的点数
    const statKeys = ['智力', '体质', '魅力', '运气'] as const
    const sortedStats = statKeys.sort((a, b) => stats.value[b] - stats.value[a])
    
    let remaining = excess
    for (const key of sortedStats) {
      if (remaining <= 0) break
      const reduction = Math.min(remaining, stats.value[key] - 1)
      stats.value[key] -= reduction
      remaining -= reduction
    }
  }
}

const arraysEqual = (a: string[], b: string[]) => {
  return a.length === b.length && a.every((val, i) => val === b[i])
}
</script>