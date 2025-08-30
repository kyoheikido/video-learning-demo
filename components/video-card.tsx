interface Video {
  id: number
  title: string
  thumbnail: string
  duration: string
  isFree: boolean
}

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          {video.isFree ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              無料
            </span>
          ) : (
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              有料
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {video.duration}
        </div>
        {/* 再生ボタン */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full w-16 h-16 flex items-center justify-center hover:bg-white transition-all">
            <div className="text-blue-600 text-2xl">▶️</div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
        <button 
          className={`w-full py-2 px-4 rounded font-medium transition-colors ${
            video.isFree 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {video.isFree ? '今すぐ視聴' : 'プラン登録して視聴'}
        </button>
      </div>
    </div>
  )
}