'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { VideoPlayer } from '@/components/video-player'

interface Video {
  id: number
  title: string
  description: string
  videoUrl: string
  duration: string
  isFree: boolean
}

// サンプル動画データ
const sampleVideos: Record<string, Video> = {
  '1': {
    id: 1,
    title: "【NEW】Next.js入門講座",
    description: "Next.jsの基礎から実践まで、丁寧に解説します。React の知識がある方向けの講座です。",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "45分",
    isFree: true
  },
  '2': {
    id: 2,
    title: "React Hooks完全ガイド",
    description: "useState、useEffect、カスタムフックまで完全マスター！",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
    duration: "1時間20分",
    isFree: false
  },
  '3': {
    id: 3,
    title: "TypeScript基礎講座",
    description: "型安全なコードを書くための基礎知識を身につけましょう。",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "30分", 
    isFree: true
  }
}

export default function VideoPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState(null)
  const video = sampleVideos[params.id]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

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
  if (!video.isFree && !user) {
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
            videoUrl={video.videoUrl}
            title={video.title}
          />
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{video.title}</h1>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                video.isFree ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {video.isFree ? '無料' : '有料'}
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