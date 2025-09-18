# 🔄 代理配置统一说明

## 问题说明

您的观察非常准确！之前的配置确实存在不一致性：

```typescript
// 之前的不一致配置
{
  openai_base_url: 'https://ark.cn-beijing.volces.com/api/v3',  // 直连
  seedream_base_url: '/seedream'                                  // 代理
}
```

这种不一致会导致：
- **开发环境CORS问题**：文本生成绕过代理直连豆包AI
- **配置管理复杂**：需要处理两种不同的URL模式
- **生产环境问题**：代理和直连混用可能导致请求失败

## 🔧 统一解决方案

现在已经统一为代理模式：

```typescript
// 统一后的配置
{
  openai_base_url: '/doubao',   // 文本生成代理
  seedream_base_url: '/seedream' // 图像生成代理
}
```

## 🌐 Vite代理配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/doubao': {
        target: 'https://ark.cn-beijing.volces.com/api/v3',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/doubao/, '')
      },
      '/seedream': {
        target: 'https://ark.cn-beijing.volces.com/api/v3',
        changeOrigin: true, 
        secure: true,
        rewrite: (path) => path.replace(/^\/seedream/, '')
      }
    }
  }
})
```

## 🔄 环境适配逻辑

```typescript
// OpenAI服务自动适配
constructor(apiKey: string, baseUrl: string = '/doubao') {
  this.apiKey = apiKey
  // 开发环境使用代理路径，生产环境使用完整URL
  this.baseUrl = import.meta.env.DEV 
    ? baseUrl 
    : (baseUrl.startsWith('/') ? 'https://ark.cn-beijing.volces.com/api/v3' : baseUrl)
}
```

## 📍 API请求路径映射

### 开发环境 (使用代理)
```
前端请求: /doubao/chat/completions
实际转发: https://ark.cn-beijing.volces.com/api/v3/chat/completions

前端请求: /seedream/images/generations  
实际转发: https://ark.cn-beijing.volces.com/api/v3/images/generations
```

### 生产环境 (直连)
```
前端请求: https://ark.cn-beijing.volces.com/api/v3/chat/completions
前端请求: https://ark.cn-beijing.volces.com/api/v3/images/generations
```

## ✨ 统一配置的优势

### 1. **开发体验一致**
- 文本和图像生成都通过代理，避免CORS问题
- 统一的配置方式，减少认知负担

### 2. **配置管理简化**
- 两个功能都使用相似的代理路径格式
- 用户界面配置更加直观

### 3. **部署灵活性**
- 开发环境自动使用代理
- 生产环境自动切换到直连
- 无需手动修改配置

### 4. **调试便利性**
- 代理日志分开显示（doubao vs seedream）
- 更容易追踪不同类型的API调用

## 🎯 用户配置指南

### 开发环境
```typescript
// 用户只需要配置
{
  openai_api_key: "your-ark-api-key",
  openai_base_url: "/doubao",        // 默认值
  seedream_api_key: "your-ark-api-key", 
  seedream_base_url: "/seedream"     // 默认值
}
```

### 生产环境
用户配置相同，系统自动处理环境适配：
- `/doubao` 自动转换为 `https://ark.cn-beijing.volces.com/api/v3`
- `/seedream` 自动转换为 `https://ark.cn-beijing.volces.com/api/v3`

## 🔍 调试信息

代理日志现在会清楚显示：
```
Sending Request to Doubao: POST /doubao/chat/completions
Received Response from Doubao: 200 /doubao/chat/completions

Sending Request to Seedream: POST /seedream/images/generations  
Received Response from Seedream: 200 /seedream/images/generations
```

## 📝 迁移注意事项

1. **清除旧配置**：建议用户清除浏览器本地存储中的旧配置
2. **重新配置**：使用新的代理路径格式
3. **测试验证**：确保文本和图像生成都正常工作

这样的统一配置让整个系统更加一致和可维护！