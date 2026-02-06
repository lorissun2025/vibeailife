"use client"

import { useState, useEffect } from 'react'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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

interface GoalFormData {
  title: string
  description: string
  deadline: string
}

type DialogMode = 'create' | 'edit' | null

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState<GoalFormData>({ title: '', description: '', deadline: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 状态筛选
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'ALL'>('ALL')

  useEffect(() => {
    loadGoals()
  }, [statusFilter])

  const loadGoals = async () => {
    try {
      const url = statusFilter === 'ALL'
        ? '/api/goals'
        : `/api/goals?status=${statusFilter}`

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setGoals(result.data)
      }
    } catch (error) {
      console.error('Load goals error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateDialog = () => {
    setDialogMode('create')
    setFormData({ title: '', description: '', deadline: '' })
  }

  const openEditDialog = (goal: Goal) => {
    setDialogMode('edit')
    setSelectedGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
    })
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedGoal(null)
    setFormData({ title: '', description: '', deadline: '' })
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入目标标题')
      return
    }

    setIsSubmitting(true)

    try {
      const url = dialogMode === 'create'
        ? '/api/goals'
        : `/api/goals/${selectedGoal!.id}`

      const response = await fetch(url, {
        method: dialogMode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(dialogMode === 'create' ? '目标创建成功' : '目标已更新')
        closeDialog()
        loadGoals()
      } else {
        toast.error(result.error?.message || '操作失败')
      }
    } catch (error) {
      console.error('Submit goal error:', error)
      toast.error('操作失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckin = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('签到成功！进度 +10%')
        loadGoals()
      } else {
        toast.error(result.error?.message || '签到失败')
      }
    } catch (error) {
      console.error('Checkin error:', error)
      toast.error('签到失败')
    }
  }

  const handleTogglePause = async (goal: Goal) => {
    const newStatus = goal.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    const action = newStatus === 'PAUSED' ? '暂停' : '恢复'

    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`目标已${action}`)
        loadGoals()
      }
    } catch (error) {
      console.error('Toggle pause error:', error)
      toast.error(`${action}失败`)
    }
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm('确定要删除这个目标吗？')) return

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('目标已删除')
        loadGoals()
      }
    } catch (error) {
      console.error('Delete goal error:', error)
      toast.error('删除失败')
    }
  }

  const handleMarkComplete = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      if (response.ok) {
        loadGoals()
        toast.success('恭喜完成目标！🎉')
      }
    } catch (error) {
      console.error('Mark complete error:', error)
      toast.error('操作失败')
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '无截止日期'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const activeGoals = goals.filter(g => g.status === 'ACTIVE')
  const completedGoals = goals.filter(g => g.status === 'COMPLETED')
  const pausedGoals = goals.filter(g => g.status === 'PAUSED')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-amber-700 hover:text-amber-900 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </a>
              <div>
                <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>🎯 我的目标</h1>
                <p className="text-amber-700">追踪进度，实现目标</p>
              </div>
            </div>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-coral-400 to-orange-400 hover:bounce-hover organic-shadow-lg text-white rounded-2xl"
            >
              + 新建目标
            </Button>
          </div>

          {/* 统计卡片 */}
          {goals.length > 0 && (
            <div className="grid grid-cols-3 gap-4 animate-fade-in-up">
              <Card className="p-4 text-center border-2 border-blue-200 rounded-2xl organic-shadow bg-white">
                <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>{activeGoals.length}</div>
                <div className="text-sm text-blue-500">进行中</div>
              </Card>
              <Card className="p-4 text-center border-2 border-emerald-200 rounded-2xl organic-shadow bg-white">
                <div className="text-2xl font-bold text-emerald-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>{completedGoals.length}</div>
                <div className="text-sm text-emerald-500">已完成</div>
              </Card>
              <Card className="p-4 text-center border-2 border-amber-200 rounded-2xl organic-shadow bg-white">
                <div className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Quicksand, sans-serif' }}>{pausedGoals.length}</div>
                <div className="text-sm text-amber-500">已暂停</div>
              </Card>
            </div>
          )}

          {/* 状态筛选 */}
          <div className="flex gap-2 animate-fade-in-up">
            <Button
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
              className={statusFilter === 'ALL' ? 'bg-amber-500 text-white rounded-2xl' : 'rounded-2xl'}
            >
              全部 ({goals.length})
            </Button>
            <Button
              variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ACTIVE')}
              className={statusFilter === 'ACTIVE' ? 'bg-blue-500 text-white rounded-2xl' : 'rounded-2xl'}
            >
              进行中 ({activeGoals.length})
            </Button>
            <Button
              variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('COMPLETED')}
              className={statusFilter === 'COMPLETED' ? 'bg-emerald-500 text-white rounded-2xl' : 'rounded-2xl'}
            >
              已完成 ({completedGoals.length})
            </Button>
            <Button
              variant={statusFilter === 'PAUSED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('PAUSED')}
              className={statusFilter === 'PAUSED' ? 'bg-amber-500 text-white rounded-2xl' : 'rounded-2xl'}
            >
              已暂停 ({pausedGoals.length})
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="text-lg text-amber-700">🎯 加载中...</div>
            </div>
          ) : goals.length === 0 ? (
            <Card className="p-12 text-center border-2 border-amber-200 rounded-3xl organic-shadow bg-white">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>还没有目标</h3>
              <p className="text-amber-700 mb-6">
                创建你的第一个目标，开始追踪进度吧
              </p>
              <Button
                onClick={openCreateDialog}
                className="bg-gradient-to-r from-coral-400 to-orange-400 hover:bounce-hover organic-shadow-lg text-white rounded-2xl"
              >
                创建目标 ✨
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal, index) => {
                const daysRemaining = getDaysRemaining(goal.deadline)
                const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0

                return (
                  <Card
                    key={goal.id}
                    className="p-6 border-2 border-amber-200 rounded-3xl organic-shadow hover:organic-shadow-lg transition-all bg-white animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className="font-semibold text-lg text-amber-900 cursor-pointer hover:underline"
                            style={{ fontFamily: 'Quicksand, sans-serif' }}
                            onClick={() => router.push(`/goals/${goal.id}`)}
                          >
                            {goal.title}
                          </h3>
                          <span className={`text-xs px-3 py-1 rounded-full border-2 ${getStatusColor(goal.status)}`}>
                            {getStatusLabel(goal.status)}
                          </span>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-amber-700 mb-2 p-3 bg-amber-50 rounded-2xl">
                            {goal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-amber-600">
                          <span>📅 截止: {formatDate(goal.deadline)}</span>
                          {daysRemaining !== null && (
                            <span className={isUrgent ? 'text-red-500 font-semibold' : ''}>
                              {daysRemaining < 0 ? '已逾期' : daysRemaining === 0 ? '今天截止' : `剩余 ${daysRemaining} 天`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2">
                        {goal.status === 'ACTIVE' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(goal)}
                              className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl"
                              title="编辑"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePause(goal)}
                              className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl"
                              title="暂停"
                            >
                              ⏸️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(goal.id)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50 rounded-xl"
                              title="删除"
                            >
                              🗑️
                            </Button>
                          </>
                        )}
                        {goal.status === 'PAUSED' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(goal)}
                              className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl"
                              title="编辑"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePause(goal)}
                              className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl"
                              title="恢复"
                            >
                              ▶️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(goal.id)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50 rounded-xl"
                              title="删除"
                            >
                              🗑️
                            </Button>
                          </>
                        )}
                        {goal.status === 'COMPLETED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/goals/${goal.id}`)}
                            className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-xl"
                            title="查看详情"
                          >
                            👁️
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-amber-700 font-medium">📊 进度</span>
                        <span className="text-amber-900 font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-amber-100 rounded-full h-3 border-2 border-amber-200">
                        <div
                          className={`rounded-full h-3 transition-all hover:bounce-hover ${
                            goal.progress >= 100
                              ? 'bg-gradient-to-r from-emerald-400 to-sage-400'
                              : 'bg-gradient-to-r from-sage-400 to-emerald-400'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      {goal.status === 'ACTIVE' && (
                        <>
                          <Button
                            onClick={() => handleCheckin(goal.id)}
                            className="flex-1 bg-gradient-to-r from-coral-400 to-orange-400 hover:bounce-hover organic-shadow-lg text-white rounded-2xl"
                            disabled={goal.progress >= 100}
                          >
                            {goal.progress >= 100 ? '✅ 已完成' : '✨ 签到 (+10%)'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/goals/${goal.id}`)}
                            className="px-4 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-2xl"
                          >
                            详情
                          </Button>
                        </>
                      )}

                      {goal.progress >= 100 && goal.status !== 'COMPLETED' && (
                        <Button
                          variant="outline"
                          className="flex-1 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-2xl"
                          onClick={() => handleMarkComplete(goal.id)}
                        >
                          🎉 标记为完成
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        {dialogMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-white p-6 border-2 border-amber-200 rounded-3xl organic-shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-amber-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {dialogMode === 'create' ? '✨ 创建新目标' : '✏️ 编辑目标'}
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-amber-700 font-medium">目标标题 *</Label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full mt-1 p-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                    placeholder="例如：每天运动30分钟"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-amber-700 font-medium">描述（可选）</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1 p-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                    placeholder="描述你的目标..."
                    rows={3}
                    maxLength={500}
                  />
                </div>
                <div>
                  <Label htmlFor="deadline" className="text-amber-700 font-medium">截止日期（可选）</Label>
                  <input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full mt-1 p-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={closeDialog}
                    disabled={isSubmitting}
                    className="border-2 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-2xl"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.title.trim()}
                    className="bg-gradient-to-r from-coral-400 to-orange-400 hover:bounce-hover organic-shadow text-white rounded-2xl"
                  >
                    {isSubmitting ? '保存中...' : dialogMode === 'create' ? '创建 ✨' : '保存'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
