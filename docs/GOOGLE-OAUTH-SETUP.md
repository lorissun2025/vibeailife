# Google OAuth 配置指南

## 步骤 1: 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 记录项目 ID

## 步骤 2: 启用 Google+ API

1. 在左侧菜单中选择 **APIs & Services** > **Library**
2. 搜索 "Google+ API" 或 "Google Identity"
3. 点击启用

## 步骤 3: 配置 OAuth 同意屏幕

1. 进入 **APIs & Services** > **OAuth consent screen**
2. 选择 **External** 用户类型
3. 填写应用信息：
   - **App name**: VibeAILife
   - **User support email**: 你的邮箱
   - **Developer contact email**: 你的邮箱
4. 添加 scopes（授权范围）：
   - `openid`
   - `email`
   - `profile`
5. 添加测试用户（开发阶段）
6. 点击 **Save and Continue**

## 步骤 4: 创建 OAuth 2.0 凭证

1. 进入 **APIs & Services** > **Credentials**
2. 点击 **Create Credentials** > **OAuth client ID**
3. 应用类型选择 **Web application**
4. 配置授权重定向 URI：

### 本地开发
```
http://localhost:3000/api/auth/callback/google
```

### 生产环境
```
https://vibeailife.com/api/auth/callback/google
```

5. 点击 **Create**

## 步骤 5: 获取凭证

创建完成后，您将看到：
- **Client ID**: 类似 `xxx.apps.googleusercontent.com`
- **Client Secret**: 一串随机字符

## 步骤 6: 配置环境变量

将以下内容添加到 `.env.local` 文件：

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 步骤 7: 测试登录

1. 重启开发服务器：
```bash
npm run dev
```

2. 访问 `http://localhost:3000/auth/signin`

3. 点击 "使用 Google 继续"

4. 首次登录会看到 Google 授权页面

5. 授权成功后会重定向回应用

## 故障排除

### 问题 1: redirect_uri_mismatch 错误

**原因**: 重定向 URI 不匹配

**解决**:
1. 检查 Google Console 中的授权重定向 URI
2. 确保包含 `http://localhost:3000/api/auth/callback/google`
3. 不要在 URI 末尾添加 `/`

### 问题 2: invalid_client 错误

**原因**: Client ID 或 Client Secret 不正确

**解决**:
1. 重新检查 `.env.local` 文件中的值
2. 确保没有多余的空格或引号
3. 重启开发服务器

### 问题 3: access_denied 错误

**原因**: OAuth 同意屏幕配置不完整或测试用户未添加

**解决**:
1. 完成 OAuth 同意屏幕配置
2. 在 **Test users** 中添加您的测试邮箱
3. 确保应用状态为 **In Production** 或已添加测试用户

### 问题 4: API key not enabled 错误

**原因**: Google+ API 未启用

**解决**:
1. 在 **APIs & Services** > **Library** 中启用 Google Identity API
2. 等待几分钟让更改生效

## 生产环境配置

部署到生产环境时，需要：

1. 在 Google Console 中添加生产环境的重定向 URI：
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

2. 更新 `.env.production`:
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   GOOGLE_CLIENT_ID=production-client-id
   GOOGLE_CLIENT_SECRET=production-client-secret
   ```

3. 将应用状态改为 **In Production**（移除测试用户限制）

## 安全建议

1. **不要提交凭证到 Git**: `.env.local` 已在 `.gitignore` 中
2. **定期轮换密钥**: 每 90 天更新一次 Client Secret
3. **限制 API 使用**: 在 Google Console 中设置配额
4. **监控异常活动**: 使用 Google Cloud 的审计日志

## 参考资料

- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
