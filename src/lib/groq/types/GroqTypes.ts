export interface GroqResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
    usage?: {
      total_tokens: number;
    };
  }
  
  export interface RequestLog {
    id: string;
    timestamp: Date;
    keyId: string;
    latency: number;
    tokens: number;
    cost: number;
    success: boolean;
    errorType: string | null;
    userId: string;
    requestType: string;
  }
  import { Prisma } from '@prisma/client';

export interface GroqKey {
  id: string;
  key: string;
  isInUse: boolean;
  currentSession: string | null;
  lastUsed: Date | null;
  totalRequests: number;
  totalTokens: bigint;  // Changed to match Prisma's type
  totalCost: Prisma.Decimal;  // Changed to match Prisma's type
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
  usageHistory?: RequestLog[];  // Added optional usageHistory
}
  
export interface KeyMetrics {
    id: string;  // Add this
    isInUse: boolean;
    lastUsed: Date;
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    errorCount: number;
    currentSession: string | null;
    lastRequest: Date | null;
    successRate: number;  // Add this
    lastNRequests: number;  // Add this
    createdAt: Date;  // Add this
    updatedAt: Date;  // Add this
    totalUsage?: number;  // Add this for sorting
  }
  
  export interface ChatResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
    usage?: {
      total_tokens: number;
    };
  }