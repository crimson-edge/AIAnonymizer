import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');
console.log('Generated NEXTAUTH_SECRET:', secret);
console.log('\nAdd this to your .env file:');
console.log(`NEXTAUTH_SECRET="${secret}"`);
