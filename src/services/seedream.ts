import type { SeedreamConfig } from '@/types/game'

export interface SeedreamGenerateRequest {
  model: string
  prompt: string
  image?: string[]
  sequential_image_generation?: string
  sequential_image_generation_options?: {
    max_images?: number
  }
  response_format?: string
  size?: string
  stream?: boolean
  watermark?: boolean
}

export interface SeedreamResponse {
  data: Array<{
    url?: string
    b64_json?: string
  }>
  created: number
  model: string
}

export class SeedreamService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string = '/seedream') {
    this.apiKey = apiKey
    // 在开发环境使用代理路径，生产环境使用完整URL
    this.baseUrl = import.meta.env.DEV ? baseUrl : (baseUrl.startsWith('/') ? 'https://ark.cn-beijing.volces.com/api/v3' : baseUrl)
  }

  async generateImage(config: SeedreamConfig, previousImage?: string): Promise<string> {
    try {
      console.log('🎨 Seedream 服务调用:', {
        mode: config.mode,
        hasPreviousImage: !!previousImage,
        apiKey: this.apiKey ? '已配置' : '未配置',
        baseUrl: this.baseUrl
      })
      
      if (config.mode === 'edit' && previousImage) {
        console.log('🖼️ 使用编辑模式')
        return await this.editImage(config, previousImage)
      } else {
        console.log('🎆 使用生成模式')
        return await this.createImage(config)
      }
    } catch (error) {
      console.error('🚨 Seedream 服务错误:', error)
      throw error
    }
  }

  private async createImage(config: SeedreamConfig): Promise<string> {
    console.log('🎨 正在创建新图像...')
    const request: SeedreamGenerateRequest = {
      model: "doubao-seedream-4-0-250828",
      prompt: config.prompt_main,
      response_format: "url",
      size: "4K",
      stream: false,
      watermark: true
    }

    console.log('📞 发送图像生成请求:', request)
    const response = await this.makeRequest('/images/generations', request)
    console.log('📨 接收图像生成响应:', response)
    const imageUrl = response.data[0]?.url || response.data[0]?.b64_json || ''
    console.log('🖼️ 生成的图像 URL:', imageUrl ? '有效' : '空')
    return imageUrl
  }

  private async editImage(config: SeedreamConfig, previousImage: string): Promise<string> {
    const request: SeedreamGenerateRequest = {
      model: "doubao-seedream-4-0-250828",
      prompt: config.prompt_edit_only,
      image: [previousImage],
      response_format: "url",
      size: "4K",
      stream: false,
      watermark: true
    }

    const response = await this.makeRequest('/images/generations', request)
    return response.data[0]?.url || response.data[0]?.b64_json || ''
  }

  private async makeRequest(endpoint: string, data: any): Promise<SeedreamResponse> {
    const url = `${this.baseUrl}${endpoint}`
    console.log('🌐 发送 API 请求到:', url)
    console.log('📦 请求数据:', JSON.stringify(data, null, 2))
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    })

    console.log('📡 API 响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 错误响应:', errorText)
      throw new Error(`Seedream API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ API 成功响应:', result)
    return result
  }



  // 模拟图像生成（用于开发测试）
  async mockGenerateImage(config: SeedreamConfig, previousImage?: string): Promise<string> {
    // 返回一个占位图像的 base64 或 URL
    await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟 API 延迟
    
    // 安全获取色板值
    const palette = config.style_guide?.色板 || ['#e8f4f8', '#7fb3d3', '#2c5aa0']
    const contrast = config.style_guide?.对比度 || '中'
    const grain = config.style_guide?.颗粒 || '细'
    
    // 生成一个简单的 SVG 占位图
    const svgContent = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${palette[0] || '#e8f4f8'}"/>
        <rect x="50" y="50" width="412" height="412" fill="${palette[1] || '#7fb3d3'}" rx="20"/>
        <text x="256" y="200" text-anchor="middle" fill="${palette[2] || '#2c5aa0'}" font-size="24" font-family="sans-serif">
          ${config.mode === 'edit' ? '局部编辑' : '全新生成'}
        </text>
        <text x="256" y="240" text-anchor="middle" fill="${palette[2] || '#2c5aa0'}" font-size="16" font-family="sans-serif">
          图像生成
        </text>
        <text x="256" y="280" text-anchor="middle" fill="${palette[2] || '#2c5aa0'}" font-size="14" font-family="sans-serif">
          对比度: ${contrast}
        </text>
        <text x="256" y="300" text-anchor="middle" fill="${palette[2] || '#2c5aa0'}" font-size="14" font-family="sans-serif">
          颗粒: ${grain}
        </text>
      </svg>
    `
    
    const base64 = btoa(unescape(encodeURIComponent(svgContent)))
    return `data:image/svg+xml;base64,${base64}`
  }

  // 检查 API 状态 - 使用实际的生成端点进行轻量测试
  async checkApiStatus(): Promise<boolean> {
    try {
      // 使用正确的 API 格式进行测试
      const testRequest: SeedreamGenerateRequest = {
        model: "doubao-seedream-4-0-250828",
        prompt: "test connection",
        response_format: "url",
        size: "1K",
        stream: false,
        watermark: true
      }
      
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(testRequest)
      })
      
      // 即使返回错误，只要不是网络错误或CORS错误，就说明连接正常
      return response.status !== 0 && !response.url.includes('cors-error')
    } catch (error) {
      console.log('API Status Check Error:', error)
      return false
    }
  }
}
