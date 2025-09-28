import cron from 'node-cron';
import { prisma } from '@/lib/prisma';

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        publishedAt: { lte: now }
      }
    });

    await prisma.$transaction(
      scheduledPosts.map(post => 
        prisma.post.update({
          where: { id: post.id },
          data: { 
            status: 'published',
            publishedAt: now 
          }
        })
      )
    );
    console.log(`publish ${scheduledPosts.length} articles successfully`);
  } catch (err) {
    console.error('scheduled pulish failed', err);
  }
});