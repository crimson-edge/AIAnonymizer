import { Groq } from 'groq-sdk';
import { acquireGroqKey, releaseGroqKey, updateTokenUsage } from './groq';

class GroqClient {
  private client: Groq | null = null;
  private currentKey: string | null = null;

  private async initialize() {
    if (!this.client) {
      // Acquire a key from the pool
      const key = await acquireGroqKey();
      this.currentKey = key;
      this.client = new Groq({
        apiKey: key,
      });
    }
    return this.client;
  }

  async chat(messages: any[], options: any = {}) {
    try {
      const client = await this.initialize();
      const completion = await client.chat.completions.create({
        messages,
        ...options,
        model: 'mixtral-8x7b-32768',
      });

      // Update token usage
      if (completion.usage) {
        await updateTokenUsage(completion.usage.total_tokens);
      }

      return completion;
    } catch (error) {
      console.error('Error in Groq chat:', error);
      // If we get an authentication error, release the key as it might be invalid
      if (error.response?.status === 401) {
        await this.releaseKey();
      }
      throw error;
    }
  }

  async releaseKey() {
    if (this.currentKey) {
      await releaseGroqKey();
      this.currentKey = null;
      this.client = null;
    }
  }
}

// Create a singleton instance
const groqClient = new GroqClient();

export default groqClient;
