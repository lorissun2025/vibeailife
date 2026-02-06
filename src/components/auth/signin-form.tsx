"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // 临时测试登录（仅开发环境）
  const isDevelopment = process.env.NODE_ENV === 'development'

  const handleTestLogin = async () => {
    if (!email) {
      setError('请输入邮箱地址')
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn('test-login', {
        email,
        password: password || 'test',
        redirect: false,
      })

      if (result?.error) {
        setError('登录失败，请重试')
      } else if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Test login error:', error)
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      setError("Google 登录失败，请重试")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signIn("email", {
        email,
        callbackUrl: "/dashboard",
        redirect: true,
      })
    } catch (error: any) {
      setError(error.message || "发送魔法链接失败，请重试")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md border-2 border-border organic-shadow">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="text-6xl">✨</div>
          <CardTitle className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            欢迎来到 VibeAILife
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            记录每一刻，发现更好的自己
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google 登录 */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            使用 Google 继续
          </Button>

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或
              </span>
            </div>
          </div>

          {/* Email 登录表单 */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              发送魔法链接
            </Button>
          </form>

          {/* 说明文字 */}
          <p className="text-xs text-center text-muted-foreground">
            登录即表示您同意我们的{" "}
            <a href="#" className="underline hover:text-primary">
              服务条款
            </a>{" "}
            和{" "}
            <a href="#" className="underline hover:text-primary">
              隐私政策
            </a>
          </p>

          {/* 临时测试登录 - 仅开发环境 */}
          {isDevelopment && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-dashed" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    开发环境测试
                  </span>
                </div>
              </div>
              <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
                <p className="text-xs text-amber-700 font-medium text-center mb-3">
                  🔧 临时测试登录（输入任意邮箱即可）
                </p>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-white"
                  />
                  <Button
                    onClick={handleTestLogin}
                    disabled={isLoading || !email}
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:bounce-hover text-white rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '🚀 快速登录'
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
