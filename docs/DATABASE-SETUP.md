# 数据库设置指南

本文档说明如何配置 Supabase PostgreSQL 数据库并运行初始迁移。

## 前置条件

请确保已经完成以下步骤（参考 `TECHNICAL-PREP-CHECKLIST.md`）：

1. ✅ 注册 Supabase 账号
2. ✅ 创建新项目（等待数据库初始化完成）
3. ✅ 获取数据库连接字符串

## 步骤 1: 获取 Supabase 数据库连接字符串

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单 **Settings** → **Database**
4. 找到 **Connection string** 部分
5. 选择 **URI** 格式
6. 点击 **Copy** 按钮复制连接字符串

连接字符串格式如下：
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## 步骤 2: 配置环境变量

1. 打开项目根目录的 `.env.local` 文件
2. 添加以下环境变量（替换为实际值）：

```bash
# 数据库连接字符串
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase 配置（可选，用于直接调用 Supabase API）
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGci..."
```

**⚠️ 重要安全提醒**:
- 永远不要将 `.env.local` 文件提交到 Git
- `.env.local` 已在 `.gitignore` 中
- `.env.example` 文件可以提交（只包含示例值）

## 步骤 3: 验证数据库连接

运行以下命令验证连接：

```bash
cd vibeailife
npx prisma db pull
```

如果成功，你会看到：
```
Prisma schema loaded from prisma/schema.prisma
✔ Introspected 3 tables and 5 enums
```

## 步骤 4: 生成 Prisma Client

在每次修改 `schema.prisma` 后，需要重新生成 Prisma Client：

```bash
npx prisma generate
```

## 步骤 5: 创建数据库迁移

运行初始迁移，创建所有数据表：

```bash
npx prisma migrate dev --name init
```

这个命令会：
1. 创建新的迁移文件 `prisma/migrations/xxx_init/migration.sql`
2. 在数据库中执行迁移（创建所有表）
3. 自动运行 `prisma generate`

如果成功，你会看到：
```
Applying migration `20260115000000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260115000000_init/
    └─ migration.sql
```

## 步骤 6: 验证数据库结构

### 方法 1: 使用 Prisma Studio（可视化工具）

```bash
npx prisma studio
```

这会打开浏览器显示数据库内容（访问 http://localhost:5555）

### 方法 2: 使用 Supabase Table Editor

1. 打开 Supabase Dashboard
2. 点击左侧菜单 **Table Editor**
3. 查看所有创建的表：
   - User
   - Account
   - Session
   - VerificationToken
   - VibeRecord
   - Conversation
   - Message
   - Fortune
   - Goal
   - GoalCheckin
   - Subscription
   - Payment
   - UsageLimit
   - AnalyticsEvent

## 步骤 7: 测试数据库连接

创建测试脚本 `scripts/test-db.ts`：

```typescript
import { prisma } from '@/lib/prisma';

async function testDatabase() {
  try {
    // 测试连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');

    // 测试查询
    const userCount = await prisma.user.count();
    console.log(`✅ 当前用户数: ${userCount}`);

    await prisma.$disconnect();
    console.log('✅ 测试完成');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

testDatabase();
```

运行测试：
```bash
npx tsx scripts/test-db.ts
```

## 常见问题

### 问题 1: 连接超时

**错误信息**:
```
Error: P1001: Can't reach database server at `db.xxx.supabase.co:5432`
```

**解决方案**:
1. 检查 DATABASE_URL 是否正确
2. 检查网络连接
3. 确认 Supabase 项目状态（是否正在暂停/维护）
4. 检查是否需要添加 IP 白名单（Supabase 默认不限制）

### 问题 2: 认证失败

**错误信息**:
```
Error: P1003: Authentication failed
```

**解决方案**:
1. 确认密码是否正确
2. 在 Supabase Dashboard 重置数据库密码
3. 更新 `.env.local` 中的 DATABASE_URL

### 问题 3: 迁移冲突

**错误信息**:
```
Error: P3005: The database schema is not empty
```

**解决方案**:

**选项 A**: 重置数据库（删除所有数据）
```bash
npx prisma migrate reset
```

**选项 B**: 使用基线迁移
```bash
npx prisma migrate dev --name init --create-only
npx prisma migrate resolve --applied "20260115000000_init"
```

### 问题 4: Prisma Client 版本不匹配

**错误信息**:
```
Error: This version of Prisma Client is incompatible with the query engine
```

**解决方案**:
```bash
# 重新安装依赖
rm -rf node_modules prisma/migrations
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## 下一步

数据库配置完成后，可以继续：

1. ✅ 配置 NextAuth.js 认证系统
2. ✅ 创建登录/注册页面
3. ✅ 实现用户管理 API

## 参考文档

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [NextAuth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)

## 环境变量清单

完整的 `.env.local` 文件应包含：

```bash
# 数据库
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGci..."

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Google OAuth)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# OAuth (WeChat - 可选)
WECHAT_APP_ID="wx..."
WECHAT_APP_SECRET="xxx"

# LLM Providers
OPENAI_API_KEY="sk-xxx"
ZHIPU_API_KEY="xxx"

# Email (Email Magic Link)
RESEND_API_KEY="re_xxx"

# Payment (Stripe)
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Redis (Upstash - 可选)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"
```

---

**最后更新**: 2026-01-15
