"use client"

import { useState, useEffect } from "react"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import { FortuneDrawModal } from "@/components/fortune/fortune-draw-modal"
import { VibeReportCards } from "@/components/dashboard/vibe-report-cards"
import { GoalProgressCards } from "@/components/dashboard/goal-progress-cards"
import { DesktopBottomBar } from "@/components/layout/desktop-bottom-bar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, MessageSquare, Target, TrendingUp, Calendar, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  priority: string
}

interface UsageLimit {
  messageCount: number
  vibeCount: number
  maxMessages: number
  maxVibes: number
}

export default function DashboardPage() {
  const router = useRouter()
  const session = {
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      tier: 'FREE',
      hasOnboarded: true,
      region: 'international',
    }
  }

  const [showFortuneModal, setShowFortuneModal] = useState(false)
  const [hasDrawnToday, setHasDrawnToday] = useState(false)
  const [todayFortune, setTodayFortune] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [showVibeRecordModal, setShowVibeRecordModal] = useState(false)
  const [hasRecordedToday, setHasRecordedToday] = useState(false)
  const [usageLimit, setUsageLimit] = useState<UsageLimit | null>(null)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    checkTodayFortune()
    checkTodayVibeRecord()
    loadRecommendations()
    loadUsageLimit()
    updateGreeting()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoadingRecommendations(true)
      const response = await fetch('/api/recommendations')
      const result = await response.json()
      if (result.success) {
        setRecommendations(result.data)
      }
    } catch (error) {
      console.error('Load recommendations error:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const checkTodayFortune = async () => {
    try {
      const response = await fetch('/api/fortune/today')
      const result = await response.json()

      if (result.success) {
        setHasDrawnToday(result.data.hasDrawn)
        setTodayFortune(result.data.fortune)

        // 如果今天还没抽签且没跳过，显示抽签弹窗
        if (!result.data.hasDrawn && !result.data.skipped) {
          setTimeout(() => {
            setShowFortuneModal(true)
          }, 500)
        }
      }
    } catch (error) {
      console.error('Check today fortune error:', error)
    }
  }

  const checkTodayVibeRecord = async () => {
    try {
      const response = await fetch('/api/vibe/today')
      const result = await response.json()
      if (result.success) {
        setHasRecordedToday(!!result.data)
      }
    } catch (error) {
      console.error('Check today vibe record error:', error)
    }
  }

  const handleFortuneDrawn = (fortune: any) => {
    setTodayFortune(fortune)
    setHasDrawnToday(true)
  }

  const handleVibeRecorded = () => {
    setHasRecordedToday(true)
    setShowVibeRecordModal(false)
    loadRecommendations()
    loadUsageLimit()
  }

  const loadUsageLimit = async () => {
    try {
      const response = await fetch('/api/user/usage-limit')
      const result = await response.json()
      if (result.success) {
        setUsageLimit(result.data)
      }
    } catch (error) {
      console.error('Load usage limit error:', error)
      // Mock data for FREE tier
      setUsageLimit({
        messageCount: 3,
        vibeCount: 2,
        maxMessages: 10,
        maxVibes: 5,
      })
    }
  }

  const updateGreeting = () => {
    const hour = new Date().getHours()
    let timeGreeting = '早上好'
    if (hour >= 12 && hour < 18) timeGreeting = '下午好'
    else if (hour >= 18) timeGreeting = '晚上好'

    const greetings = [
      `${timeGreeting}！今天感觉怎么样？✨`,
      `新的一天，准备好迎接挑战了吗？💪`,
      `${timeGreeting}！又是充满可能的一天！🌟`,
    ]
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)])
  }

  // Show onboarding modal if not completed
  if (!session.user.hasOnboarded) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-quicksand font-bold mb-4">欢迎回来, {session.user.name}!</h1>
          <OnboardingModal />
        </div>
      </div>
    )
  }

  const getRecommendationIcon = (type: string) => {
    const icons: Record<string, string> = {
      'vibe_tip': '🌱',
      'goal_suggestion': '🎯',
      'wellness_activity': '💝',
      'mindfulness_practice': '💭',
    }
    return icons[type] || '💡'
  }

  const quickActions = [
    {
      title: "开始对话",
      description: "和 AI 聊聊",
      icon: <MessageSquare className="w-6 h-6" />,
      href: "/chat",
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "记录 Vibe",
      description: hasRecordedToday ? "今日已记录" : "追踪状态",
      icon: <TrendingUp className="w-6 h-6" />,
      href: "/vibe",
      color: hasRecordedToday ? "from-gray-400 to-gray-600" : "from-emerald-400 to-emerald-600",
      disabled: hasRecordedToday,
    },
    {
      title: "我的目标",
      description: "查看进度",
      icon: <Target className="w-6 h-6" />,
      href: "/goals",
      color: "from-orange-400 to-orange-600",
    },
    {
      title: "每日签文",
      description: hasDrawnToday ? "今日已抽签" : "抽取签文",
      icon: <Calendar className="w-6 h-6" />,
      href: "/fortune",
      color: hasDrawnToday ? "from-gray-400 to-gray-600" : "from-rose-400 to-rose-600",
      disabled: hasDrawnToday,
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-[120px] lg:pb-[120px]">
      <div className="container mx-auto py-12 px-6 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-[30px] p-8 mb-8 organic-shadow border-2 border-border animate-fade-in-up">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-quicksand font-bold mb-3 text-foreground">
                {greeting}
              </h1>
              <p className="text-muted-foreground text-base">
                记录每一刻，发现更好的自己
              </p>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`group relative rounded-xl p-2.5 border border-border/50 transition-all hover:scale-105 hover:border-border ${
                    action.disabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-accent/20 bg-white'
                  }`}
                  title={action.title}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} text-white flex items-center justify-center`}>
                    {action.icon}
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-accent/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden md:inline">设置</span>
              </Link>
              <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-5 py-3 rounded-2xl organic-shadow">
                <div className="text-xs opacity-90">当前计划</div>
                <div className="text-xl font-bold font-quicksand">
                  {session.user.tier === 'FREE' ? '免费版' : session.user.tier}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vibe Report Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-quicksand font-bold mb-6 flex items-center gap-3 text-foreground">
            📊 你的本周 Vibe Report
          </h2>
          <VibeReportCards loading={false} />
        </div>

        {/* Goals Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-quicksand font-bold mb-6 flex items-center gap-3 text-foreground">
            🎯 我的目标
          </h2>
          <GoalProgressCards loading={false} />
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-quicksand font-bold mb-6 flex items-center gap-3 text-foreground">
              💡 今日推荐
            </h2>
            <Card className="p-8 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-[30px] organic-shadow border-2 border-border animate-fade-in-up">
              <div className="space-y-4">
                {recommendations.slice(0, 2).map((rec, index) => (
                  <div
                    key={rec.id}
                    className="p-6 bg-white rounded-2xl border-2 border-border hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getRecommendationIcon(rec.type)}</div>
                      <div className="flex-1">
                        <div className="font-quicksand font-bold text-lg mb-2 text-foreground">{rec.title}</div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{rec.description}</p>
                        <div className="flex gap-3">
                          <Button className="rounded-2xl bg-gradient-to-r from-primary to-primary-light font-quicksand font-bold organic-shadow hover:scale-105 transition-all">
                            选择这个
                          </Button>
                          <Button variant="outline" className="rounded-2xl border-2 font-quicksand font-bold hover:border-primary transition-all">
                            了解更多
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Today's Fortune Display */}
        {hasDrawnToday && todayFortune && (
          <div className="mb-12">
            <h2 className="text-3xl font-quicksand font-bold mb-6 flex items-center gap-3 text-foreground">
              🎴 今日签文
            </h2>
            <Card className="p-8 bg-gradient-to-br from-orange-50 to-pink-50 rounded-[30px] organic-shadow border-2 border-orange-200 animate-fade-in-up max-w-2xl">
              <div className="inline-block px-4 py-2 bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-bold font-quicksand rounded-full mb-4">
                {todayFortune.level === 'EXCELLENT' ? '上上签' : todayFortune.level === 'GOOD' ? '上签' : todayFortune.level === 'AVERAGE' ? '中签' : '下签'}
              </div>
              <h3 className="font-quicksand font-bold text-2xl mb-3 text-foreground">{todayFortune.title}</h3>
              <p className="text-base text-muted-foreground italic mb-4 leading-relaxed">"{todayFortune.text}"</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{todayFortune.interpretation}</p>
              <Link href="/fortune" className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                查看历史 →
              </Link>
            </Card>
          </div>
        )}

        {/* Daily Check-in Reminder for FREE users */}
        {session.user.tier === 'FREE' && !hasRecordedToday && (
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[30px] organic-shadow border-2 border-amber-200 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center animate-pulse">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-quicksand font-bold text-lg mb-1 text-amber-900">
                  今天还没有记录 Vibe 哦
                </h3>
                <p className="text-sm text-amber-700">
                  记录今天的状态，让 AI 更懂你
                </p>
              </div>
              <Button
                onClick={() => router.push('/vibe')}
                className="bg-gradient-to-r from-amber-400 to-orange-400 hover:bounce-hover organic-shadow text-white rounded-2xl"
              >
                立即记录
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Desktop Bottom Bar */}
      <DesktopBottomBar />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* FAB for Vibe Record (Desktop only) */}
      <button
        onClick={() => setShowVibeRecordModal(true)}
        className="hidden lg:flex fixed bottom-28 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light text-white shadow-lg organic-shadow hover:scale-110 transition-all items-center justify-center z-40"
        title="记录今日 Vibe"
      >
        {!hasRecordedToday && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
        )}
        <Plus className="w-8 h-8" />
      </button>

      {/* Fortune Draw Modal */}
      <FortuneDrawModal
        isOpen={showFortuneModal}
        onClose={() => setShowFortuneModal(false)}
        onFortuneDrawn={handleFortuneDrawn}
      />

      {/* Vibe Record Modal Placeholder */}
      {showVibeRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[30px] p-8 max-w-md w-full organic-shadow animate-fade-in-up">
            <h2 className="text-2xl font-quicksand font-bold mb-4 text-foreground">记录今日 Vibe</h2>
            <p className="text-muted-foreground mb-6">
              Vibe 记录模态框功能开发中...<br />
              <span className="text-sm">（即将整合到 /vibe 页面）</span>
            </p>
            <Button
              onClick={() => setShowVibeRecordModal(false)}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-light font-quicksand font-bold"
            >
              关闭
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
