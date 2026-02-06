"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeftIcon, Search, Ban, ShieldCheck } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  tier: string
  isBanned: boolean
  lastActiveAt: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    loadUsers()
  }, [page, searchTerm])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}&search=${searchTerm}`)
      const result = await response.json()
      if (result.success) {
        setUsers(result.data.users)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('Load users error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? '确定要解封该用户吗？' : '确定要封禁该用户吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !currentStatus }),
      })

      const result = await response.json()
      if (result.success) {
        loadUsers()
      } else {
        alert(result.error?.message || '操作失败')
      }
    } catch (error) {
      console.error('Toggle ban error:', error)
      alert('操作失败')
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PRO': return 'bg-purple-100 text-purple-700'
      case 'ENTERPRISE': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const totalPages = Math.ceil(total / limit)

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
                👥 用户管理
              </h1>
              <p className="text-slate-700">共 {total} 位用户</p>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="p-4 mb-6 bg-white rounded-2xl border-2 border-slate-200">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索用户邮箱或姓名..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </Card>

          {/* Users List */}
          <Card className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-700">加载中...</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-700">没有找到用户</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {users.map((user) => (
                  <div key={user.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {user.name || '未设置姓名'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTierColor(user.tier)}`}>
                            {user.tier}
                          </span>
                          {user.isBanned && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              已封禁
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">{user.email}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span>注册于 {formatDate(user.createdAt)}</span>
                          <span>最后活跃 {formatDate(user.lastActiveAt)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleToggleBan(user.id, user.isBanned)}
                        variant={user.isBanned ? "outline" : "destructive"}
                        className="rounded-xl"
                      >
                        {user.isBanned ? (
                          <>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            解封
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-2" />
                            封禁
                          </>
                        )}
                      </Button>
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
