'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface VideoUploaderProps {
  userId: string
}

export function VideoUploader({ userId }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    isFree: true
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ドラッグイベント
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // ドロップイベント
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('video/')) {
        setSelectedFile(file)
      } else {
        alert('動画ファイルを選択してください')
      }
    }
  }

  // ファイル選択
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('video/')) {
        setSelectedFile(file)
      } else {
        alert('動画ファイルを選択してください')
      }
    }
  }

  // アップロード処理
  const handleUpload = async () => {
    if (!selectedFile || !formData.title) {
      alert('動画ファイルとタイトルは必須です')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // ファイル名生成（タイムスタンプ + オリジナル名）
      const fileName = `${Date.now()}_${selectedFile.name}`
      const filePath = `videos/${fileName}`

      // Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, selectedFile)

      if (uploadError) {
        throw uploadError
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      // データベースに動画情報を保存
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title: formData.title,
          description: formData.description,
          video_url: urlData.publicUrl,
          thumbnail_url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400`, // 仮のサムネイル
          duration: formData.duration,
          is_free: formData.isFree,
          creator_id: userId
        })

      if (dbError) {
        throw dbError
      }

      // 成功処理
      alert('動画のアップロードが完了しました！')
      setFormData({
        title: '',
        description: '',
        duration: '',
        isFree: true
      })
      setSelectedFile(null)
      setUploadProgress(100)

    } catch (error) {
      console.error('アップロードエラー:', error)
      alert('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">動画をアップロード</h2>

      {/* ドラッグ&ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div>
            <div className="text-green-600 text-4xl mb-2">✅</div>
            <p className="text-lg font-medium text-gray-800">{selectedFile.name}</p>
            <p className="text-sm text-gray-600">
              サイズ: {Math.round(selectedFile.size / 1024 / 1024)}MB
            </p>
          </div>
        ) : (
          <div>
            <div className="text-gray-400 text-4xl mb-2">📹</div>
            <p className="text-lg font-medium text-gray-800 mb-2">
              動画ファイルをドラッグ&ドロップ
            </p>
            <p className="text-sm text-gray-600 mb-4">または</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
            >
              ファイルを選択
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* フォーム */}
      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            placeholder="動画のタイトルを入力"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            placeholder="動画の説明を入力"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            動画の長さ
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            placeholder="例: 45分"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFree"
            checked={formData.isFree}
            onChange={(e) => setFormData({...formData, isFree: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
            無料動画として公開
          </label>
        </div>

        {/* アップロードボタン */}
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile || !formData.title}
          className={`w-full py-3 px-4 rounded font-medium transition-colors ${
            uploading || !selectedFile || !formData.title
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {uploading ? '📤 アップロード中...' : '📤 動画をアップロード'}
        </button>

        {/* 進捗バー */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}