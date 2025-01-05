export interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  isAdmin: boolean;
  status: string;
  subscription?: {
    tier: string;
    monthlyLimit: number;
    tokenLimit: number;
    isActive: boolean;
  } | null;
  monthlyUsage: number;
  totalUsage: number;
  currentSession?: string | null;
  recentActivity?: Array<{
    action: string;
    timestamp: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  isActive: boolean;
  lastUsed?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
