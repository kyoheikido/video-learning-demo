'use client'
import { useState, useRef, useEffect } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // 再生/一時停止
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // シークバー操作
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (video) {
      const newTime = (parseFloat(e.target.value) / 100) * duration
      video.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // 音量調整
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  // フルスクリーン
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 動画イベント
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  // コントロール表示/非表示
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    if (isPlaying) {
      timeoutId = setTimeout(() => setShowControls(false), 3000)
    }

    return () => clearTimeout(timeoutId)
  }, [isPlaying, showControls])

  return (
    <div 
      className="relative bg-black aspect-video"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* 動画要素 */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onClick={togglePlay}
      />

      {/* 中央再生ボタン */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full w-20 h-20 flex items-center justify-center transition-all"
          >
            <div className="text-blue-600 text-3xl ml-1">▶️</div>
          </button>
        </div>
      )}

      {/* コントロールバー */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* シークバー */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* コントロールボタン */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 再生/一時停止 */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? (
                  <div className="text-2xl">⏸️</div>
                ) : (
                  <div className="text-2xl">▶️</div>
                )}
              </button>

              {/* 音量 */}
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 時間表示 */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* フルスクリーン */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors text-lg"
              >
                📺
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}