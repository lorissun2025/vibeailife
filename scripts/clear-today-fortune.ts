import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTodayFortune() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deleted = await prisma.dailyFortune.deleteMany({
      where: {
        drawDate: today,
      },
    });

    console.log(`✅ 已删除今日 ${deleted.count} 条签文记录`);
    console.log('现在可以重新抽签了！');

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ 删除失败:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

clearTodayFortune();
