import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()
    
    console.log('Plan ID:', planId) // デバッグ用

    if (!planId || (planId !== 'monthly' && planId !== 'yearly')) {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 })
    }

    const planData = {
      monthly: {
        amount: 98000, // 980円を銭単位で
        interval: 'month' as const,
        name: 'ベーシックプラン（月額）'
      },
      yearly: {
        amount: 598000, // 5980円を銭単位で
        interval: 'year' as const,
        name: 'プレミアムプラン（年額）'
      }
    }

    const plan = planData[planId as keyof typeof planData]

    // Stripe Checkout セッション作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: plan.name,
              description: '動画学習プラットフォーム LearnHub',
            },
            unit_amount: plan.amount,
            recurring: {
              interval: plan.interval
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
    })

    console.log('Session created:', session.id) // デバッグ用
    console.log('Session URL:', session.url) // デバッグ用

    if (!session.url) {
      throw new Error('Stripe session URL not generated')
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: '決済処理でエラーが発生しました' },
      { status: 500 }
    )
  }
}