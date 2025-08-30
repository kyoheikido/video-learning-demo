import { VideoCard } from '@/components/video-card'
import { LoginForm } from '@/components/login-form'

const sampleVideos = [
  {
    id: 1,
    title: "Next.js入門講座",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    duration: "45分",
    isFree: true
  },
  {
    id: 2,
    title: "React Hooks完全ガイド", 
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    duration: "1時間20分",
    isFree: false
  },
  {
    id: 3,
    title: "TypeScript基礎講座",
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400", 
    duration: "30分",
    isFree: true
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🎓 LearnHub</h1>
          <LoginForm />
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}