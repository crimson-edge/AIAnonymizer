import bcrypt from 'bcrypt';
import crypto from 'crypto';

export function generateResetToken(): string {
  return crypto.randomUUID();
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
