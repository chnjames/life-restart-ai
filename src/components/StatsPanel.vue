<template>
  <div class="game-card">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">角色属性</h3>
    <div class="space-y-3">
      <div class="stat-item">
        <span class="text-gray-600">智力</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats.智力 * 10, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-medium text-gray-700 w-8">{{ stats.智力 }}</span>
          <span 
            v-if="deltaStats?.智力"
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="deltaStats.智力 > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'"
          >
            {{ deltaStats.智力 > 0 ? '+' : '' }}{{ deltaStats.智力 }}
          </span>
        </div>
      </div>

      <div class="stat-item">
        <span class="text-gray-600">体质</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-red-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats.体质 * 10, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-medium text-gray-700 w-8">{{ stats.体质 }}</span>
          <span 
            v-if="deltaStats?.体质"
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="deltaStats.体质 > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'"
          >
            {{ deltaStats.体质 > 0 ? '+' : '' }}{{ deltaStats.体质 }}
          </span>
        </div>
      </div>

      <div class="stat-item">
        <span class="text-gray-600">魅力</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-pink-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats.魅力 * 10, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-medium text-gray-700 w-8">{{ stats.魅力 }}</span>
          <span 
            v-if="deltaStats?.魅力"
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="deltaStats.魅力 > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'"
          >
            {{ deltaStats.魅力 > 0 ? '+' : '' }}{{ deltaStats.魅力 }}
          </span>
        </div>
      </div>

      <div class="stat-item">
        <span class="text-gray-600">运气</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats.运气 * 10, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-medium text-gray-700 w-8">{{ stats.运气 }}</span>
          <span 
            v-if="deltaStats?.运气"
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="deltaStats.运气 > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'"
          >
            {{ deltaStats.运气 > 0 ? '+' : '' }}{{ deltaStats.运气 }}
          </span>
        </div>
      </div>

      <div class="stat-item">
        <span class="text-gray-600">金钱</span>
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700">¥{{ stats.金钱 }}</span>
          <span 
            v-if="deltaStats?.金钱"
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="deltaStats.金钱 > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'"
          >
            {{ deltaStats.金钱 > 0 ? '+' : '' }}{{ deltaStats.金钱 }}
          </span>
        </div>
      </div>
    </div>

    <!-- 角色信息 -->
    <div v-if="profile" class="mt-6 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-800 mb-2">角色信息</h4>
      <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>年龄: {{ age }}岁</div>
        <div>回合: {{ round }}</div>
        <div>性别: {{ profile.性别 }}</div>
        <div>发型: {{ profile.发型 }}</div>
      </div>
    </div>

    <!-- 当前状态标签 -->
    <div v-if="flags.length > 0" class="mt-4">
      <h4 class="text-sm font-medium text-gray-800 mb-2">状态标签</h4>
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="flag in flags.slice(-5)" 
          :key="flag"
          class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
        >
          {{ flag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameStats, AvatarProfile } from '@/types/game'

interface Props {
  stats: GameStats
  profile?: AvatarProfile
  flags?: string[]
  age?: number
  round?: number
  deltaStats?: GameStats
}

withDefaults(defineProps<Props>(), {
  flags: () => [],
  age: 0,
  round: 0
})
</script>