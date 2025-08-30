'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { VideoPlayer } from '@/components/video-player'
import type { User } from '@supabase/supabase-js'

interface Video {
  id: number
  title: string
  description: string
  video_url: string
  duration: string
  is_free: boolean
}

export default function VideoPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const getVideo = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) {
          throw error
        }

        setVideo(data)
      } catch (error) {
        console.error('動画取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
    getVideo()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">動画が見つかりません</h2>
          <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  // 有料動画でログインしていない場合
  if (!video.is_free && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">この動画は有料プランのコンテンツです</p>
          <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
            ログインする
          </Link>
        </div>
      </div>
    )
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

      {/* 動画プレーヤー */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <VideoPlayer 
            videoUrl={video.video_url}
          />
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{video.title}</h1>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                video.is_free ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {video.is_free ? '無料' : '有料'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{video.description}</p>
            
            <div className="flex items-center text-sm text-gray-500">
              <span>📹 {video.duration}</span>
              <span className="mx-2">•</span>
              <span>👤 プログラミング講師</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}