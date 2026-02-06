"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">检查您的邮箱</CardTitle>
          <CardDescription>
            我们已向您的邮箱发送了一个魔法链接。<br />
            点击该链接即可登录。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>📧 请检查您的收件箱</p>
            <p>⏰ 链接将在 24 小时后过期</p>
            <p>🔒 这是无密码登录，安全可靠</p>
          </div>
          <Button
            onClick={() => window.location.href = "/auth/signin"}
            variant="outline"
            className="w-full"
          >
            返回登录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
