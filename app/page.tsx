'use client'
import { useState, useEffect } from 'react'
import { VideoCard } from '@/components/video-card'
import { LoginForm } from '@/components/login-form'
import { supabase } from '@/lib/supabase'

interface Video {
  id: number
  title: string
  thumbnail: string
  duration: string
  isFree: boolean
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  // 動画データを取得
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('id, title, thumbnail_url, duration, is_free')
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        // データ変換（VideoCard の型に合わせる）
        const transformedVideos = (data || []).map(video => ({
          id: video.id,
          title: video.title,
          thumbnail: video.thumbnail_url,  // thumbnail_url → thumbnail
          duration: video.duration,
          isFree: video.is_free           // is_free → isFree
        }))

        setVideos(transformedVideos)
      } catch (error) {
        console.error('動画取得エラー:', error)
        // エラー時はサンプル動画を表示
        setVideos([
          {
            id: 1,
            title: "サンプル動画",
            thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
            duration: "45分",
            isFree: true
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">🎓 LearnHub</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🎓 LearnHub</h1>
          <div className="flex items-center space-x-4">
            <a href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
              🛠️ 管理画面
            </a>
            <a href="/pricing" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors">
              💳 プラン選択
            </a>
            <a href="/my-page" className="text-gray-600 hover:text-blue-600 transition-colors">
              マイページ
            </a>
            <LoginForm />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            プログラミングを学ぼう
          </h2>
          <p className="text-gray-600 mb-8">
            まずは無料講座から始めて、スキルアップしていきましょう！
          </p>
          
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📹</div>
              <p className="text-gray-600">まだ動画がアップロードされていません</p>
              <a href="/admin" className="text-blue-500 hover:text-blue-600 mt-2 inline-block">
                管理画面から動画をアップロードしてください
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}