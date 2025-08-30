import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const plans = {
  monthly: {
    priceId: 'price_monthly', // 後で実際のPrice IDに変更
    amount: 980,
    name: 'ベーシックプラン（月額）'
  },
  yearly: {
    priceId: 'price_yearly', // 後で実際のPrice IDに変更  
    amount: 5980,
    name: 'プレミアムプラン（年額）'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()
    
    if (!plans[planId as keyof typeof plans]) {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 })
    }

    const plan = plans[planId as keyof typeof plans]

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
            recurring: planId === 'monthly' ? {
              interval: 'month'
            } : {
              interval: 'year'
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
      customer_email: '', // 後でユーザー情報と連携
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: '決済処理でエラーが発生しました' },
      { status: 500 }
    )
  }
}