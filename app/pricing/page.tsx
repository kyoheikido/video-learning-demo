'use client'
import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    id: 'free',
    name: '無料プラン',
    price: 0,
    period: '永久',
    features: [
      '無料講座3本視聴可能',
      'メールサポート',
      '学習進捗記録'
    ],
    buttonText: '現在のプラン',
    buttonStyle: 'bg-gray-400 cursor-not-allowed',
    popular: false
  },
  {
    id: 'monthly',
    name: 'ベーシックプラン',
    price: 980,
    period: '月',
    features: [
      '全講座無制限視聴',
      '新着講座優先アクセス',
      'チャットサポート',
      '学習証明書発行',
      'ダウンロード視聴'
    ],
    buttonText: '月額で始める',
    buttonStyle: 'bg-blue-500 hover:bg-blue-600 text-white',
    popular: true
  },
  {
    id: 'yearly',
    name: 'プレミアムプラン',
    price: 5980,
    period: '年',
    originalPrice: 11760,
    features: [
      '全講座無制限視聴',
      '新着講座優先アクセス', 
      '優先チャットサポート',
      '学習証明書発行',
      'ダウンロード視聴',
      '個別メンタリング月1回',
      'コミュニティアクセス'
    ],
    buttonText: '年額で始める（50%OFF）',
    buttonStyle: 'bg-green-500 hover:bg-green-600 text-white',
    popular: false
  }
]

export default function PricingPage() {
  const [loading, setLoading] = useState('')

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return

    setLoading(planId)
    
    try {
      // Stripe Checkout へリダイレクト
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← ホームに戻る
          </Link>
        </div>
      </header>

      {/* プランセクション */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            プランを選択してください
          </h1>
          <p className="text-xl text-gray-600">
            あなたの学習スタイルに合ったプランで始めましょう
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {/* 人気バッジ */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  🌟 最も人気
                </div>
              )}

              <div className={`p-6 ${plan.popular ? 'pt-14' : ''}`}>
                {/* プラン名 */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h3>

                {/* 価格 */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-800">
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      通常価格: ¥{plan.originalPrice.toLocaleString()}/年
                    </div>
                  )}
                </div>

                {/* 機能一覧 */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 申し込みボタン */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id || plan.id === 'free'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.buttonStyle}`}
                >
                  {loading === plan.id ? '処理中...' : plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 安心ポイント */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            🔒 SSL暗号化通信 • 💳 安全な決済処理 • 🔄 いつでも解約可能
          </p>
        </div>
      </main>
    </div>
  )
}