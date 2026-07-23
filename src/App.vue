<template>
  <div id="app" class="min-h-screen">
    <nav class="bg-night-600 border-b border-night-500">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- 左侧标题 -->
          <h1 class="text-xl font-display font-bold text-aurora-gradient">AI 人生重开</h1>

          <!-- 右侧菜单（桌面端） -->
          <div class="hidden md:flex space-x-6 animate-fade-in">
            <router-link
              to="/"
              class="text-slate-400 hover:text-glow-400 px-3 py-2 rounded-md transition-colors"
              :class="{ 'text-glow-400 bg-glow-400/10': $route.name === 'Home' }"
            >
              首页
            </router-link>
            <router-link
              to="/game"
              class="text-slate-400 hover:text-glow-400 px-3 py-2 rounded-md transition-colors"
              :class="{ 'text-glow-400 bg-glow-400/10': $route.name === 'Game' }"
            >
              开始游戏
            </router-link>
            <router-link
              to="/settings"
              class="text-slate-400 hover:text-glow-400 px-3 py-2 rounded-md transition-colors"
              :class="{ 'text-glow-400 bg-glow-400/10': $route.name === 'Settings' }"
            >
              设置
            </router-link>
          </div>

          <!-- 移动端汉堡菜单按钮 -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden text-slate-400 hover:text-glow-400 p-2 rounded-md transition-colors"
            aria-label="菜单"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 移动端下拉菜单 -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-night-500 animate-fade-in">
        <div class="px-4 py-3 space-y-1">
          <router-link
            to="/"
            class="block px-3 py-2 rounded-md text-slate-400 hover:text-glow-400 hover:bg-night-500 transition-colors"
            :class="{ 'text-glow-400 bg-glow-400/10': $route.name === 'Home' }"
            @click="mobileMenuOpen = false"
          >
            首页
          </router-link>
          <router-link
            to="/game"
            class="block px-3 py-2 rounded-md text-slate-400 hover:text-glow-400 hover:bg-night-500 transition-colors"
            :class="{ 'text-glow-400 bg-glow-400/10': $route.name === 'Game' }"
            @click="mobileMenuOpen = false"
          >
            开始游戏
          </router-link>
          <router-link
            to="/settings"
            class="block px-3 py-2 rounded-md text-slate-400 hover:text-glow-400 hover:bg-night-500 transition-colors"
            :class="{ 'text-glow-400 bg-glow-400/10': $route.name === 'Settings' }"
            @click="mobileMenuOpen = false"
          >
            设置
          </router-link>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// App组件作为应用根组件
const mobileMenuOpen = ref(false)
</script>
