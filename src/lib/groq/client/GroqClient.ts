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
      await keyManager.recordSuccess(key.key, userId, 'anonymize', response.usage?.total_tokens || 0);
      
      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from AI service');
      }

      return response.choices[0].message.content;

    } catch (error) {
      await keyManager.recordError(key.key, userId, 'anonymize', error as Error);
      throw error;
    }
  }

  private buildAnonymizationPrompt(text: string): any {
    return {
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: `You are an AI trained to anonymize text by replacing personal information with generic placeholders while preserving the meaning and context of the text. Follow these rules:
          1. Replace names with [NAME]
          2. Replace emails with [EMAIL]
          3. Replace phone numbers with [PHONE]
          4. Replace addresses with [ADDRESS]
          5. Replace dates with [DATE]
          6. Replace company names with [COMPANY]
          7. Replace locations with [LOCATION]
          8. Replace URLs with [URL]
          9. Replace social media handles with [SOCIAL_MEDIA]
          10. Replace any other identifying information with appropriate placeholders
          
          Important:
          - Preserve the original text structure and formatting
          - Keep non-personal information unchanged
          - Use consistent placeholders
          - Don't explain or comment on the changes`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 32000,
      stream: false
    };
  }

  private async makeRequest(apiKey: string, data: any): Promise<ChatResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`API request failed: ${error.error || 'Unknown error'}`);
    }

    return response.json();
  }
}

export const groqClient = GroqClient.getInstance();