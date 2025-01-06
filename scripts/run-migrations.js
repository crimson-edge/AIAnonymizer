const { execSync } = require('child_process');

// Use the production database URL
const databaseUrl = 'postgresql://postgres.wopagkahtonshjzrooqk:BqLnp32h5Is2I2Tl@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require&ssl=true&connection_limit=5';

try {
  console.log('Running database migrations...');
  
  // Run prisma migrate
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl
    }
  });
  
  console.log('Migrations completed successfully');
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
}
