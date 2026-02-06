# VibeAILife 验收指南

**版本**: v1.0.0
**更新时间**: 2026-01-22

---

## ✅ 问题已修复

抽签功能已修复！服务器需要从 `vibeailife` 目录启动。

---

## 🎯 快速验收步骤

### 1. 启动应用

```bash
cd /Users/sunsensen/vibeAIlife.com/vibeailife
npm run dev
```

应用将在 http://localhost:3000 启动

---

### 2. 核心功能测试

#### A. 设置页面（AI 模型选择）

**访问**: http://localhost:3000/settings

**验收项**:
- [ ] 页面正常加载
- [ ] 显示当前选择：智谱 AI
- [ ] 可以切换到 OpenAI
- [ ] 可以切换到自动选择
- [ ] 点击"保存更改"后设置保持
- [ ] 显示当前计划：FREE
- [ ] 显示地区：cn

**测试步骤**:
1. 选择"OpenAI (GPT)"
2. 点击"保存更改"
3. 刷新页面，验证选择已保存
4. 尝试切换回"自动选择"

---

#### B. 聊天功能（AI 对话 + 模型切换）

**访问**: http://localhost:3000/chat

**验收项**:
- [ ] 左侧显示对话列表
- [ ] 右上角显示当前 AI 模型（应该显示"智谱"）
- [ ] 可以点击"朋友"/"教练"/"倾听者"切换模式
- [ ] 可以发送消息
- [ ] AI 流式响应正常
- [ ] 右上角齿轮图标可跳转到设置

**测试步骤**:
1. 点击"开始新对话"或选择现有对话
2. 在输入框输入："你好"
3. 等待 AI 响应（应该使用智谱 AI）
4. 检查右上角显示的 AI 模型

---

#### C. 每日抽签功能

**访问**: http://localhost:3000/dashboard

**验收项**:
- [ ] 进入 Dashboard 时自动弹出抽签弹窗
- [ ] 可以选择4种类型（心灵成长/事业运势/人际关系/随机）
- [ ] 点击类型后显示抽签动画（3秒）
- [ ] 显示签文结果（标题/内容/解读）
- [ ] 可以点击"重新抽签"
- [ ] 可以点击"开始今天的对话"关闭弹窗
- [ ] 可以点击"跳过"跳过抽签
- [ ] 抽签后 Dashboard 显示今日签文卡片
- [ ] 今日签文卡片有"查看历史"链接

**测试步骤**:
1. 访问 http://localhost:3000/dashboard
2. 如果没有自动弹出，点击"每日签文"卡片
3. 选择"心灵成长"
4. 等待抽签动画完成
5. 查看签文内容
6. 点击"开始今天的对话"
7. 在聊天中输入消息，观察是否巧妙代入签文

**清除今日签文**（如需重新测试）:
```bash
cd /Users/sunsensen/vibeAIlife.com/vibeailife
npx tsx scripts/clear-today-fortune.ts
```

---

#### D. 签文历史页面

**访问**: http://localhost:3000/fortune

**验收项**:
- [ ] 显示签文历史列表
- [ ] 显示签文等级（上上签/上签/中签/下签）
- [ ] 显示签文标题、内容、解读
- [ ] 显示抽签日期
- [ ] 显示 AI 代入次数

---

#### E. Vibe 情绪追踪

**访问**: http://localhost:3000/vibe

**验收项**:
- [ ] 显示 7 日趋势概览
  - [ ] 平均心情/精力/Vibe得分
  - [ ] 7日趋势（向好/下降/稳定）
  - [ ] 趋势图表显示近7天数据
- [ ] 显示历史记录列表
- [ ] 每条记录显示心情/精力/标签/备注
- [ ] 显示 AI 分析反馈

**测试步骤**:
1. 访问 http://localhost:3000/vibe
2. 查看趋势数据
3. 查看历史记录

**在 Dashboard 记录 Vibe**:
1. 访问 http://localhost:3000/dashboard
2. 向下滚动找到"记录当下状态"卡片
3. 选择心情（1-5星）
4. 选择精力（1-5星）
5. 可选：选择标签
6. 可选：添加备注
7. 点击"保存记录"
8. 等待 AI 分析反馈

---

#### F. 目标管理

**访问**: http://localhost:3000/goals

**验收项**:
- [ ] 显示目标列表
- [ ] 点击"+ 新建目标"打开创建对话框
- [ ] 可以输入标题和描述
- [ ] 点击"创建"后目标出现在列表中
- [ ] 显示目标进度条（0-100%）
- [ ] 可以签到（每次+10%）
- [ ] 进度达到100%时可以标记为完成
- [ ] 可以删除目标

**测试步骤**:
1. 访问 http://localhost:3000/goals
2. 点击"+ 新建目标"
3. 输入标题："每天运动30分钟"
4. 输入描述（可选）
5. 点击"创建"
6. 点击"签到"按钮，观察进度增加
7. 连续签到直到进度达到100%
8. 点击"标记为完成"

---

#### G. 订阅页面

**访问**: http://localhost:3000/subscription

**验收项**:
- [ ] 显示三个计划卡片（免费版/Pro/企业版）
- [ ] 每个计划显示功能列表
- [ ] Pro 版标记为"推荐"
- [ ] 定价信息正确
- [ ] 显示常见问题（FAQ）
- [ ] 点击"选择此计划"跳转到 Stripe Checkout

**注意**:
- Stripe 功能需要配置 `STRIPE_SECRET_KEY` 环境变量
- 未配置时会显示"支付功能暂未配置"提示

---

#### H. Dashboard 主页

**访问**: http://localhost:3000/dashboard

**验收项**:
- [ ] 显示欢迎信息
- [ ] 右上角有设置齿轮图标
- [ ] 显示4个快速操作卡片
- [ ] 所有卡片链接正确
  - [ ] "开始对话" → `/chat`
  - [ ] "记录 Vibe" → 展开记录表单
  - [ ] "每日签文" → 打开抽签弹窗
  - [ ] "我的目标" → `/goals`
- [ ] 显示"为你推荐"卡片（如果有推荐）
- [ ] 显示今日签文卡片（如果已抽签）
- [ ] 页面样式美观，渐变背景正常

---

### 3. API 接口测试

#### 使用 curl 测试

```bash
# 1. 用户设置 API
curl http://localhost:3000/api/user/settings

# 2. 抽签 API
curl -X POST http://localhost:3000/api/fortune/draw \
  -H "Content-Type: application/json" \
  -d '{"type":"GROWTH"}'

# 3. 签文历史 API
curl http://localhost:3000/api/fortune/history

# 4. 今日签文状态 API
curl http://localhost:3000/api/fortune/today

# 5. Vibe 趋势 API
curl http://localhost:3000/api/vibe/trends

# 6. Vibe 记录 API
curl -X POST http://localhost:3000/api/vibe \
  -H "Content-Type: application/json" \
  -d '{"mood":4,"energy":3,"tags":["工作","学习"]}'

# 7. 目标列表 API
curl http://localhost:3000/api/goals

# 8. 推荐系统 API
curl http://localhost:3000/api/recommendations
```

---

## 🔧 开发工具命令

### 清除今日签文（重新测试）
```bash
cd /Users/sunsensen/vibeAIlife.com/vibeailife
npx tsx scripts/clear-today-fortune.ts
```

### 重新播种签文库
```bash
cd /Users/sunsensen/vibeAIlife.com/vibeailife
npx tsx scripts/seed-fortunes.ts
```

### 创建测试数据
```bash
cd /Users/sunsensen/vibeAIlife.com/vibeailife
npx tsx scripts/create-test-data.ts
```

### 数据库操作
```bash
# 查看数据库状态
npx prisma studio

# 推送 schema 变更
npx prisma db push

# 生成 Prisma Client
npx prisma generate
```

---

## 📱 移动端测试

### 响应式设计验证
- [ ] 在手机浏览器中打开应用
- [ ] 所有页面自适应正常
- [ ] 触摸操作流畅
- [ ] 字体大小合适

---

## 🐛 已知问题

### 次要环境变量
以下环境变量需要配置才能使用完整功能：

1. **Stripe 支付**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_PRO_MONTHLY`
   - `STRIPE_PRICE_PRO_YEARLY`

2. **OpenAI API**
   - `OPENAI_API_KEY`

3. **智谱 AI API**
   - `ZHIPU_API_KEY`（已配置）

### 配置文件
- `.env.local` - 本地开发环境变量
- `.env` - 生产环境变量

---

## 📊 性能基准

### API 响应时间
- GET /api/fortune/today: < 200ms
- POST /api/fortune/draw: < 500ms
- GET /api/vibe/trends: < 300ms
- POST /api/vibe: < 400ms

### 页面加载时间
- 首屏加载: < 2s
- 路由切换: < 500ms
- API 调用: < 1s

---

## 🎉 验收完成标准

### 必须通过（阻塞性问题）
- [ ] 所有页面可访问
- [ ] API 接口正常响应
- [ ] 数据库读写正常
- [ ] 无控制台错误

### 重要功能（核心体验）
- [ ] 聊天功能正常
- [ ] 抽签功能正常
- [ ] Vibe 记录功能正常
- [ ] 模型切换正常

### 可选功能（增强体验）
- [ ] 签文 AI 代入自然
- [ ] 推荐系统准确
- [ ] 目标管理完整
- [ ] UI 动画流畅

---

## 📞 问题反馈

验收过程中发现的问题请记录：

1. **问题描述**:
2. **复现步骤**:
3. **截图/日志**:
4. **严重程度**: [高/中/低]

---

**准备就绪！开始验收吧！** 🚀
