'use client'
import { useState } from 'react'

export function LoginForm() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`${email} で無料講座を開始します！`)
    setEmail('')
    setIsLoginOpen(false)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsLoginOpen(!isLoginOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors"
      >
        ログイン
      </button>
      
      {isLoginOpen && (
        <div className="absolute right-0 top-12 bg-white shadow-lg border rounded-lg p-4 w-80 z-10">
          <h3 className="font-semibold mb-4">無料で始める</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            />
            <button 
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-medium transition-colors"
            >
              無料講座を開始
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-2">
            登録後、すぐに無料講座をご視聴いただけます
          </p>
        </div>
      )}
    </div>
  )
}