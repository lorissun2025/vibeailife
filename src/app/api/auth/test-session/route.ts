/**
 * GET /api/auth/test-session
 * 测试接口：返回当前登录状态
 */

import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        loggedIn: false,
        message: '未登录'
      })
    }

    return NextResponse.json({
      success: true,
      loggedIn: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        tier: (session.user as any).tier,
      }
    })
  } catch (error) {
    console.error('Test session error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check session' },
      { status: 500 }
    )
  }
}
