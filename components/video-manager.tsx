'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface Video {
  id: number
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: string
  is_free: boolean
  created_at: string
}

interface VideoManagerProps {
  userId: string
}

export function VideoManager({ userId }: VideoManagerProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)

  // 動画一覧取得
  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setVideos(data || [])
    } catch (error) {
      console.error('動画取得エラー:', error)
      alert('動画一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 動画削除
  const handleDelete = async (videoId: number, videoUrl: string) => {
    if (!confirm('本当に削除しますか？')) {
      return
    }

    try {
      // データベースから削除
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (dbError) {
        throw dbError
      }

      // ストレージから削除（URLからファイルパスを抽出）
      const filePath = videoUrl.split('/').slice(-2).join('/')
      await supabase.storage.from('videos').remove([filePath])

      // 状態更新
      setVideos(videos.filter(video => video.id !== videoId))
      alert('動画を削除しました')

    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  // 動画更新
  const handleUpdate = async (video: Video) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: video.title,
          description: video.description,
          duration: video.duration,
          is_free: video.is_free
        })
        .eq('id', video.id)

      if (error) {
        throw error
      }

      // 状態更新
      setVideos(videos.map(v => v.id === video.id ? video : v))
      setEditingVideo(null)
      alert('動画情報を更新しました')

    } catch (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました')
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">動画管理</h2>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📹</div>
          <p className="text-gray-600">まだ動画がアップロードされていません</p>
          <p className="text-sm text-gray-500 mt-2">
            「動画アップロード」タブから最初の動画をアップロードしましょう
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg p-4">
              {editingVideo?.id === video.id ? (
                // 編集モード
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={editingVideo.title}
                      onChange={(e) => setEditingVideo({
                        ...editingVideo,
                        title: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      説明
                    </label>
                    <textarea
                      value={editingVideo.description}
                      onChange={(e) => setEditingVideo({
                        ...editingVideo,
                        description: e.target.value
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        動画の長さ
                      </label>
                      <input
                        type="text"
                        value={editingVideo.duration}
                        onChange={(e) => setEditingVideo({
                          ...editingVideo,
                          duration: e.target.value
                        })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingVideo.is_free}
                          onChange={(e) => setEditingVideo({
                            ...editingVideo,
                            is_free: e.target.checked
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          無料動画
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(editingVideo)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      💾 保存
                    </button>
                    <button
                      onClick={() => setEditingVideo(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                    >
                      ❌ キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className="flex items-start space-x-4">
                  <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    width={120}
                    height={68}
                    className="rounded object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          {video.title}
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            video.is_free
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {video.is_free ? '無料' : '有料'}
                          </span>
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {video.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <span>📹 {video.duration}</span>
                          <span className="mx-2">•</span>
                          <span>📅 {new Date(video.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingVideo(video)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                        >
                          ✏️ 編集
                        </button>
                        <button
                          onClick={() => handleDelete(video.id, video.video_url)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                        >
                          🗑️ 削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}