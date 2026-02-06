"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import { Icons } from "@/components/ui/icons"

type Step = "welcome" | "profile" | "region" | "vibe" | "chat" | "complete"

export function OnboardingModal() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [name, setName] = useState(session?.user?.name || "")
  const [region, setRegion] = useState<"international" | "china">("international")
  const [isLoading, setIsLoading] = useState(false)

  const steps: Step[] = ["welcome", "profile", "region", "vibe", "chat", "complete"]
  const currentStepIndex = steps.indexOf(currentStep)

  const handleNext = async () => {
    if (currentStep === "complete") {
      setIsLoading(true)
      try {
        // Update user onboarding status
        await fetch("/api/user/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, region }),
        })
        await update({ hasOnboarded: true })
        router.push("/dashboard")
      } catch (error) {
        console.error("Failed to complete onboarding:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setCurrentStep(steps[currentStepIndex + 1] as Step)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1] as Step)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3">欢迎来到 VibeAILife 🎉</h2>
              <p className="text-muted-foreground text-lg">
                您的 AI 生活伴侣，帮助您追踪心情、设定目标、获得智慧建议
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>✨ AI 聊天 - 三种对话模式满足不同需求</p>
              <p>📊 Vibe 追踪 - 记录并分析您的心情变化</p>
              <p>🎯 目标管理 - 设定并追踪个人目标</p>
              <p>📜 每日签文 - 获取今日运势和建议</p>
            </div>
          </div>
        )

      case "profile":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">告诉我们如何称呼您</h2>
              <p className="text-muted-foreground">这样 AI 就能更亲切地与您交流</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">昵称</Label>
                <Input
                  id="name"
                  placeholder="输入您的昵称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                💡 您可以随时在设置中更改昵称
              </p>
            </div>
          </div>
        )

      case "region":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">选择您的地区</h2>
              <p className="text-muted-foreground">我们将根据您的地区优化服务</p>
            </div>
            <div className="space-y-3">
              <Button
                variant={region === "international" ? "default" : "outline"}
                className="w-full h-auto p-6 flex flex-col items-start"
                onClick={() => setRegion("international")}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="font-semibold text-lg mb-1">🌍 国际版</div>
                    <div className="text-sm text-muted-foreground">
                      使用 OpenAI GPT-4o，适合国际用户
                    </div>
                  </div>
                  {region === "international" && <Icons.google className="h-5 w-5" />}
                </div>
              </Button>
              <Button
                variant={region === "china" ? "default" : "outline"}
                className="w-full h-auto p-6 flex flex-col items-start"
                onClick={() => setRegion("china")}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="font-semibold text-lg mb-1">🇨🇳 中国版</div>
                    <div className="text-sm text-muted-foreground">
                      使用智谱 GLM-4，专为中文优化
                    </div>
                  </div>
                  {region === "china" && <Icons.google className="h-5 w-5" />}
                </div>
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                💡 您可以随时在设置中切换地区
              </p>
            </div>
          </div>
        )

      case "vibe":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">追踪您的心情</h2>
              <p className="text-muted-foreground">每天记录 Vibe，AI 会分析趋势并给出建议</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted space-y-3">
                <p className="font-semibold">Vibe 记录包含：</p>
                <ul className="space-y-2 text-sm">
                  <li>⭐ 心情评分 (1-5 星)</li>
                  <li>⚡ 能量水平 (1-5 级)</li>
                  <li>🏷️ 活动标签 (工作、运动、学习等)</li>
                  <li>📝 个人备注</li>
                  <li>🤖 AI 洞察分析</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                <p className="text-sm">
                  <strong>示例：</strong> 今天完成了项目的重要功能，心情 5 星，能量 4 星，标签「工作」「成就」
                </p>
              </div>
            </div>
          </div>
        )

      case "chat":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">AI 聊天伴侣</h2>
              <p className="text-muted-foreground">三种模式，满足不同场景需求</p>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border space-y-2">
                <div className="font-semibold">👥 朋友模式</div>
                <p className="text-sm text-muted-foreground">
                  像朋友一样聊天，轻松随意，可以吐槽、分享日常
                </p>
              </div>
              <div className="p-4 rounded-lg border space-y-2">
                <div className="font-semibold">🎯 教练模式</div>
                <p className="text-sm text-muted-foreground">
                  像教练一样引导，帮助您思考问题、制定计划、达成目标
                </p>
              </div>
              <div className="p-4 rounded-lg border space-y-2">
                <div className="font-semibold">👂 倾听者模式</div>
                <p className="text-sm text-muted-foreground">
                  安静地倾听，给予支持和理解，不评判、不打断
                </p>
              </div>
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3">一切准备就绪！</h2>
              <p className="text-muted-foreground text-lg">
                您已准备好开始使用 VibeAILife
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p>🎉 感谢您完成新手引导</p>
              <p>🚀 点击下方按钮开始探索</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-8">
          {renderStep()}

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === "welcome" || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              返回
            </Button>

            <div className="flex gap-2">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`h-2 w-2 rounded-full ${
                    index <= currentStepIndex
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={isLoading || (currentStep === "profile" && !name.trim())}
            >
              {isLoading ? (
                "处理中..."
              ) : currentStep === "complete" ? (
                <>
                  开始使用
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  下一步
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
