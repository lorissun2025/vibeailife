/**
 * LLM Provider Configuration and Management
 * Supports multiple LLM providers (OpenAI, Zhipu AI) with automatic fallback
 */

import OpenAI from 'openai';

// ============== Types ==============

export type LLMProviderName = 'openai' | 'zhipu';
export type UserRegion = 'cn' | 'international';
export type UserTier = 'FREE' | 'PRO' | 'ENTERPRISE';
export type ChatMode = 'FRIEND' | 'COACH' | 'LISTENER';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMProvider {
  name: LLMProviderName;
  client: OpenAI;
  model: string;
}

export interface StreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullMessage: string) => void;
  onError?: (error: Error) => void;
}

// ============== Provider Configuration ==============

interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  models: {
    free: string;
    pro: string;
    enterprise: string;
  };
}

const PROVIDER_CONFIGS: Record<LLMProviderName, ProviderConfig> = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    models: {
      free: 'gpt-4o-mini',
      pro: 'gpt-4o',
      enterprise: 'gpt-4o',
    },
  },
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY || '',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
    models: {
      free: 'glm-4-flash',
      pro: 'glm-4',
      enterprise: 'glm-4-plus',
    },
  },
};

// ============== System Prompts ==============

const CHAT_MODE_SYSTEM_PROMPTS: Record<ChatMode, string> = {
  FRIEND: `你是一个温暖、友善的朋友。你的特点是：
- 用轻松、口语化的方式交流
- 偶尔使用表情符号增加亲和力
- 会主动分享一些类似的经历
- 给予情感支持和理解
- 避免说教，更多是陪伴和倾听`,

  COACH: `你是一位专业的成长教练。你的特点是：
- 提供具体、可执行的建议
- 帮助用户理清思路，找到解决方案
- 适时提出启发性的问题
- 保持专业但有温度的态度
- 关注用户的成长和进步`,

  LISTENER: `你是一个耐心的倾听者。你的特点是：
- 更多倾听，少给建议
- 用共情和理解回应
- 帮助用户梳理情绪
- 提供安全的空间表达感受
- 不评判，只是陪伴和理解`,
};

// ============== Provider Selection ==============

/**
 * Select the appropriate LLM provider based on user region and tier
 */
export function selectLLMProvider(
  region: UserRegion,
  tier: UserTier,
  providerOverride?: LLMProviderName
): LLMProvider {
  // If provider is explicitly specified, use it
  if (providerOverride) {
    const config = PROVIDER_CONFIGS[providerOverride];
    return {
      name: providerOverride,
      client: new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      }),
      model: config.models[tier.toLowerCase() as keyof typeof config.models],
    };
  }

  // Auto-select based on region
  // CN users use Zhipu, International users use OpenAI
  const providerName: LLMProviderName = region === 'cn' ? 'zhipu' : 'openai';
  const config = PROVIDER_CONFIGS[providerName];

  return {
    name: providerName,
    client: new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    }),
    model: config.models[tier.toLowerCase() as keyof typeof config.models],
  };
}

/**
 * Get fallback provider for error recovery
 */
export function getFallbackProvider(primaryProvider: LLMProviderName): LLMProviderName {
  const fallbackMap: Record<LLMProviderName, LLMProviderName> = {
    openai: 'zhipu',
    zhipu: 'openai',
  };
  return fallbackMap[primaryProvider];
}

// ============== Chat Functions ==============

/**
 * Send a chat request with automatic retry on failure
 */
export async function chatWithLLM(
  messages: LLMMessage[],
  region: UserRegion,
  tier: UserTier,
  chatMode: ChatMode,
  options?: StreamOptions,
  providerOverride?: LLMProviderName,
  fortuneSystemPrompt?: string
): Promise<string> {
  let lastError: Error | null = null;
  let provider = selectLLMProvider(region, tier);

  // Build system prompt
  let systemPrompt = CHAT_MODE_SYSTEM_PROMPTS[chatMode];

  // 如果有签文提示词，追加到系统提示词中
  if (fortuneSystemPrompt) {
    systemPrompt += `\n\n${fortuneSystemPrompt}`;
  }

  // Add system prompt for the chat mode
  const messagesWithSystem: LLMMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...messages,
  ];

  // Try primary provider, then fallback
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (options?.onChunk) {
        // Streaming request
        return await streamChatRequest(provider, messagesWithSystem, options);
      } else {
        // Non-streaming request
        const response = await provider.client.chat.completions.create({
          model: provider.model,
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 1000,
        });

        return response.choices[0]?.message?.content || '';
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Provider ${provider.name} failed:`, error);

      // Try fallback provider
      const fallbackName = getFallbackProvider(provider.name);
      console.log(`Falling back to ${fallbackName}...`);
      provider = selectLLMProvider(region, tier, fallbackName);
    }
  }

  throw lastError || new Error('LLM request failed');
}

/**
 * Streaming chat request
 */
async function streamChatRequest(
  provider: LLMProvider,
  messages: LLMMessage[],
  options: StreamOptions
): Promise<string> {
  const stream = await provider.client.chat.completions.create({
    model: provider.model,
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    stream: true,
  });

  let fullMessage = '';

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullMessage += content;
      options.onChunk?.(content);
    }
  }

  options.onComplete?.(fullMessage);
  return fullMessage;
}

// ============== Utility Functions ==============

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English, ~2 for Chinese
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 2 + otherChars / 4);
}

/**
 * Check if a provider is available (has API key)
 */
export function isProviderAvailable(providerName: LLMProviderName): boolean {
  const config = PROVIDER_CONFIGS[providerName];
  return !!config.apiKey && config.apiKey !== '';
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): LLMProviderName[] {
  return Object.keys(PROVIDER_CONFIGS).filter(
    (name) => isProviderAvailable(name as LLMProviderName)
  ) as LLMProviderName[];
}
