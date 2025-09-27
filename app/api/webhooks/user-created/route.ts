import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Webhook認証（セキュリティ）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const webhookData = await request.json()
    console.log('Webhook受信:', webhookData)

    // 新規ユーザー情報取得
    const { record } = webhookData
    const userEmail = record.email
    const userId = record.id

    if (!userEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 })
    }

    // ウェルカムメールテンプレート取得（デバッグ強化版）
    console.log('テンプレート検索開始...')
    
    const { data: templates, error: templateError } = await supabase
      .from('email_templates')
      .select('*')

    console.log('全テンプレート:', templates)
    console.log('テンプレート取得エラー:', templateError)

    if (templateError) {
      console.error('テンプレート取得エラー:', templateError)
      return NextResponse.json({ error: 'Template query failed' }, { status: 500 })
    }

    // welcome かつ active なテンプレートを検索
    const template = templates?.find(t => 
      t.template_type === 'welcome' && 
      t.is_active === true
    )

    console.log('見つかったウェルカムテンプレート:', template)

    if (!template) {
      console.log('ウェルカムメールテンプレートが見つかりません')
      console.log('利用可能なテンプレート types:', templates?.map(t => t.template_type))
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // ユーザー名取得（メールアドレスの@より前）
    const userName = userEmail.split('@')[0]

    // 変数置換
    const subject = template.subject
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{user_email\}\}/g, userEmail)

    const htmlContent = template.html_content
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{user_email\}\}/g, userEmail)
      .replace(/\{\{site_url\}\}/g, process.env.NEXTAUTH_URL || 'https://video-learning-demo.vercel.app')

    console.log('メール送信準備完了:', { to: userEmail, subject })

    // テスト環境ではk.kido@tms-partners.comに送信
    const sendToEmail = 'k.kido@tms-partners.com'

    // ウェルカムメール送信
    const { data, error } = await resend.emails.send({
      from: 'LearnHub <onboarding@resend.dev>',
      to: [sendToEmail],
      subject: `[新規登録通知] ${subject}`,
      html: `
        <div style="background-color: #f0f9ff; padding: 20px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
          <h3>新規ユーザー登録通知</h3>
          <p><strong>登録者:</strong> ${userEmail}</p>
          <p><strong>ユーザーID:</strong> ${userId}</p>
          <p><strong>登録日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
        </div>
        ${htmlContent}
      `,
    })

    if (error) {
      console.error('メール送信エラー:', error)
      throw error
    }

    console.log('ウェルカムメール送信成功:', data)

    // 送信履歴記録（オプション）
    try {
      await supabase.from('email_logs').insert({
        user_id: userId,
        email: userEmail,
        template_type: 'welcome',
        subject: subject,
        sent_at: new Date().toISOString()
      })
    } catch (logError) {
      console.error('送信履歴記録エラー:', logError)
      // ログ記録失敗は無視
    }

    return NextResponse.json({ 
      success: true, 
      message: 'ウェルカムメール送信完了',
      emailId: data?.id,
      sentTo: sendToEmail
    })

  } catch (error) {
    console.error('Webhook処理エラー:', error)
    return NextResponse.json({ 
      error: 'Webhook処理に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Webhook確認用GET
export async function GET() {
  return NextResponse.json({ 
    message: 'User creation webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}