// Dynamically get the port from the server or use a default
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }

  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  // Assume localhost
  const port = process.env.PORT || new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000').port || 3000;
  return `http://localhost:${port}`;
}

// Update NEXTAUTH_URL if needed
if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  process.env.NEXTAUTH_URL = getBaseUrl();
}
