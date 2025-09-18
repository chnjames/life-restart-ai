# 豆包AI接口统一配置测试

## 修改说明

已将项目中的AI文本生成接口从 `https://api.vveai.com/v1` 统一改为豆包AI官方接口 `https://ark.cn-beijing.volces.com/api/v3`。

## 主要修改内容

### 1. 设置配置更新 (`src/stores/settings.ts`)
```typescript
// 默认配置更新
apiConfig: {
  openai_api_key: '', // 需要用户配置豆包AI的ARK_API_KEY
  openai_base_url: 'https://ark.cn-beijing.volces.com/api/v3',
  seedream_api_key: '', // 需要用户配置豆包AI的ARK_API_KEY（图像生成）
  seedream_base_url: '/seedream'
}
```

### 2. OpenAI服务更新 (`src/services/openai.ts`)
- 模型名称：`gpt-4o-mini` → `doubao-1-5-pro-32k-250115`
- 接口地址：统一使用豆包AI Chat Completions API
- 系统提示词：更新模型引用说明

### 3. 游戏引擎更新 (`src/services/gameEngine.ts`)
- 运行时描述：`OpenAI Chat Completions` → `豆包AI Chat Completions`

## API接口对照

### 文本生成接口
**之前（第三方代理）:**
```bash
curl https://api.vveai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxx" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [...]
  }'
```

**现在（豆包AI官方）:**
```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "doubao-1-5-pro-32k-250115",
    "messages": [...]
  }'
```

### 图像生成接口
**保持不变（已经是豆包AI）:**
```bash
curl https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "doubao-seedream-4-0-250828",
    "prompt": "...",
    "size": "2K"
  }'
```

## 配置要求

### 环境变量
用户需要配置同一个豆包AI的ARK_API_KEY用于：
1. **文本生成**：Chat Completions API
2. **图像生成**：Images Generations API

### 设置界面
- OpenAI API Key 字段：现在应填入豆包AI的ARK_API_KEY
- Base URL：默认为豆包AI接口地址
- 两个功能可以使用同一个API Key

## 技术优势

1. **接口统一**：文本和图像都使用豆包AI，减少API Key管理复杂度
2. **官方支持**：直接使用官方接口，稳定性更好
3. **成本优化**：统一计费，更容易管理使用量
4. **功能兼容**：保持现有所有功能不变

## 注意事项

1. 用户需要重新配置API Key（从第三方代理改为豆包AI官方）
2. 模型能力可能有差异，如遇到响应格式问题需要调整
3. 代理配置保持不变，开发环境仍使用 `/seedream` 代理

## 测试建议

1. 清除本地存储的旧配置
2. 配置新的豆包AI ARK_API_KEY
3. 测试文本生成功能（事件生成、选择处理）
4. 测试图像生成功能
5. 验证混合模式下的完整游戏流程