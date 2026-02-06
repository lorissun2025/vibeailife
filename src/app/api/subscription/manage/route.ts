/**
 * GET /api/subscription/manage
 * 获取订阅管理链接
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: {
            code: 'PAYMENT_NOT_CONFIGURED',
            message: '支付功能暂未配置',
          },
        },
        { status: 503 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // 获取用户订阅信息
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeSubscriptionId: true },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No active subscription found',
          },
        },
        { status: 404 }
      );
    }

    // @ts-expect-error - stripe is optional for payment functionality
    const stripeModule = await import('stripe');
    const stripe = new stripeModule.default(process.env.STRIPE_SECRET_KEY);

    // 创建客户门户会话
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: (await stripe.customers.list({
        email: (await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        }))?.email || undefined,
        limit: 1,
      })).data[0]?.id || '',
      return_url: `${process.env.NEXTAUTH_URL}/settings`,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: portalSession.url,
      },
    });
  } catch (error: any) {
    console.error('Get subscription manage error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get subscription manage link' } },
      { status: 500 }
    );
  }
}
