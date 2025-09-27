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

    // ウェルカムメールテンプレート取得
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'welcome')
      .eq('is_active', true)
      .single()

    if (!template) {
      console.log('ウェルカムメールテンプレートが見つかりません')
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

    // ウェルカムメール送信
    const { data, error } = await resend.emails.send({
      from: 'LearnHub <onboarding@resend.dev>',
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    })

    if (error) {
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
      emailId: data?.id 
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