"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  provider: string
  status: string
  createdAt: string
  user: {
    id: string
    email: string | null
    name: string | null
  }
}

export default function AdminOrdersPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const limit = 20

  useEffect(() => {
    loadPayments()
  }, [page, statusFilter])

  const loadPayments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/payments?page=${page}&limit=${limit}&status=${statusFilter}`)
      const result = await response.json()
      if (result.success) {
        setPayments(result.data.payments)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('Load payments error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return 'bg-emerald-100 text-emerald-700'
      case 'PENDING': return 'bg-amber-100 text-amber-700'
      case 'FAILED': return 'bg-red-100 text-red-700'
      case 'REFUNDED': return 'bg-slate-100 text-slate-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'FAILED': return <XCircle className="w-4 h-4" />
      case 'REFUNDED': return <RefreshCw className="w-4 h-4" />
      default: return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return '支付成功'
      case 'PENDING': return '待支付'
      case 'FAILED': return '支付失败'
      case 'REFUNDED': return '已退款'
      default: return status
    }
  }

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'STRIPE': return 'Stripe'
      case 'ALIPAY': return '支付宝'
      case 'WECHAT': return '微信支付'
      default: return provider
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const formatted = (amount / 100).toFixed(2)
    if (currency === 'USD') return `$${formatted}`
    if (currency === 'CNY') return `¥${formatted}`
    return `${formatted} ${currency}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const totalPages = Math.ceil(total / limit)

  const totalRevenue = payments
    .filter(p => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/admin"
              className="text-slate-700 hover:text-slate-900 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                💰 订单管理
              </h1>
              <p className="text-slate-700">共 {total} 笔订单</p>
            </div>
          </div>

          {/* Stats Card */}
          <Card className="p-6 mb-6 bg-white rounded-2xl border-2 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">总收入（成功订单）</div>
                  <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    {formatAmount(totalRevenue, 'CNY')}
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {['ALL', 'SUCCEEDED', 'PENDING', 'FAILED', 'REFUNDED'].map((status) => (
                  <Button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status)
                      setPage(1)
                    }}
                    variant={statusFilter === status ? "default" : "outline"}
                    className="rounded-xl"
                    size="sm"
                  >
                    {status === 'ALL' ? '全部' : getStatusLabel(status)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Orders List */}
          <Card className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-700">加载中...</div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-slate-700">没有找到订单</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {payment.user.name || '未设置姓名'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            {getStatusLabel(payment.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{payment.user.email || '无邮箱'}</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>订单号: {payment.id.slice(-8)}</span>
                          <span>支付方式: {getProviderLabel(payment.provider)}</span>
                          <span>{formatDate(payment.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                className="rounded-xl"
              >
                上一页
              </Button>
              <span className="text-slate-700">
                第 {page} / {totalPages} 页
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                className="rounded-xl"
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
