import { PrismaClient, SubscriptionTier } from '@prisma/client';
import { subscriptionLimits } from '../src/config/subscription-limits';

const prisma = new PrismaClient();

async function fixTokenLimits() {
  try {
    console.log('Starting token limit fix...');

    // Update all subscriptions
    const subscriptions = await prisma.subscription.findMany();
    
    for (const subscription of subscriptions) {
      const tier = subscription.tier as SubscriptionTier;
      const monthlyLimit = subscriptionLimits[tier].monthlyTokens;
      
      // Get monthly usage for this user
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const monthlyUsage = await prisma.usage.aggregate({
        where: {
          userId: subscription.userId,
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          tokens: true
        }
      });

      const usedTokens = monthlyUsage._sum.tokens || 0;
      const availableTokens = monthlyLimit - usedTokens;

      console.log(`Updating subscription ${subscription.id}:`, {
        tier,
        oldMonthlyLimit: subscription.monthlyLimit,
        newMonthlyLimit: monthlyLimit,
        oldAvailableTokens: subscription.availableTokens,
        newAvailableTokens: availableTokens,
        usedTokens
      });

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          monthlyLimit,
          availableTokens
        }
      });
    }

    console.log('Token limit fix completed successfully!');
  } catch (error) {
    console.error('Error fixing token limits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTokenLimits();
