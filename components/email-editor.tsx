'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface EmailTemplate {
  id?: number
  name: string
  subject: string
  html_content: string
  template_type: string
  is_active: boolean
}

interface EmailEditorProps {
  userId: string
}

export function EmailEditor({ userId }: EmailEditorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(true)

  const defaultTemplates = [
    {
      name: 'ウェルカムメール',
      subject: '🎓 LearnHub へようこそ！無料講座をお楽しみください',
      template_type: 'welcome',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3B82F6; text-align: center;">🎓 LearnHub へようこそ！</h1>
          
          <p>こんにちは、{{user_name}}さん</p>
          
          <p>LearnHubにご登録いただき、誠にありがとうございます！</p>
          
          <div style="background-color: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
            <h2 style="color: #1E40AF; margin-top: 0;">🎬 今すぐ始められる無料講座</h2>
            <ul style="color: #374151;">
              <li>✅ Next.js入門講座（45分）</li>
              <li>✅ TypeScript基礎講座（30分）</li>
              <li>✅ React Hooks完全ガイド（無料部分）</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{site_url}}" 
               style="background-color: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              📚 無料講座を開始する
            </a>
          </div>
          
          <div style="background-color: #FFFBEB; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E; font-size: 14px;">
              💡 <strong>学習のコツ:</strong> まずは1つの講座を完了してから次に進むことをおすすめします！
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #6B7280; font-size: 14px;">
            ご質問やサポートが必要でしたら、お気軽にお返事ください。<br>
            <strong>LearnHub サポートチーム</strong>
          </p>
        </div>
      `,
      is_active: true
    },
    {
      name: 'アップセル誘導メール',
      subject: '🌟 {{user_name}}さん、プレミアム機能で学習を加速しませんか？',
      template_type: 'upgrade_prompt',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6;">🌟 学習の進捗はいかがですか？</h1>
          
          <p>こんにちは、{{user_name}}さん</p>
          
          <p>無料講座をご視聴いただき、ありがとうございます！学習の調子はいかがでしょうか？</p>
          
          <div style="background-color: #FDF4FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
            <h2 style="color: #7C3AED; margin-top: 0;">💎 プレミアムプランの特典</h2>
            <ul style="color: #374151;">
              <li>🎬 <strong>50+の専門講座</strong>が見放題</li>
              <li>📜 <strong>学習証明書</strong>を発行</li>
              <li>💬 <strong>優先サポート</strong>でスピード解決</li>
              <li>📱 <strong>オフライン視聴</strong>でいつでもどこでも</li>
              <li>🎯 <strong>個別学習プラン</strong>をAIが作成</li>
            </ul>
          </div>
          
          <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #059669; margin-top: 0;">🎁 期間限定特別価格</h3>
            <p style="margin: 10px 0;">
              <span style="font-size: 24px; color: #DC2626; text-decoration: line-through;">¥1,980/月</span><br>
              <span style="font-size: 32px; color: #059669; font-weight: bold;">¥980/月</span>
              <span style="color: #059669; font-weight: bold;"> (50% OFF)</span>
            </p>
            <p style="color: #065F46; font-size: 14px;">※このメールから48時間限定</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{site_url}}/pricing?coupon=COMEBACK50" 
               style="background-color: #7C3AED; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px;">
              🚀 50%オフで今すぐ始める
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; text-align: center;">
            30日間返金保証 • いつでも解約可能
          </p>
        </div>
      `,
      is_active: true
    }
  ]

  // テンプレート取得
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data.length === 0) {
        // 初回時はデフォルトテンプレートを作成
        for (const template of defaultTemplates) {
          await supabase.from('email_templates').insert({
            ...template,
            creator_id: userId
          })
        }
        fetchTemplates() // 再取得
        return
      }

      setTemplates(data)
    } catch (error) {
      console.error('テンプレート取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // テンプレート保存
  const saveTemplate = async () => {
    if (!selectedTemplate) return

    try {
      if (selectedTemplate.id) {
        // 更新
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: selectedTemplate.name,
            subject: selectedTemplate.subject,
            html_content: selectedTemplate.html_content,
            template_type: selectedTemplate.template_type,
            is_active: selectedTemplate.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTemplate.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('email_templates')
          .insert({
            ...selectedTemplate,
            creator_id: userId
          })

        if (error) throw error
      }

      setIsEditing(false)
      fetchTemplates()
      alert('テンプレートを保存しました！')
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  // テスト送信
  const sendTestEmail = async () => {
    if (!selectedTemplate) return

    const testEmail = prompt('テスト送信先のメールアドレスを入力してください:')
    if (!testEmail) return

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: selectedTemplate.subject.replace('{{user_name}}', 'テストユーザー'),
          userData: {
            name: 'テストユーザー',
            email: testEmail
          }
        })
      })

      const result = await response.json()
      console.log('API Response:', result) // デバッグ用

      if (response.ok && result.success) {
        alert('テストメールを送信しました！')
      } else {
        console.error('API Error:', result)
        alert(`送信に失敗しました: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('テスト送信エラー:', error)
      alert('テスト送信に失敗しました')
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex h-96">
        {/* テンプレート一覧 */}
        <div className="w-1/3 border-r bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">📧 メールテンプレート</h3>
          
          <button
            onClick={() => {
              setSelectedTemplate({
                name: '新しいテンプレート',
                subject: '',
                html_content: '<p>ここにメール内容を入力してください</p>',
                template_type: 'custom',
                is_active: true
              })
              setIsEditing(true)
            }}
            className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
          >
            ➕ 新規テンプレート
          </button>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-white hover:bg-gray-100 border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <div className={`w-2 h-2 rounded-full ${
                    template.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{template.template_type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* エディタ部分 */}
        <div className="flex-1 p-4">
          {selectedTemplate ? (
            <>
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  {isEditing ? '✏️ 編集中' : '👁️ プレビュー'}: {selectedTemplate.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-3 py-1 rounded text-sm ${
                      previewMode 
                        ? 'bg-gray-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {previewMode ? '📝 編集' : '👁️ プレビュー'}
                  </button>
                  <button
                    onClick={sendTestEmail}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  >
                    📤 テスト送信
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {isEditing ? '💾 保存' : '✏️ 編集'}
                  </button>
                </div>
              </div>

              {/* エディタ/プレビュー */}
              {previewMode ? (
                // プレビューモード
                <div className="border rounded p-4 bg-white max-h-80 overflow-y-auto">
                  <div className="mb-4 pb-2 border-b">
                    <div className="text-sm text-gray-600">件名:</div>
                    <div className="font-medium">{selectedTemplate.subject}</div>
                  </div>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: selectedTemplate.html_content
                        .replace(/{{user_name}}/g, 'サンプルユーザー')
                        .replace(/{{site_url}}/g, 'https://video-learning-demo.vercel.app')
                    }} 
                  />
                </div>
              ) : isEditing ? (
                // 編集モード
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      テンプレート名
                    </label>
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      件名
                    </label>
                    <input
                      type="text"
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        subject: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                      placeholder="例: {{user_name}}さん、特別オファーのご案内"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HTML内容
                    </label>
                    <textarea
                      value={selectedTemplate.html_content}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        html_content: e.target.value
                      })}
                      rows={8}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                      placeholder="HTMLメール内容を入力..."
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTemplate.is_active}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          is_active: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        有効化
                      </span>
                    </label>

                    <select
                      value={selectedTemplate.template_type}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        template_type: e.target.value
                      })}
                      className="px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="welcome">ウェルカムメール</option>
                      <option value="upgrade_prompt">アップセル誘導</option>
                      <option value="retention">リテンション</option>
                      <option value="custom">カスタム</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={saveTemplate}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      💾 保存
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                      ❌ キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📧</div>
                  <p className="text-gray-600">テンプレートを選択して編集または新規作成してください</p>
                </div>
              )}

              {/* 変数ヘルプ */}
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-800 mb-2">📝 使用可能な変数</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><code>{'{{user_name}}'}</code> - ユーザー名</div>
                  <div><code>{'{{user_email}}'}</code> - メールアドレス</div>
                  <div><code>{'{{site_url}}'}</code> - サイトURL</div>
                  <div><code>{'{{unsubscribe_url}}'}</code> - 配信停止URL</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📧</div>
              <p className="text-gray-600">左側からテンプレートを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}