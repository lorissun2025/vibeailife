# VibeAILife 部署指南

本文档介绍如何将 VibeAILife 部署到 Vercel。

## 前置要求

1. **Vercel 账号**：注册 [Vercel](https://vercel.com)
2. **GitHub 仓库**：将代码推送到 GitHub
3. **Supabase 项目**：数据库和认证服务
4. **必要的 API 密钥**：

### 必需的环境变量

```bash
# 数据库 (Supabase)
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app

# LLM API (至少需要其中一个)
OPENAI_API_KEY=your_openai_api_key
ZHIPU_API_KEY=your_zhipu_api_key
```

### 可选的环境变量

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 邮件服务
RESEND_API_KEY=your_resend_api_key

# Stripe 支付
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 部署步骤

### 1. 准备 Supabase

1. 访问 [Supabase](https://supabase.com) 并创建项目
2. 在项目设置中获取：
   - Database URL
   - Project URL
   - anon/public key

3. 运行数据库迁移（在本地或 Supabase SQL Editor）：
```bash
cd vibeailife
npx prisma db push
```

### 2. 生成 NextAuth Secret

```bash
openssl rand -base64 32
```

### 3. 推送代码到 GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 4. 在 Vercel 导入项目

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `vibeailife`
   - **Build Command**: `npm run build` (自动检测)
   - **Output Directory**: `.next` (自动检测)

### 5. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DATABASE_URL` | Supabase 数据库连接字符串 | ✅ |
| `SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | ✅ |
| `NEXTAUTH_URL` | 生产环境 URL | ✅ |
| `OPENAI_API_KEY` | OpenAI API 密钥 | ✅ |
| `ZHIPU_API_KEY` | 智谱 AI API 密钥 | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth 客户端 ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 密钥 | - |
| `RESEND_API_KEY` | Resend 邮件服务密钥 | - |
| `STRIPE_SECRET_KEY` | Stripe 密钥 | - |
| `STRIPE_PUBLISHABLE_KEY` | Stripe 公开密钥 | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 密钥 | - |

### 6. 配置 Google OAuth (可选)

如果需要 Google 登录功能：

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID：
   - **应用程序类型**: Web 应用程序
   - **授权的重定向 URI**: `https://your-domain.vercel.app/api/auth/callback/google`
5. 复制客户端 ID 和密钥到 Vercel 环境变量

### 7. 部署

点击 "Deploy" 按钮，等待部署完成。

### 8. 部署后设置

1. **更新 NEXTAUTH_URL**：设置为你的 Vercel 域名
2. **更新 Google OAuth 回调 URL**（如果使用 Google 登录）：
   - 在 Google Cloud Console 中添加生产 URL
3. **在 Supabase 中配置认证**（可选）：
   - 启用 Email Auth
   - 配置 SMTP 设置（用于发送魔法链接）

## 部署检查清单

- [ ] 所有环境变量已配置
- [ ] 数据库迁移已运行
- [ ] NextAuth URL 已更新为生产域名
- [ ] Google OAuth 回调 URL 已更新（如果使用）
- [ ] 测试登录功能
- [ ] 测试主要功能（聊天、Vibe、目标等）

## 常见问题

### 1. 数据库连接失败

检查 `DATABASE_URL` 是否正确，确保 Supabase 项目未暂停。

### 2. NextAuth 回调失败

确保 `NEXTAUTH_URL` 与生产域名完全匹配（包括协议）。

### 3. Google OAuth 错误

检查回调 URL 是否包含正确的域名和路径。

### 4. API 调用失败

检查 LLM API 密钥是否正确配置。

## 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照指示配置 DNS 记录
4. 等待 SSL 证书生成

## 监控和日志

- Vercel Dashboard 提供部署日志
- 使用 Vercel Analytics 查看访问统计
- Supabase Dashboard 监控数据库性能

## 更新部署

每次推送到 `main` 分支会自动触发部署。

要手动触发部署：
```bash
git push origin main
```

## 回滚

如果新版本有问题，可以在 Vercel Dashboard 中回滚到之前的部署。
