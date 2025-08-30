'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const watchHistory = [
    {
      id: 1,
      title: "Next.js入門講座",
      watchedAt: "2025-08-30",
      progress: 100,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300"
    },
    {
      id: 2,
      title: "TypeScript基礎講座", 
      watchedAt: "2025-08-29",
      progress: 65,
      thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=300"
    }
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ログインが必要です</h2>
<Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
  ホームに戻る
</Link>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">🎓 LearnHub</Link>
          <div className="text-sm text-gray-600">
            マイページ
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* プロフィール */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">プロフィール</h2>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.email?.split('@')[0]}さん</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-green-600">✅ 認証済みアカウント</p>
            </div>
          </div>
        </section>

        {/* 視聴履歴 */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">視聴履歴</h2>
          <div className="space-y-4">
            {watchHistory.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <Image 
  src={item.thumbnail} 
  alt={item.title}
  width={80}
  height={48}
  className="w-20 h-12 object-cover rounded"
/>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">視聴日: {item.watchedAt}</p>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{item.progress}% 完了</p>
                  </div>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
                  続きを見る
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}