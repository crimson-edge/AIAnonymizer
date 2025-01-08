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

export interface ApiKey {
  id: string;
  key: string;
  isActive: boolean;
  userId: string;
  totalUsage: number;
  createdAt: Date;
  updatedAt: Date;
  usageHistory?: RequestLog[];
}

export interface KeyMetrics {
  id: string;
  isActive: boolean;
  totalUsage: number;
  createdAt: Date;
  updatedAt: Date;
  successRate: number;
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