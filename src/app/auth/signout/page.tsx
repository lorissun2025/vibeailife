"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">退出登录</CardTitle>
          <CardDescription>
            确定要退出 VibeAILife 吗？
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full"
            size="lg"
          >
            确认退出
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
            size="lg"
          >
            返回
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
