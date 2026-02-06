"use client"

import { useState, useEffect } from 'react'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type FortuneType = 'GROWTH' | 'CAREER' | 'RELATIONSHIP' | 'GENERAL'
type FortuneLevel = 'EXCELLENT' | 'GOOD' | 'MEDIUM' | 'CHALLENGING'

interface FortuneHistoryItem {
  id: string
  drawDate: string
  fortune: {
    id: string
    type: FortuneType
    level: FortuneLevel
    title: string
    text: string
    interpretation: string
  }
  appliedCount: number
}

export default function FortuneHistoryPage() {
  const [history, setHistory] = useState<FortuneHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/fortune/history?limit=30')
      const result = await response.json()

      if (result.success) {
        setHistory(result.data.history)
        setTotal(result.data.total)
      } else {
        toast.error('加载历史失败')
      }
    } catch (error) {
      console.error('Load history error:', error)
      toast.error('加载历史失败')
    } finally {
      setIsLoading(false)
    }
  }

  const getFortuneLevelLabel = (level: FortuneLevel) => {
    const labels = {
      EXCELLENT: '上上签',
      GOOD: '上签',
      MEDIUM: '中签',
      CHALLENGING: '下签',
    }
    return labels[level]
  }

  const getFortuneLevelColor = (level: FortuneLevel) => {
    const colors = {
      EXCELLENT: 'text-amber-600',
      GOOD: 'text-orange-500',
      MEDIUM: 'text-sage-600',
      CHALLENGING: 'text-gray-500',
    }
    return colors[level]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 animate-fade-in-up">
            <a
              href="/dashboard"
              className="text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </a>
            <div>
              <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>🔮 我的签文历史</h1>
              <p className="text-amber-700">共 {total} 支签文</p>
            </div>
          </div>

          {/* History List */}
          {isLoading ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="text-lg text-amber-700">✨ 加载中...</div>
            </div>
          ) : history.length === 0 ? (
            <Card className="p-8 text-center border-2 border-amber-200 rounded-3xl organic-shadow bg-white">
              <div className="text-6xl mb-4">🎋</div>
              <p className="text-amber-700 mb-4">
                还没有抽签记录，去抽一支吧！
              </p>
              <a
                href="/chat"
                className="inline-block px-6 py-3 bg-gradient-to-r from-coral-400 to-orange-400 text-white rounded-2xl font-semibold hover:bounce-hover transition-all organic-shadow-lg"
              >
                开始对话 ✨
              </a>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <Card
                  key={item.id}
                  className="p-6 border-2 border-amber-200 rounded-3xl organic-shadow hover:organic-shadow-lg transition-all bg-white animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className={`text-sm font-bold ${getFortuneLevelColor(item.fortune.level)}`}>
                        {getFortuneLevelLabel(item.fortune.level)}
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        {formatDate(item.drawDate)}
                      </div>
                    </div>
                    {item.appliedCount > 0 && (
                      <div className="text-xs px-3 py-1 bg-sage-100 text-sage-700 rounded-full">
                        🤖 AI 代入 {item.appliedCount} 次
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold mb-2 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>{item.fortune.title}</h3>
                  <blockquote className="text-sm text-amber-700 mb-3 p-4 bg-amber-50 rounded-2xl border-l-4 border-amber-400">
                    "{item.fortune.text}"
                  </blockquote>
                  <p className="text-sm text-gray-700">{item.fortune.interpretation}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
