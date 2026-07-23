<template>
  <div class="game-card">
    <h3 class="text-lg font-semibold text-slate-100 mb-4">角色属性</h3>
    <div class="space-y-3">
      <div class="stat-item">
        <span class="text-slate-300">智力</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-night-800 rounded-full h-2">
            <div 
              class="bg-glow-400 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats.智力 * 10, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-mono font-medium text-slate-200 w-8">{{ stats.智力 }}</span>
          <span 
            v-if="deltaStats?.智力"
            class="delta-badge"
            :class="deltaStats.智力 > 0 ? 'delta-pos' : 'delta-neg'"
          >
            {{ deltaStats.智力 > 0 ? '+' : '' }}{{ deltaStats.智力 }}
          </span>
        </div>
      </div>

      <div class="stat-item">
        <span class="text-slate-300">体质</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-night-800 rounded-full h-2">
            <div 
              class="bg-red-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats.体质 * 10, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-mono font-medium text-slate-200 w-8">{{ stats.体质 }}</span>
          <span 
            v-if="deltaStats?.体质"
            class="delta-badge"
            :class="deltaStats.体质 > 0 ? 'delta-pos' : 'delta-neg'"
          >
            {{ deltaStats.体质 > 0 ? '+' : '' }}{{ deltaStats.体质 }}
          </span>
        </div>
      </div>

      <div class="stat-item">
        <span class="text-slate-300">魅力</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-night-800 rounded-full h-2">
            <div 
              class="bg-aurora-400 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats.魅力 * 10, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-mono font-medium text-slate-200 w-8">{{ stats.魅力 }}</span>
          <span 
            v-if="deltaStats?.魅力"
            class="delta-badge"
            :class="deltaStats.魅力 > 0 ? 'delta-pos' : 'delta-neg'"
          >
            {{ deltaStats.魅力 > 0 ? '+' : '' }}{{ deltaStats.魅力 }}
          </span>
        </div>
      </div>

      <div class="stat-item">
        <span class="text-slate-300">运气</span>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-night-800 rounded-full h-2">
            <div 
              class="bg-amber-400 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats.运气 * 10, 100)}%` }"
            ></div>
          </div>
          <span class="text-sm font-mono font-medium text-slate-200 w-8">{{ stats.运气 }}</span>
          <span 
            v-if="deltaStats?.运气"
            class="delta-badge"
            :class="deltaStats.运气 > 0 ? 'delta-pos' : 'delta-neg'"
          >
            {{ deltaStats.运气 > 0 ? '+' : '' }}{{ deltaStats.运气 }}
          </span>
        </div>
      </div>

      <div class="stat-item">
        <span class="text-slate-300">金钱</span>
        <div class="flex items-center space-x-2">
          <span class="text-sm font-mono font-medium text-slate-200">¥{{ stats.金钱 }}</span>
          <span 
            v-if="deltaStats?.金钱"
            class="delta-badge"
            :class="deltaStats.金钱 > 0 ? 'delta-pos' : 'delta-neg'"
          >
            {{ deltaStats.金钱 > 0 ? '+' : '' }}{{ deltaStats.金钱 }}
          </span>
        </div>
      </div>
    </div>

    <!-- 角色信息 -->
    <div v-if="profile" class="mt-6 p-4 bg-night-700 rounded-lg border border-night-500">
      <h4 class="text-sm font-medium text-slate-100 mb-2">角色信息</h4>
      <div class="grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div>年龄: {{ age }}岁</div>
        <div>回合: {{ round }}</div>
        <div>性别: {{ profile.性别 }}</div>
        <div>发型: {{ profile.发型 }}</div>
      </div>
    </div>

    <!-- 当前状态标签 -->
    <div v-if="flags.length > 0" class="mt-4">
      <h4 class="text-sm font-medium text-slate-100 mb-2">状态标签</h4>
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="flag in flags.slice(-5)" 
          :key="flag"
          class="text-xs px-2 py-1 bg-glow-400/20 text-glow-300 rounded-full"
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
