"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type FortuneType = 'GROWTH' | 'CAREER' | 'RELATIONSHIP' | 'GENERAL'
type FortuneLevel = 'EXCELLENT' | 'GOOD' | 'MEDIUM' | 'CHALLENGING'

interface FortuneData {
  id: string
  type: FortuneType
  level: FortuneLevel
  title: string
  text: string
  interpretation: string
  tone: string
}

interface FortuneDrawModalProps {
  isOpen: boolean
  onClose: () => void
  onFortuneDrawn?: (fortune: FortuneData) => void
}

export function FortuneDrawModal({ isOpen, onClose, onFortuneDrawn }: FortuneDrawModalProps) {
  const [step, setStep] = useState<'select' | 'drawing' | 'result'>('select')
  const [selectedType, setSelectedType] = useState<FortuneType | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [fortune, setFortune] = useState<FortuneData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setStep('select')
      setSelectedType(null)
      setFortune(null)
      setIsAnimating(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTypeSelect = async (type: FortuneType) => {
    setSelectedType(type)
    setIsLoading(true)

    try {
      const response = await fetch('/api/fortune/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      const result = await response.json()

      if (result.success) {
        setFortune(result.data.fortune)
        setStep('drawing')
        setIsAnimating(true)

        // 模拟抽签动画
        setTimeout(() => {
          setIsAnimating(false)
          setStep('result')
          onFortuneDrawn?.(result.data.fortune)
        }, 3000)
      } else {
        toast.error(result.error?.message || '抽签失败')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Draw fortune error:', error)
      toast.error('抽签失败，请重试')
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    try {
      const response = await fetch('/api/fortune/skip', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('已跳过今日抽签')
        onClose()
      } else {
        toast.error('操作失败，请重试')
      }
    } catch (error) {
      console.error('Skip fortune error:', error)
      toast.error('操作失败，请重试')
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

  const getTypeInfo = (type: FortuneType) => {
    const info = {
      GROWTH: { icon: '🌿', label: '心灵成长', desc: '关于自我提升、心态、成长', gradient: 'from-green-50 to-emerald-50 border-green-200' },
      CAREER: { icon: '💼', label: '事业运势', desc: '关于工作、职业、目标', gradient: 'from-blue-50 to-indigo-50 border-blue-200' },
      RELATIONSHIP: { icon: '💝', label: '人际关系', desc: '关于友情、爱情、社交', gradient: 'from-pink-50 to-rose-50 border-pink-200' },
      GENERAL: { icon: '🎲', label: '随机抽取', desc: '完全随机，听天由命', gradient: 'from-purple-50 to-violet-50 border-purple-200' },
    }
    return info[type]
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-lg bg-white rounded-[30px] organic-shadow-lg border-2 border-border animate-fade-in-up">
        <div className="p-8">
          {/* 选择类型 */}
          {step === 'select' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">🎴</div>
                <h2 className="text-2xl font-quicksand font-bold mb-2 text-foreground">每日一签</h2>
                <p className="text-muted-foreground text-sm">今天想抽什么类型的签？</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(Object.keys({ GROWTH: '', CAREER: '', RELATIONSHIP: '', GENERAL: '' }) as FortuneType[]).map((type) => {
                  const info = getTypeInfo(type)
                  return (
                    <button
                      key={type}
                      onClick={() => !isLoading && handleTypeSelect(type)}
                      disabled={isLoading}
                      className={`
                        p-5 rounded-[20px] border-2 transition-all text-left bounce-hover relative overflow-hidden
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                        ${selectedType === type ? 'border-primary ring-4 ring-primary/10' : 'border-border'}
                      `}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 hover:opacity-100 transition-opacity`}></div>
                      <div className="relative z-10">
                        <div className="text-3xl mb-2">{info.icon}</div>
                        <div className="font-quicksand font-bold mb-1">{info.label}</div>
                        <div className="text-xs text-muted-foreground">{info.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-quicksand"
                >
                  跳过，直接进入对话 →
                </button>
              </div>
            </div>
          )}

          {/* 抽签动画 */}
          {step === 'drawing' && isAnimating && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="text-7xl mb-6 animate-bounce">🎴</div>
                <h3 className="text-2xl font-quicksand font-bold mb-3 text-foreground">正在为你抽签...</h3>
                <p className="text-muted-foreground text-sm">请稍候片刻 ✨</p>
              </div>

              {/* 加载动画 */}
              <div className="flex justify-center gap-3 mb-6">
                <div className="w-4 h-4 bg-gradient-to-br from-primary to-primary/80 rounded-full animate-bounce organic-shadow" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-gradient-to-br from-secondary to-secondary/80 rounded-full animate-bounce organic-shadow" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-4 h-4 bg-gradient-to-br from-accent to-accent/80 rounded-full animate-bounce organic-shadow" style={{ animationDelay: '0.2s' }}></div>
              </div>

              {/* 进度条 */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full animate-pulse" style={{ animation: 'progress 3s ease-in-out' }}></div>
              </div>
            </div>
          )}

          {/* 签文结果 */}
          {step === 'result' && fortune && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-block px-5 py-2 bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-bold font-quicksand rounded-full mb-4 organic-shadow">
                  {getFortuneLevelLabel(fortune.level)}
                </div>
                <h3 className="text-2xl font-quicksand font-bold mb-2 text-foreground">{fortune.title}</h3>
              </div>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 rounded-[25px] border-2 border-orange-200 organic-shadow">
                <blockquote className="text-center text-lg font-medium mb-4 text-foreground italic">
                  "{fortune.text}"
                </blockquote>
                <div className="text-sm text-muted-foreground text-center leading-relaxed">
                  💡 {fortune.interpretation}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-[20px] font-quicksand font-bold border-2 hover:bg-gray-50"
                  onClick={() => {
                    setStep('select')
                    setSelectedType(null)
                    setFortune(null)
                  }}
                >
                  🔄 重新抽签
                </Button>
                <Button
                  className="flex-1 rounded-[20px] font-quicksand font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 organic-shadow"
                  onClick={() => {
                    toast.success('签文已保存，AI会在对话中巧妙代入 💝')
                    onClose()
                    // 跳转到聊天页面，并标记来自抽签
                    setTimeout(() => {
                      window.location.href = '/chat?fromFortune=true'
                    }, 300)
                  }}
                >
                  开始今天的对话
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}
