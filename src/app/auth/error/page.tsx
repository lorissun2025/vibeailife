"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    Configuration: "服务器配置错误，请联系管理员",
    AccessDenied: "访问被拒绝，您没有权限执行此操作",
    Verification: "验证令牌已过期或无效",
    Default: "发生未知错误，请重试",
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md border-2 border-border organic-shadow">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 text-red-600 flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            认证错误
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => window.location.href = "/auth/signin"}
            className="w-full"
            size="lg"
          >
            返回登录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold">认证错误</CardTitle>
            <CardDescription>
              加载中...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
