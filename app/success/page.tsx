'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    // URLからsession_idを取得
    const params = new URLSearchParams(window.location.search)
    const id = params.get('session_id')
    if (id) {
      setSessionId(id)
    }

    // ユーザー情報取得
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 成功アイコン */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-3xl">✅</span>
          </div>
        </div>

        {/* 成功メッセージ */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          決済が完了しました！
        </h1>
        
        <p className="text-gray-600 mb-6">
          おめでとうございます！プレミアムプランにアップグレードされました。
          すべての講座を無制限でご利用いただけます。
        </p>

        {/* セッション情報 */}
        {sessionId && (
          <div className="bg-gray-50 rounded p-4 mb-6">
            <p className="text-sm text-gray-600">
              決済ID: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{sessionId.slice(0, 20)}...</code>
            </p>
          </div>
        )}

        {/* ユーザー情報 */}
        {user && (
          <div className="bg-blue-50 rounded p-4 mb-6">
            <p className="text-sm text-blue-700">
              📧 {user && typeof user === 'object' && 'email' in user ? (user as { email: string }).email : 'ユーザー'} でプレミアム会員になりました
            </p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="space-y-3">
          <Link 
            href="/my-page"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded font-medium transition-colors"
          >
            マイページで学習開始
          </Link>
          
          <Link 
            href="/"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded font-medium transition-colors"
          >
            ホームに戻る
          </Link>
        </div>

        {/* サポート情報 */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-500">
            ご不明な点がございましたら、サポートまでお気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  )
}