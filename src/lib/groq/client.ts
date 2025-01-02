import { Groq } from 'groq-sdk';
import { getGroqKeyForSession, assignGroqKeyToSession, releaseGroqKeyFromSession } from '../../utils/groq-key-pool';

export class GroqClient {
  private client: Groq | null = null;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async initialize(): Promise<void> {
    let apiKey = await getGroqKeyForSession(this.sessionId);
    
    if (!apiKey) {
      apiKey = await assignGroqKeyToSession(this.sessionId);
      if (!apiKey) {
        throw new Error('No available Groq API keys');
      }
    }

    this.client = new Groq({
      apiKey,
    });
  }

  async anonymize(text: string): Promise<string> {
    if (!this.client) {
      await this.initialize();
    }

    try {
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

      return completion.choices[0]?.message?.content || text;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw new Error('Failed to anonymize text');
    }
  }

  async release(): Promise<void> {
    await releaseGroqKeyFromSession(this.sessionId);
    this.client = null;
  }
}
