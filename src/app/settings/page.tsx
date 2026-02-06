"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { signOut } from "next-auth/react"

type LLMProvider = 'openai' | 'zhipu' | 'auto'

interface UserSettings {
  preferredProvider: string | null
  region: string
  tier: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('auto')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch user settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/user/settings')
        const result = await response.json()

        if (result.success) {
          setSettings(result.data)
          setSelectedProvider(result.data.preferredProvider || 'auto')
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        toast.error('加载设置失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredProvider: selectedProvider }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('设置已保存 ✨')
        setSettings({ ...settings!, preferredProvider: selectedProvider === 'auto' ? null : selectedProvider })
      } else {
        toast.error('保存失败: ' + result.error?.message)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('保存设置失败')
    } finally {
      setIsSaving(false)
    }
  }

  const getProviderLabel = (provider: LLMProvider) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI (GPT)'
      case 'zhipu':
        return '智谱 AI (GLM)'
      case 'auto':
        return '自动选择'
    }
  }

  const getProviderDescription = (provider: LLMProvider) => {
    switch (provider) {
      case 'openai':
        return '使用 OpenAI 的 GPT 模型，适合国际用户'
      case 'zhipu':
        return '使用智谱 AI 的 GLM 模型，中文理解更好'
      case 'auto':
        return '根据您的地区自动选择最合适的模型'
    }
  }

  const getProviderGradient = (provider: LLMProvider) => {
    switch (provider) {
      case 'openai':
        return 'from-green-50 to-emerald-50 border-green-200'
      case 'zhipu':
        return 'from-blue-50 to-indigo-50 border-blue-200'
      case 'auto':
        return 'from-purple-50 to-violet-50 border-purple-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-6 max-w-3xl">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <span className="text-lg font-quicksand font-medium text-muted-foreground">加载中...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-quicksand font-bold mb-2 text-foreground">设置</h1>
            <p className="text-muted-foreground text-base">
              管理您的账户设置和偏好
            </p>
          </div>
        </div>

        {/* Account Info Card */}
        <Card className="p-8 bg-white rounded-[30px] organic-shadow border-2 border-border mb-6 animate-fade-in-up">
          <h2 className="text-2xl font-quicksand font-bold mb-6 text-foreground flex items-center gap-3">
            <span className="text-2xl">👤</span>
            账户信息
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
              <span className="text-muted-foreground font-quicksand">当前计划</span>
              <span className="font-bold font-quicksand px-4 py-2 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full text-sm">
                {settings?.tier || 'FREE'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-2xl">
              <span className="text-muted-foreground font-quicksand">地区</span>
              <span className="font-bold font-quicksand text-foreground">
                {settings?.region === 'cn' ? '🇨🇳 中国' : '🌍 国际'}
              </span>
            </div>
          </div>
        </Card>

        {/* LLM Provider Selection */}
        <Card className="p-8 bg-white rounded-[30px] organic-shadow border-2 border-border mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-quicksand font-bold mb-2 text-foreground flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              AI 模型设置
            </h2>
            <p className="text-sm text-muted-foreground">
              选择您偏好的 AI 语言模型。不同模型在语言理解和响应速度上可能有所不同。
            </p>
          </div>

          <div className="space-y-4">
            {(['auto', 'zhipu', 'openai'] as LLMProvider[]).map((provider) => (
              <div
                key={provider}
                className={`
                  relative flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all bounce-hover
                  ${selectedProvider === provider
                    ? `bg-gradient-to-br ${getProviderGradient(provider)} organic-shadow scale-[1.02]`
                    : 'bg-white border-border hover:border-primary/30 hover:bg-accent/5'
                  }
                `}
                onClick={() => setSelectedProvider(provider)}
              >
                <input
                  type="radio"
                  name="provider"
                  id={provider}
                  value={provider}
                  checked={selectedProvider === provider}
                  onChange={() => setSelectedProvider(provider)}
                  className="mt-2 w-5 h-5"
                />
                <div className="flex-1">
                  <Label htmlFor={provider} className="font-bold font-quicksand text-base cursor-pointer text-foreground">
                    {getProviderLabel(provider)}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 font-quicksand">
                    {getProviderDescription(provider)}
                  </p>
                </div>
                {selectedProvider === provider && (
                  <div className="text-primary">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedProvider(settings?.preferredProvider || 'auto')}
              disabled={isSaving}
              className="rounded-2xl border-2 font-quicksand font-bold px-6"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || selectedProvider === (settings?.preferredProvider || 'auto')}
              className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 font-quicksand font-bold px-8 organic-shadow hover:from-primary/90 hover:to-primary/70 transition-all"
            >
              {isSaving ? '保存中...' : '✨ 保存更改'}
            </Button>
          </div>
        </Card>

        {/* Subscription */}
        <Card className="p-8 bg-white rounded-[30px] organic-shadow border-2 border-border animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-quicksand font-bold text-foreground flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                订阅管理
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                当前计划: <span className="font-bold font-quicksand text-foreground">{settings?.tier === 'FREE' ? '免费版' : settings?.tier}</span>
              </p>
            </div>
            {settings?.tier === 'FREE' && (
              <Link href="/subscription">
                <Button className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 font-quicksand font-bold px-6 organic-shadow">
                  升级到 Pro
                </Button>
              </Link>
            )}
            {settings?.tier !== 'FREE' && (
              <Button variant="outline" onClick={async () => {
                try {
                  const response = await fetch('/api/subscription/manage')
                  const result = await response.json()
                  if (result.success) {
                    window.location.href = result.data.url
                  }
                } catch (error) {
                  toast.error('获取订阅管理链接失败')
                }
              }} className="rounded-2xl border-2 font-quicksand font-bold px-6">
                管理订阅
              </Button>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-gradient-to-br from-accent/20 to-secondary/10 rounded-[30px] border-2 border-accent/30 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-quicksand font-bold mb-3 text-lg flex items-center gap-2">
            <span>💡</span>
            <span>提示</span>
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2 font-quicksand">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>智谱 AI (GLM) 对中文理解更深入，适合中文用户</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>OpenAI (GPT) 在多语言场景下表现优秀</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>自动选择会根据您的地区和网络情况选择最合适的模型</span>
            </li>
          </ul>
        </Card>

        {/* Admin Link - 仅显示给管理员 */}
        <Link href="/admin" className="block">
          <Card className="p-6 bg-gradient-to-br from-slate-100 to-zinc-100 rounded-[30px] border-2 border-slate-300 animate-fade-in-up hover:from-slate-200 hover:to-zinc-200 transition-all" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-quicksand font-bold mb-1 text-lg flex items-center gap-2 text-slate-900">
                  <span>🛡️</span>
                  <span>管理后台</span>
                </h3>
                <p className="text-sm text-slate-600">查看系统统计数据和用户管理</p>
              </div>
              <div className="text-slate-400">
                →
              </div>
            </div>
          </Card>
        </Link>

        {/* 退出登录按钮 */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-[30px] border-2 border-red-200 animate-fade-in-up hover:from-red-100 hover:to-orange-100 transition-all" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-quicksand font-bold mb-1 text-lg flex items-center gap-2 text-red-900">
                <span>🚪</span>
                <span>退出登录</span>
              </h3>
              <p className="text-sm text-red-700">退出当前账户</p>
            </div>
            <Button
              onClick={async () => {
                try {
                  await signOut({ callbackUrl: '/auth/signin' })
                } catch (error) {
                  console.error('Sign out error:', error)
                  toast.error('退出失败')
                }
              }}
              variant="outline"
              className="border-2 border-red-300 text-red-700 hover:bg-red-50 rounded-xl"
            >
              退出
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
