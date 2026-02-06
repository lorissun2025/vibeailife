"use client"

import { useState, useEffect } from 'react'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'
import { VibeTracker } from '@/components/vibe/vibe-tracker'
import { toast } from 'sonner'

interface VibeRecord {
  id: string
  mood: number
  energy: number
  tags: string[]
  note: string | null
  aiResponse: string | null
  createdAt: string
}

interface VibeTrend {
  averageMood: number
  averageEnergy: number
  averageScore: number
  trend: 'improving' | 'declining' | 'stable'
  dailyAverages: Array<{
    date: string
    mood: number
    energy: number
    score: number
  }>
}

export default function VibeHistoryPage() {
  const [records, setRecords] = useState<VibeRecord[]>([])
  const [trends, setTrends] = useState<VibeTrend | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTracker, setShowTracker] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const handleRecordCreated = () => {
    loadData()
    setShowTracker(false)
  }

  const loadData = async () => {
    try {
      const [recordsRes, trendsRes] = await Promise.all([
        fetch('/api/vibe?limit=30'),
        fetch('/api/vibe/trends?days=7'),
      ])

      const recordsData = await recordsRes.json()
      const trendsData = await trendsRes.json()

      if (recordsData.success) {
        setRecords(recordsData.data.records)
      }

      if (trendsData.success) {
        setTrends(trendsData.data)
      }
    } catch (error) {
      console.error('Load data error:', error)
      toast.error('加载数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const getMoodEmoji = (mood: number) => {
    const emojis = ['', '😢', '😕', '😐', '🙂', '😄']
    return emojis[mood] || '😐'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving': return '趋势向好'
      case 'declining': return '需要注意'
      default: return '保持稳定'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-sage-600'
      case 'declining': return 'text-coral-600'
      default: return 'text-amber-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-amber-700 hover:text-amber-900 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </a>
              <div>
                <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>✨ Vibe 记录</h1>
                <p className="text-amber-700">追踪你的情绪变化</p>
              </div>
            </div>
            <button
              onClick={() => setShowTracker(!showTracker)}
              className="px-6 py-3 bg-gradient-to-r from-coral-400 to-orange-400 text-white rounded-2xl font-semibold hover:bounce-hover transition-all organic-shadow-lg"
            >
              {showTracker ? '查看历史' : '+ 新建记录'}
            </button>
          </div>

          {/* Vibe Tracker - 显示在顶部或根据showTracker状态 */}
          {showTracker && (
            <div className="animate-fade-in-up">
              <VibeTracker onRecordCreated={handleRecordCreated} />
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="text-lg text-amber-700">🌈 加载中...</div>
            </div>
          ) : (
            <>
              {/* 趋势概览 */}
              {trends && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up">
                  <Card className="p-4 border-2 border-amber-200 rounded-2xl organic-shadow bg-gradient-to-br from-amber-50 to-orange-50 hover:bounce-hover transition-all">
                    <div className="text-sm text-amber-700 mb-1">😊 平均心情</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>{trends.averageMood}/5</div>
                  </Card>
                  <Card className="p-4 border-2 border-amber-200 rounded-2xl organic-shadow bg-gradient-to-br from-sage-50 to-emerald-50 hover:bounce-hover transition-all">
                    <div className="text-sm text-sage-700 mb-1">⚡ 平均精力</div>
                    <div className="text-2xl font-bold text-sage-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>{trends.averageEnergy}/5</div>
                  </Card>
                  <Card className="p-4 border-2 border-amber-200 rounded-2xl organic-shadow bg-gradient-to-br from-rose-50 to-pink-50 hover:bounce-hover transition-all">
                    <div className="text-sm text-rose-700 mb-1">💫 Vibe 得分</div>
                    <div className="text-2xl font-bold text-rose-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>{trends.averageScore}/5</div>
                  </Card>
                  <Card className="p-4 border-2 border-amber-200 rounded-2xl organic-shadow bg-gradient-to-br from-coral-50 to-orange-50 hover:bounce-hover transition-all">
                    <div className="text-sm text-coral-700 mb-1">📊 7日趋势</div>
                    <div className={`text-2xl font-bold ${getTrendColor(trends.trend)}`} style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      {getTrendIcon(trends.trend)} {getTrendLabel(trends.trend)}
                    </div>
                  </Card>
                </div>
              )}

              {/* 趋势图表 */}
              {trends && trends.dailyAverages.length > 0 && (
                <Card className="p-6 border-2 border-amber-200 rounded-3xl organic-shadow bg-white animate-fade-in-up">
                  <h3 className="font-semibold mb-4 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>📈 近7天趋势</h3>
                  <div className="h-48 flex items-end gap-2">
                    {trends.dailyAverages.map((day, index) => {
                      const height = (day.score / 5) * 100
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-amber-50 rounded-2xl relative border-2 border-amber-100" style={{ height: '160px' }}>
                            <div
                              className="absolute bottom-0 w-full bg-gradient-to-t from-orange-400 to-amber-300 rounded-2xl transition-all hover:bounce-hover"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <div className="text-xs text-amber-700 font-medium">
                            {formatDate(day.date)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}

              {/* 记录列表 */}
              <div className="space-y-4">
                {records.length === 0 ? (
                  <Card className="p-8 text-center border-2 border-amber-200 rounded-3xl organic-shadow bg-white">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-amber-700 mb-4">
                      还没有记录，开始追踪你的 Vibe 吧
                    </p>
                    <a
                      href="/dashboard"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-coral-400 to-orange-400 text-white rounded-2xl font-semibold hover:bounce-hover transition-all organic-shadow-lg"
                    >
                      去记录 ✨
                    </a>
                  </Card>
                ) : (
                  records.map((record, index) => (
                    <Card
                      key={record.id}
                      className="p-6 border-2 border-amber-200 rounded-3xl organic-shadow hover:organic-shadow-lg transition-all bg-white animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getMoodEmoji(record.mood)}</span>
                          <div>
                            <div className="text-sm text-amber-700 font-medium">
                              {new Date(record.createdAt).toLocaleString('zh-CN', {
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="text-xs text-amber-600 mt-1">
                              心情 {record.mood}/5 • 精力 {record.energy}/5
                            </div>
                          </div>
                        </div>
                      </div>

                      {record.note && (
                        <p className="text-sm mb-3 text-gray-700 p-3 bg-amber-50 rounded-2xl">{record.note}</p>
                      )}

                      {record.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {record.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-gradient-to-r from-sage-100 to-emerald-100 text-sage-700 text-sm rounded-full border border-sage-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {record.aiResponse && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                          <p className="text-sm text-gray-700">💭 {record.aiResponse}</p>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
