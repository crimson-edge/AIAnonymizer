import { GroqResponse } from '../types/GroqTypes';
import { SubscriptionTier } from '@prisma/client';
import { keyManager } from '../manager/KeyManager';

interface AnonymizeOptions {
  userId?: string;
  tier?: SubscriptionTier;
  text: string;
}

interface ChatResponse extends GroqResponse {
  usage?: {
    total_tokens: number;
  };
}

export class GroqClient {
  private static instance: GroqClient;
  private readonly baseUrl = 'https://api.groq.com/v1/chat/completions';
  private readonly model = 'mixtral-8x7b-32768';

  private constructor() {}

  static getInstance(): GroqClient {
    if (!GroqClient.instance) {
      GroqClient.instance = new GroqClient();
    }
    return GroqClient.instance;
  }

  async anonymize({ userId = 'anonymous', tier = 'FREE', text }: AnonymizeOptions): Promise<string> {
    const key = await keyManager.getKey(userId);
    
    if (!key) {
      throw new Error('Failed to get API key');
    }

    const prompt = this.buildAnonymizationPrompt(text);
    
    try {
      const response = await this.makeRequest(key.key, prompt);
      
      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from AI service');
      }

      // Record usage
      await keyManager.recordUsage(
        key.id,
        userId,
        'anonymize',
        response.usage?.total_tokens || 0
      );

      return response.choices[0].message.content;
    } catch (error) {
      // Release the key on error
      await keyManager.releaseKey(key.id);
      throw error;
    }
  }

  private buildAnonymizationPrompt(text: string): any {
    return {
      messages: [
        {
          role: 'system',
          content: 'You are an AI that specializes in anonymizing text while preserving context. Replace all personal identifiable information (PII) with generic placeholders.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: this.model,
      temperature: 0.5,
      max_tokens: 32768,
    };
  }

  private async makeRequest(apiKey: string, data: any): Promise<ChatResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const groqClient = GroqClient.getInstance();