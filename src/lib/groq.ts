// Utility functions for managing Groq API keys

let currentKey: { key: string; keyId: string } | null = null;

export async function acquireGroqKey(): Promise<string> {
  try {
    // If we already have a key, return it
    if (currentKey?.key) {
      return currentKey.key;
    }

    // Acquire a new key
    const res = await fetch('/api/groq/key', {
      method: 'POST',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to acquire API key');
    }

    const data = await res.json();
    currentKey = {
      key: data.key,
      keyId: data.keyId,
    };

    return data.key;
  } catch (error) {
    console.error('Error acquiring Groq API key:', error);
    throw error;
  }
}

export async function releaseGroqKey(): Promise<void> {
  try {
    if (!currentKey?.keyId) {
      return;
    }

    await fetch('/api/groq/key', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyId: currentKey.keyId,
      }),
    });

    currentKey = null;
  } catch (error) {
    console.error('Error releasing Groq API key:', error);
    throw error;
  }
}

export async function updateTokenUsage(tokensUsed: number): Promise<void> {
  try {
    if (!currentKey?.keyId) {
      console.warn('No active key session to update usage for');
      return;
    }

    const res = await fetch('/api/groq/key', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyId: currentKey.keyId,
        tokensUsed,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update token usage');
    }
  } catch (error) {
    console.error('Error updating token usage:', error);
    throw error;
  }
}

// Make sure to release the key when the window is closed or the page is unloaded
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (currentKey) {
      releaseGroqKey().catch(console.error);
    }
  });
}
