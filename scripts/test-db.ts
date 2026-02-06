import { PrismaClient } from '@prisma/client';

// Prisma 6 会从 environment variables 读取 DATABASE_URL
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 测试数据库连接...\n');

    // 测试连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功！\n');

    // 查询数据库版本
    const result = await prisma.$queryRaw`SELECT version()` as any[];
    console.log('📊 数据库信息:');
    console.log(result[0]);

    // 检查现有表
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`\n📋 当前数据库中有 ${tables.length} 个表:`);
    tables.forEach((table: any) => console.log(`   - ${table.table_name}`));

    await prisma.$disconnect();
    console.log('\n✅ 测试完成！');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ 数据库连接失败！');
    console.error('错误信息:', error.message);
    console.error('\n请检查:');
    console.error('1. DATABASE_URL 是否正确');
    console.error('2. 数据库密码是否正确');
    console.error('3. 网络连接是否正常');
    process.exit(1);
  }
}

testConnection();
