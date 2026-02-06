"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { Users, TrendingUp, CreditCard, Activity } from 'lucide-react'

interface Stats {
  totalUsers: number
  activeUsers: number
  paidUsers: number
  conversionRate: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Load stats error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
            <Link
              href="/dashboard"
              className="text-slate-700 hover:text-slate-900 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                🛡️ 管理后台
              </h1>
              <p className="text-slate-700">系统数据概览</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-slate-700">加载中...</div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-white rounded-2xl border-2 border-slate-200 organic-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">总用户数</div>
                      <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        {stats?.totalUsers || 0}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white rounded-2xl border-2 border-slate-200 organic-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">今日活跃</div>
                      <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        {stats?.activeUsers || 0}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white rounded-2xl border-2 border-slate-200 organic-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">付费用户</div>
                      <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        {stats?.paidUsers || 0}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white rounded-2xl border-2 border-slate-200 organic-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">付费转化率</div>
                      <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        {stats?.conversionRate ? (stats.conversionRate * 100).toFixed(1) : '0'}%
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-8 bg-white rounded-3xl border-2 border-slate-200 organic-shadow">
                <h2 className="text-xl font-bold mb-6 text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  快捷操作
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/users">
                    <Button className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-semibold">
                      👥 用户管理
                    </Button>
                  </Link>
                  <Link href="/admin/orders">
                    <Button variant="outline" className="w-full h-16 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl font-semibold">
                      💰 订单管理
                    </Button>
                  </Link>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
