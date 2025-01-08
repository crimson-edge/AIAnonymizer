import { initializeGroqKeyPool } from '../src/utils/groq-key-pool';

const main = async () => {
  try {
    await initializeGroqKeyPool();
    console.log('Successfully initialized Groq API key pool');
  } catch (error) {
    console.error('Error initializing Groq API key pool:', error);
    process.exit(1);
  }
};

main();
