# 部署前检查清单

在部署到 Vercel 之前，请确认以下事项已完成：

## ✅ 代码检查

### 基础配置
- [x] `.env.example` 文件包含所有必需的环境变量说明
- [x] `.gitignore` 文件已创建，避免提交敏感信息
- [x] `vercel.json` 配置文件已创建

### 登录功能
- [x] NextAuth 配置正确 (`/api/auth/[...nextauth]/route.ts`)
- [x] 登录页面样式统一 (`/auth/signin`)
- [x] 错误页面完整 (`/auth/error`)
- [x] SessionProvider 已在 layout 中配置

### 页面功能
- [x] Dashboard (`/dashboard`)
- [x] Chat (`/chat`)
- [x] Vibe 记录 (`/vibe`)
- [x] Fortune (`/fortune`)
- [x] Goals (`/goals`)
- [x] Settings (`/settings`)
- [x] Subscription (`/subscription`)
- [x] Admin (`/admin`)

## 🔧 环境变量配置

### 必需变量（部署时必须配置）

```bash
# 数据库
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app

# LLM API (至少配置一个)
OPENAI_API_KEY=your_openai_api_key
ZHIPU_API_KEY=your_zhipu_api_key
```

### 可选变量

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 邮件服务
EMAIL_SERVER_HOST=your_smtp_server
EMAIL_FROM=your_sender_email
RESEND_API_KEY=your_resend_api_key

# Stripe 支付
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 📋 部署步骤

### 1. 准备 Supabase

1. 登录 [Supabase](https://supabase.com)
2. 创建新项目或使用现有项目
3. 在 Settings → Database 获取连接字符串
4. 运行数据库迁移：
```bash
cd vibeailife
npx prisma db push
```

### 2. 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 3. 推送代码到 GitHub

```bash
git status
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 4. Vercel 部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库
4. 配置项目：
   - Root Directory: `vibeailife`
   - Framework: Next.js (自动检测)
5. 配置环境变量（见上方清单）
6. 点击 "Deploy"

### 5. 部署后配置

1. **更新 NEXTAUTH_URL**：
   - 在 Vercel 项目设置中
   - 设置为实际域名（如 `https://vibeailife.vercel.app`）

2. **配置 Google OAuth**（如果使用）：
   - 在 [Google Cloud Console](https://console.cloud.google.com)
   - 添加生产环境的回调 URL：`https://your-domain.vercel.app/api/auth/callback/google`

3. **测试登录功能**：
   - 访问 `/auth/signin`
   - 测试 Google 登录
   - 测试邮箱魔法链接（需配置邮件服务）

## 🧪 功能测试

部署后请测试以下功能：

### 基础功能
- [ ] 首页能正常访问
- [ ] 登录/注册功能正常
- [ ] Dashboard 加载正常
- [ ] 快捷操作按钮可用

### 核心功能
- [ ] Chat 聊天功能
- [ ] Vibe 记录和趋势
- [ ] Fortune 签文抽签
- [ ] Goals 目标管理
- [ ] Settings 设置页面

### 管理功能（测试账号）
- [ ] Admin 数据概览
- [ ] 用户管理（列表、搜索、封禁）
- [ ] 订单管理（列表、筛选）

## 🐛 常见问题排查

### 数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 确认 Supabase 项目未暂停
- 验证数据库迁移已执行

### 登录失败
- 检查 `NEXTAUTH_SECRET` 和 `NEXTAUTH_URL`
- Google OAuth：检查回调 URL 配置
- 邮箱登录：检查邮件服务配置

### API 调用失败
- 验证 OpenAI/智谱 API 密钥
- 检查 Vercel 函数日志

### 构建失败
- 检查依赖版本冲突
- 查看 Vercel 构建日志

## 📊 监控和维护

### Vercel Dashboard
- 查看部署日志
- 监控函数执行
- 分析访问统计

### Supabase Dashboard
- 监控数据库性能
- 查看认证日志
- 管理数据表

### 定期维护
- 更新依赖包
- 监控 API 使用量
- 备份重要数据

## 🚀 部署成功后

1. **更新文档**：记录生产环境配置
2. **配置域名**：添加自定义域名（可选）
3. **设置监控**：配置错误追踪（如 Sentry）
4. **通知设置**：配置部署通知

---

祝部署顺利！🎉
