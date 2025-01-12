import { z } from 'zod';
import { SubscriptionTier } from '@prisma/client';

export const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  tier: z.nativeEnum(SubscriptionTier)
});
