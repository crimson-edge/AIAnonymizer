import { Groq } from 'groq-sdk';
import { keyManager } from './manager/KeyManager';

export class GroqClient {
  private client: Groq | null = null;
  private userId: string;
  private currentKeyId: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  async initialize(): Promise<void> {
    const key = await keyManager.getKey(this.userId);
    if (!key) {
      throw new Error('No available Groq API keys');
    }

    this.client = new Groq({
      apiKey: key.key,
    });
    this.currentKeyId = key.id;
  }

  async anonymize(text: string): Promise<string> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const startTime = Date.now();
      const completion = await this.client!.chat.completions.create({
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
        model: 'mixtral-8x7b-32768',
        temperature: 0.5,
        max_tokens: 32768,
      });

      if (this.currentKeyId) {
        await keyManager.recordUsage(
          this.currentKeyId,
          this.userId,
          'anonymize',
          completion.usage?.total_tokens || 0
        );
      }

      return completion.choices[0]?.message?.content || text;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.currentKeyId) {
      await keyManager.releaseKey(this.currentKeyId);
    }
    this.client = null;
    this.currentKeyId = null;
  }
}
