import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRegion() {
  await prisma.user.update({
    where: { id: 'test-user' },
    data: { region: 'cn' }
  });
  console.log('✅ 测试用户 region 已更新为 cn');
  await prisma.$disconnect();
}

updateUserRegion();
