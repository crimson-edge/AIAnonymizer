export interface GroqKey {
    key: string;
    isInUse: boolean;
    currentSession?: string;
    lastUsed?: Date;
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    errorCount: number;
  }
  
  export interface RequestLog {
    id: string;
    keyId: string;
    timestamp: Date;
    latency: number;
    tokens: number;
    cost: number;
    success: boolean;
    errorType?: string;
    userId?: string;
    requestType: 'chat' | 'completion';
  }
  
  export interface KeyMetrics {
    requestCount: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    errorRate: number;
    lastNRequests: RequestLog[];
  }
  
  export interface KeyAllocationResult {
    key: string;
    metrics: KeyMetrics;
    error?: string;
  }