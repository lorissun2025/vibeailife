"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'

interface Goal {
  id: string
  title: string
  description: string | null
  status: GoalStatus
  progress: number
  deadline: string | null
  createdAt: string
}

interface Checkin {
  id: string
  note: string | null
  createdAt: string
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string

  const [goal, setGoal] = useState<Goal | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGoal()
    loadCheckins()
  }, [goalId])

  const loadGoal = async () => {
    try {
      const response = await fetch(`/api/goals/${goalId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setGoal(result.data)
        }
      }
    } catch (error) {
      console.error('Load goal error:', error)
    }
  }

  const loadCheckins = async () => {
    try {
      const response = await fetch(`/api/goals/${goalId}/checkins`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCheckins(result.data)
        }
      }
    } catch (error) {
      console.error('Load checkins error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckin = async () => {
    try {
      const response = await fetch(`/api/goals/${goalId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('签到成功！进度 +10%')
        loadGoal()
        loadCheckins()
      } else {
        toast.error(result.error?.message || '签到失败')
      }
    } catch (error) {
      console.error('Checkin error:', error)
      toast.error('签到失败')
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个目标吗？')) return

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('目标已删除')
        router.push('/goals')
      }
    } catch (error) {
      console.error('Delete goal error:', error)
      toast.error('删除失败')
    }
  }

  const getStatusLabel = (status: GoalStatus) => {
    const labels = {
      ACTIVE: '进行中',
      COMPLETED: '已完成',
      PAUSED: '已暂停',
      CANCELLED: '已取消',
    }
    return labels[status]
  }

  const getStatusColor = (status: GoalStatus) => {
    const colors = {
      ACTIVE: 'bg-blue-100 text-blue-700 border-blue-200',
      COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      PAUSED: 'bg-amber-100 text-amber-700 border-amber-200',
      CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  }

  // 生成日历数据
  const generateCalendarDays = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay() // 0 = Sunday
    const totalDays = lastDay.getDate()

    const days: Array<{ date: Date | null; hasCheckin: boolean }> = []

    // 填充月初空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, hasCheckin: false })
    }

    // 填充日期
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const hasCheckin = checkins.some(c => c.createdAt.startsWith(dateStr))
      days.push({ date, hasCheckin })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  // 计算统计数据
  const totalDaysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate()

  const today = new Date()
  const currentDay = today.getDate()
  const daysPassed = currentDay

  const checkinDays = checkins.filter(c => {
    const checkinDate = new Date(c.createdAt)
    return (
      checkinDate.getMonth() === today.getMonth() &&
      checkinDate.getFullYear() === today.getFullYear()
    )
  }).length

  const checkinRate = daysPassed > 0 ? Math.round((checkinDays / daysPassed) * 100) : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center">
        <div className="text-lg text-amber-700">🎯 加载中...</div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center">
        <Card className="p-8 text-center border-2 border-amber-200 rounded-3xl organic-shadow bg-white">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-amber-900 mb-2">目标不存在</h2>
          <Button
            onClick={() => router.push('/goals')}
            className="mt-4 bg-gradient-to-r from-coral-400 to-orange-400 text-white rounded-2xl"
          >
            返回目标列表
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 animate-fade-in-up">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/goals')}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-2xl"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {goal.title}
              </h1>
              <p className="text-sm text-amber-700">目标详情</p>
            </div>
            {goal.status === 'ACTIVE' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-2xl"
              >
                🗑️ 删除
              </Button>
            )}
          </div>

          {/* 目标信息卡片 */}
          <Card className="p-6 border-2 border-amber-200 rounded-3xl organic-shadow bg-white animate-fade-in-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    {goal.title}
                  </h2>
                  <span className={`text-xs px-3 py-1 rounded-full border-2 ${getStatusColor(goal.status)}`}>
                    {getStatusLabel(goal.status)}
                  </span>
                </div>
                {goal.description && (
                  <p className="text-sm text-amber-700 p-3 bg-amber-50 rounded-2xl">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>

            {/* 进度条 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-amber-700 font-medium">📊 进度</span>
                <span className="text-amber-900 font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  {goal.progress}%
                </span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-4 border-2 border-amber-200">
                <div
                  className={`rounded-full h-4 transition-all ${
                    goal.progress >= 100
                      ? 'bg-gradient-to-r from-emerald-400 to-sage-400'
                      : 'bg-gradient-to-r from-sage-400 to-emerald-400'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-2xl">
                <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  {checkinDays}
                </div>
                <div className="text-xs text-blue-500">本月签到</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-2xl">
                <div className="text-2xl font-bold text-emerald-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  {checkinRate}%
                </div>
                <div className="text-xs text-emerald-500">签到率</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-2xl">
                <div className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  {checkins.length}
                </div>
                <div className="text-xs text-amber-500">总签到</div>
              </div>
            </div>

            {/* 签到按钮 */}
            {goal.status === 'ACTIVE' && (
              <Button
                onClick={handleCheckin}
                className="w-full bg-gradient-to-r from-coral-400 to-orange-400 hover:bounce-hover organic-shadow-lg text-white rounded-2xl"
                disabled={goal.progress >= 100}
              >
                {goal.progress >= 100 ? '✅ 已完成' : '✨ 签到 (+10%)'}
              </Button>
            )}
          </Card>

          {/* 日历视图 */}
          <Card className="p-6 border-2 border-amber-200 rounded-3xl organic-shadow bg-white animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-4 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              📅 本月签到日历
            </h3>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                <div key={index} className="text-center text-xs text-amber-600 font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历格子 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isToday = day.date &&
                  day.date.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm ${
                      !day.date
                        ? 'bg-transparent'
                        : day.hasCheckin
                        ? 'bg-gradient-to-br from-emerald-400 to-sage-400 text-white font-semibold'
                        : isToday
                        ? 'bg-amber-200 text-amber-800 font-semibold border-2 border-amber-400'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {day.date ? day.date.getDate() : ''}
                  </div>
                )
              })}
            </div>

            {/* 图例 */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-amber-600">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-sage-400"></div>
                <span>已签到</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-amber-200 border-2 border-amber-400"></div>
                <span>今天</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-gray-50"></div>
                <span>未签到</span>
              </div>
            </div>
          </Card>

          {/* 签到历史 */}
          <Card className="p-6 border-2 border-amber-200 rounded-3xl organic-shadow bg-white animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-4 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              📝 签到历史
            </h3>

            {checkins.length === 0 ? (
              <div className="text-center py-8 text-amber-600">
                <div className="text-4xl mb-2">📝</div>
                <p>还没有签到记录</p>
                <p className="text-sm">点击上方按钮开始签到吧</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {checkins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="flex items-start gap-3 p-3 bg-amber-50 rounded-2xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-sage-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-amber-900">
                        {checkin.note || '签到成功'}
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        {formatDate(checkin.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
