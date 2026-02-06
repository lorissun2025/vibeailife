"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface VibeTrackerProps {
  onRecordCreated?: () => void
}

export function VibeTracker({ onRecordCreated }: VibeTrackerProps) {
  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableTags = [
    '工作', '学习', '运动', '社交', '娱乐',
    '家庭', '健康', '财务', '旅行', '创作',
  ]

  const moodEmojis = ['', '😔', '😐', '🙂', '😊', '🥰']
  const moodLabels = ['', '很差', '不好', '一般', '不错', '很好']

  const energyEmojis = ['', '💫', '✨', '⚡', '🔥', '🚀']
  const energyLabels = ['', '很低', '较低', '一般', '较高', '很高']

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (mood === null || energy === null) {
      toast.error('请选择心情和精力等级')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          energy,
          tags: selectedTags,
          note: note.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Vibe 记录已保存 ✨')

        // 显示 AI 分析
        if (result.data.aiResponse) {
          setTimeout(() => {
            toast.info(result.data.aiResponse, { duration: 5000 })
          }, 500)
        }

        // 重置表单
        setMood(null)
        setEnergy(null)
        setSelectedTags([])
        setNote('')

        onRecordCreated?.()
      } else {
        toast.error(result.error?.message || '记录失败')
      }
    } catch (error) {
      console.error('Create vibe record error:', error)
      toast.error('记录失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-8 bg-white rounded-[30px] organic-shadow border-2 border-border">
      <h3 className="text-xl font-quicksand font-bold mb-6 flex items-center gap-3">
        <span className="text-2xl">💝</span>
        记录 Vibe
      </h3>

      {/* 心情选择 */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted-foreground mb-3 font-quicksand">心情如何？</label>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setMood(level)}
              className={`
                flex-1 py-4 px-2 rounded-[15px] border-2 transition-all text-center bounce-hover
                ${mood === level
                  ? 'border-primary bg-gradient-to-br from-primary to-primary/80 shadow-md scale-105'
                  : 'border-border hover:border-primary hover:scale-105'
                }
              `}
            >
              <div className="text-2xl mb-1">{moodEmojis[level]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 精力选择 */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted-foreground mb-3 font-quicksand">精力水平</label>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setEnergy(level)}
              className={`
                flex-1 py-4 px-2 rounded-[15px] border-2 transition-all text-center bounce-hover
                ${energy === level
                  ? 'border-secondary bg-gradient-to-br from-secondary to-secondary/80 shadow-md scale-105'
                  : 'border-border hover:border-secondary hover:scale-105'
                }
              `}
            >
              <div className="text-2xl mb-1">{energyEmojis[level]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 标签选择 */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted-foreground mb-3 font-quicksand">相关标签</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`
                px-4 py-2 rounded-[20px] text-sm font-bold border transition-all bounce-hover
                ${selectedTags.includes(tag)
                  ? 'border-accent bg-gradient-to-br from-accent to-accent/80 text-foreground scale-105'
                  : 'border-border hover:border-accent hover:scale-105'
                }
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 备注 */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted-foreground mb-3 font-quicksand">分享你当下的想法</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="写点什么..."
          className="w-full p-4 border-2 rounded-[20px] resize-none focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all font-sans"
          rows={3}
          maxLength={200}
        />
      </div>

      {/* 提交按钮 */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || mood === null || energy === null}
        className="w-full py-6 rounded-[20px] font-quicksand font-bold text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 organic-shadow organic-shadow-lg transition-all"
      >
        {isSubmitting ? '保存中...' : '✨ 保存记录'}
      </Button>
    </Card>
  )
}
