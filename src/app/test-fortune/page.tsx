"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function TestFortunePage() {
  const [loading, setLoading] = useState(false)

  const clearFortune = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/fortune/clear', {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('✅ 今日抽签记录已清除！')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      } else {
        toast.error('清除失败: ' + result.error)
      }
    } catch (error) {
      console.error('Clear fortune error:', error)
      toast.error('清除失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const skipFortune = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/fortune/skip', {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('✅ 已标记为跳过')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      } else {
        toast.error('操作失败: ' + result.error)
      }
    } catch (error) {
      console.error('Skip fortune error:', error)
      toast.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[30px] p-8 organic-shadow border-2 border-border">
          <h1 className="text-2xl font-quicksand font-bold mb-6 text-center">
            🎴 抽签功能测试
          </h1>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
              <h3 className="font-bold mb-2">📋 测试说明</h3>
              <p className="text-sm text-muted-foreground">
                使用下方按钮清除今日抽签记录，然后返回首页测试以下功能：
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>1. 自动弹窗是否出现？</li>
                <li>2. 抽签动画是否流畅？</li>
                <li>3. AI 是否在对话中代入签文？</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
              <h3 className="font-bold mb-2">⚠️ 注意事项</h3>
              <p className="text-sm text-muted-foreground">
                • 清除记录后，刷新首页即可重新触发抽签<br />
                • 此功能仅用于测试，生产环境应移除
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={clearFortune}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-quicksand font-bold rounded-2xl organic-shadow hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : '🗑️ 清除今日抽签记录'}
            </button>

            <button
              onClick={skipFortune}
              disabled={loading}
              className="w-full px-6 py-4 bg-white border-2 border-border text-foreground font-quicksand font-bold rounded-2xl hover:bg-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : '⏭️ 标记为已跳过'}
            </button>

            <a
              href="/dashboard"
              className="block w-full px-6 py-4 bg-gradient-to-br from-secondary to-secondary-light text-white font-quicksand font-bold rounded-2xl organic-shadow hover:scale-105 transition-all text-center"
            >
              🏠 返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
