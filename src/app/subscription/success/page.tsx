"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@/components/ui/icons'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      router.push('/subscription')
      return
    }

    // 验证支付状态
    verifyPayment(sessionId)
  }, [searchParams, router])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/subscription/verify-session?session_id=${sessionId}`)
      const result = await response.json()

      if (result.success) {
        setSessionInfo(result.data)
      }
    } catch (error) {
      console.error('Verify payment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sage-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-emerald-700">正在确认支付状态...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sage-50 to-teal-50">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <Card className="p-12 text-center border-2 border-emerald-200 rounded-3xl organic-shadow-lg bg-white animate-fade-in-up">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold mb-4 text-emerald-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              支付成功！
            </h1>
            <p className="text-lg text-emerald-700 mb-8">
              恭喜你成功升级到 Pro 版本，现在可以享受所有高级功能了！
            </p>

            {/* Features Summary */}
            <div className="bg-emerald-50 rounded-2xl p-6 mb-8 text-left">
              <h2 className="text-lg font-bold mb-4 text-emerald-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                ✨ 已解锁功能
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-emerald-700">
                  <span className="text-emerald-500">✓</span>
                  <span>无限聊天消息</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-700">
                  <span className="text-emerald-500">✓</span>
                  <span>无限 Vibe 记录</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-700">
                  <span className="text-emerald-500">✓</span>
                  <span>高级 AI 模型（GPT-4/GLM-4）</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-700">
                  <span className="text-emerald-500">✓</span>
                  <span>每日签文 + AI 智能代入</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-700">
                  <span className="text-emerald-500">✓</span>
                  <span>Vibe 趋势分析图表</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-700">
                  <span className="text-emerald-500">✓</span>
                  <span>目标管理功能</span>
                </li>
              </ul>
            </div>

            {/* Order Info */}
            {sessionInfo && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-sm text-gray-600">
                <p>订单号: {sessionInfo.sessionId}</p>
                <p>支付时间: {new Date(sessionInfo.created * 1000).toLocaleString('zh-CN')}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-emerald-400 to-sage-400 hover:bounce-hover organic-shadow text-white rounded-2xl"
              >
                开始使用 ✨
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/settings')}
                className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-2xl"
              >
                查看订阅
              </Button>
            </div>
          </Card>

          {/* Support Info */}
          <Card className="mt-6 p-6 border-2 border-amber-200 rounded-2xl organic-shadow bg-white">
            <p className="text-sm text-amber-700 text-center">
              💡 如有任何问题，请联系客服：
              <a href="mailto:support@vibetailife.com" className="underline ml-1">
                support@vibetailife.com
              </a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
