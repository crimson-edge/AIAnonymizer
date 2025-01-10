import { Session } from "next-auth";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function isAdmin(session: Session | null): boolean {
  return session?.user?.isAdmin === true;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  if (!size || size === Infinity) return '0 Bytes';

  return `${size.toFixed(2)} ${units[i]}`;
}