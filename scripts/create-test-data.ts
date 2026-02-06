import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🔨 创建测试数据...\n');

    // 创建测试用户
    console.log('1️⃣ 创建测试用户...');
    const testUser = await prisma.user.upsert({
      where: { id: 'test-user' },
      update: {},
      create: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        tier: 'FREE',
        hasOnboarded: true,
        region: 'international',
        provider: 'email',
      }
    });
    console.log('✅ 测试用户创建成功:', testUser.email);

    // 创建测试对话
    console.log('\n2️⃣ 创建测试对话...');
    const conversation = await prisma.conversation.create({
      data: {
        userId: 'test-user',
        mode: 'FRIEND',
        title: '我的第一个对话',
      }
    });
    console.log('✅ 测试对话创建成功:', conversation.title);
    console.log('   对话 ID:', conversation.id);

    // 创建每月使用限制
    console.log('\n3️⃣ 创建使用限制记录...');
    const today = new Date();
    const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    await prisma.usageLimit.upsert({
      where: {
        userId_period: {
          userId: 'test-user',
          period,
        }
      },
      update: {},
      create: {
        userId: 'test-user',
        period,
        messageCount: 0,
        vibeCount: 0,
        goalCount: 0,
        tokensUsed: 0,
        resetAt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      }
    });
    console.log('✅ 使用限制记录创建成功');

    await prisma.$disconnect();
    console.log('\n✅ 测试数据创建完成！');
    console.log('\n📝 测试账号信息:');
    console.log('   用户 ID: test-user');
    console.log('   邮箱: test@example.com');
    console.log('   密码: (任意，测试模式)');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ 创建测试数据失败！');
    console.error('错误信息:', error.message);
    process.exit(1);
  }
}

createTestData();
