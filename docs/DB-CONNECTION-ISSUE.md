# 数据库连接问题解决方案

## 当前状态

- ✅ Supabase 项目正常运行
- ✅ 数据库密码已重置：`At1Y1rJR2SWqSjtc`
- ❌ 无法从本地连接到数据库（认证失败）

## 问题原因

错误信息 "Tenant or user not found" 表明：
1. 密码可能不正确
2. 或者 Supabase Pooler 需要特殊的用户名格式

## 解决方案

### 方案 A：使用 Supabase Dashboard SQL Editor（推荐）

1. 登录 Supabase Dashboard
2. 点击左侧 **SQL Editor**
3. 点击 **New Query**
4. 粘贴以下 SQL 创建所有表：

```sql
-- 用户与认证相关表
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "providerId" TEXT,
    "wechatOpenid" TEXT,
    "wechatUnionid" TEXT,
    "region" TEXT NOT NULL DEFAULT 'international',
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "hasOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_providerId_key" ON "User"("providerId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_wechatOpenid_key" ON "User"("wechatOpenid");
CREATE UNIQUE INDEX IF NOT EXISTS "User_wechatUnionid_key" ON "User"("wechatUnionid");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_provider_providerId_idx" ON "User"("provider", "providerId");
CREATE INDEX IF NOT EXISTS "User_region_idx" ON "User"("region");

-- NextAuth.js required models
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Vibe 追踪相关表
CREATE TABLE IF NOT EXISTS "VibeRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" INTEGER NOT NULL,
    "energy" INTEGER NOT NULL,
    "tags" TEXT[] NOT NULL,
    "note" TEXT,
    "aiResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VibeRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VibeRecord_userId_createdAt_idx" ON "VibeRecord"("userId", "createdAt" DESC);

-- 对话相关表
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'FRIEND',
    "title" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Conversation_userId_updatedAt_idx" ON "Conversation"("userId", "updatedAt" DESC);

CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt" ASC);

-- 每日签文表
CREATE TABLE IF NOT EXISTS "Fortune" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "luckyItem" TEXT,
    "luckyColor" TEXT,
    "luckyNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fortune_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Fortune_date_key" ON "Fortune"("date");
CREATE INDEX IF NOT EXISTS "Fortune_date_idx" ON "Fortune"("date");

-- 目标管理相关表
CREATE TABLE IF NOT EXISTS "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deadline" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Goal_userId_status_idx" ON "Goal"("userId", "status");

CREATE TABLE IF NOT EXISTS "GoalCheckin" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalCheckin_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GoalCheckin_goalId_createdAt_idx" ON "GoalCheckin"("goalId", "createdAt" DESC);

-- 订阅与支付相关表
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'PRO',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "provider" TEXT NOT NULL DEFAULT 'STRIPE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stripePaymentId" TEXT,
    "alipayOrderId" TEXT,
    "wechatTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_alipayOrderId_key" ON "Payment"("alipayOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_wechatTransactionId_key" ON "Payment"("wechatTransactionId");
CREATE INDEX IF NOT EXISTS "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_provider_idx" ON "Payment"("provider");

-- 使用限制表
CREATE TABLE IF NOT EXISTS "UsageLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "vibeCount" INTEGER NOT NULL DEFAULT 0,
    "goalCount" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UsageLimit_userId_period_key" ON "UsageLimit"("userId", "period");
CREATE INDEX IF NOT EXISTS "UsageLimit_userId_period_idx" ON "UsageLimit"("userId", "period");

-- 分析事件表
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "event" TEXT NOT NULL,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_event_createdAt_idx" ON "AnalyticsEvent"("event", "createdAt" DESC);

-- 添加外键约束
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VibeRecord" ADD CONSTRAINT "VibeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsageLimit" ADD CONSTRAINT "UsageLimit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoalCheckin" ADD CONSTRAINT "GoalCheckin_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

5. 点击 **Run** 执行 SQL

### 方案 B：联系 Supabase 支持

如果方案 A 不可行，可能需要联系 Supabase 支持团队询问为什么无法连接。

### 方案 C：使用本地数据库

暂时使用本地 PostgreSQL 进行开发，部署时再连接 Supabase。

---

**推荐使用方案 A（在 Supabase Dashboard 执行 SQL），这样可以立即继续开发工作。**
