/**
 * POST /api/subscription/create-checkout
 * 创建 Stripe Checkout Session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createCheckoutSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE']),
});

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const body = await req.json();
    const parsed = createCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid plan' } },
        { status: 400 }
      );
    }

    const { plan } = parsed.data;

    // 检查 Stripe 是否配置
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: {
            code: 'PAYMENT_NOT_CONFIGURED',
            message: '支付功能暂未配置，请联系管理员',
          },
        },
        { status: 503 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Stripe 集成
    let stripe;
    try {
      const stripeModule = await import('stripe');
      stripe = new stripeModule.default(process.env.STRIPE_SECRET_KEY);
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: 'STRIPE_NOT_INSTALLED',
            message: 'Stripe SDK not installed',
          },
        },
        { status: 503 }
      );
    }

    // 定价配置
    const prices = {
      PRO: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
      },
      ENTERPRISE: {
        monthly: process.env.STRIPE_PRICE_ENT_MONTHLY,
        yearly: process.env.STRIPE_PRICE_ENT_YEARLY,
      },
    };

    const priceId = prices[plan as keyof typeof prices]?.monthly;

    if (!priceId) {
      return NextResponse.json(
        {
          error: {
            code: 'PRICE_NOT_FOUND',
            message: '定价配置未找到',
          },
        },
        { status: 500 }
      );
    }

    // 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription/cancel`,
      metadata: {
        userId,
        plan,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create checkout session' } },
      { status: 500 }
    );
  }
}
