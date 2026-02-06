"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { toast } from 'sonner'

type Plan = 'PRO' | 'ENTERPRISE'

interface PricingCardProps {
  name: string
  price: string
  period: string
  features: string[]
  popular?: boolean
  plan: Plan
  onSelect: (plan: Plan) => void
  isLoading: boolean
}

function PricingCard({ name, price, period, features, popular, plan, onSelect, isLoading }: PricingCardProps) {
  return (
    <Card className={`p-6 relative border-2 rounded-3xl organic-shadow hover:organic-shadow-lg transition-all bg-white ${popular ? 'border-coral-400' : 'border-amber-200'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-coral-400 to-orange-400 text-white text-xs font-bold px-4 py-1.5 rounded-full border-2 border-white organic-shadow">
            ⭐ 推荐
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>{name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>{price}</span>
          <span className="text-amber-600">/{period}</span>
        </div>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-sage-500 mt-0.5 font-bold">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={() => onSelect(plan)}
        disabled={isLoading}
        className={`w-full rounded-2xl ${popular ? 'bg-gradient-to-r from-coral-400 to-orange-400 hover:bounce-hover organic-shadow text-white' : 'border-2 border-amber-300 text-amber-700 hover:bg-amber-50'}`}
        variant={popular ? 'default' : 'outline'}
      >
        {isLoading ? '⏳ 处理中...' : '选择此计划 ✨'}
      </Button>
    </Card>
  )
}

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectPlan = async (plan: Plan) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const result = await response.json()

      if (result.success && result.data.checkoutUrl) {
        // 跳转到 Stripe Checkout
        window.location.href = result.data.checkoutUrl
      } else {
        toast.error(result.error?.message || '创建支付会话失败')
      }
    } catch (error) {
      console.error('Select plan error:', error)
      toast.error('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
            <a
              href="/settings"
              className="text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </a>
            <div>
              <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>⭐ 升级到 Pro</h1>
              <p className="text-amber-700">解锁无限可能</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className="p-6 border-2 border-amber-200 rounded-3xl organic-shadow bg-white animate-fade-in-up">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>免费版</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>¥0</span>
                  <span className="text-amber-600">/永久</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5 font-bold">✓</span>
                  <span>每日 10 条聊天消息</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5 font-bold">✓</span>
                  <span>每日 5 次 Vibe 记录</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5 font-bold">✓</span>
                  <span>基础 AI 模型</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5 font-bold">✓</span>
                  <span>每日签文功能</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-2 border-amber-300 text-amber-700 rounded-2xl" disabled>
                当前计划
              </Button>
            </Card>

            {/* Pro Plan */}
            <PricingCard
              name="Pro 版"
              price="¥29"
              period="月"
              popular
              plan="PRO"
              onSelect={handleSelectPlan}
              isLoading={isLoading}
              features={[
                '无限聊天消息',
                '无限 Vibe 记录',
                '高级 AI 模型（GPT-4/GLM-4）',
                '每日签文 + AI 智能代入',
                'Vibe 趋势分析图表',
                '目标管理功能',
                '优先技术支持',
              ]}
            />

            {/* Enterprise Plan */}
            <PricingCard
              name="企业版"
              price="¥99"
              period="月"
              plan="ENTERPRISE"
              onSelect={handleSelectPlan}
              isLoading={isLoading}
              features={[
                '包含 Pro 版所有功能',
                '最顶级 AI 模型（GPT-4 Plus/GLM-4 Plus）',
                '团队协作功能',
                '自定义 AI 人格',
                'API 访问权限',
                '专属客户经理',
                'SLA 保证',
              ]}
            />
          </div>

          {/* FAQ */}
          <Card className="p-6 mt-8 border-2 border-amber-200 rounded-3xl organic-shadow bg-white animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>💡 常见问题</h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl">
                <h3 className="font-medium mb-1 text-amber-900">可以随时取消吗？</h3>
                <p className="text-sm text-amber-700">
                  可以，你可以随时取消订阅，取消后仍可使用到当前计费周期结束。
                </p>
              </div>
              <div className="p-4 bg-sage-50 rounded-2xl">
                <h3 className="font-medium mb-1 text-sage-900">支持哪些支付方式？</h3>
                <p className="text-sm text-sage-700">
                  我们支持支付宝、微信支付和信用卡支付。
                </p>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl">
                <h3 className="font-medium mb-1 text-rose-900">升级后立即生效吗？</h3>
                <p className="text-sm text-rose-700">
                  是的，支付成功后所有 Pro 功能立即可用。
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
