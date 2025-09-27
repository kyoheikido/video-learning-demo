import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY!)

// 管理者権限でSupabaseアクセス
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    // Webhook認証
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const webhookData = await request.json()
    console.log('Webhook受信:', webhookData)

    const { record } = webhookData
    const userEmail = record.email
    const userId = record.id

    if (!userEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 })
    }

    // 管理者権限でテンプレート取得
    console.log('テンプレート検索開始...')
    
    const { data: templates, error: templateError } = await supabaseAdmin
      .from('email_templates')
      .select('*')

    console.log('全テンプレート:', templates)

    if (templateError) {
      console.error('テンプレート取得エラー:', templateError)
      return NextResponse.json({ error: 'Template query failed' }, { status: 500 })
    }

    const template = templates?.find(t => 
      t.template_type === 'welcome' && 
      t.is_active === true
    )

    if (!template) {
      console.log('ウェルカムメールテンプレートが見つかりません')
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const userName = userEmail.split('@')[0]

    const subject = template.subject
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{user_email\}\}/g, userEmail)

    const htmlContent = template.html_content
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{user_email\}\}/g, userEmail)
      .replace(/\{\{site_url\}\}/g, 'https://video-learning-demo.vercel.app')

    // k.kido@tms-partners.com に送信
    const { data, error } = await resend.emails.send({
      from: 'LearnHub <onboarding@resend.dev>',
      to: ['k.kido@tms-partners.com'],
      subject: `[新規登録] ${subject}`,
      html: `
        <div style="background: #f0f9ff; padding: 20px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
          <h3>新規ユーザー登録通知</h3>
          <p><strong>登録者:</strong> ${userEmail}</p>
          <p><strong>登録日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
        </div>
        ${htmlContent}
      `,
    })

    if (error) {
      throw error
    }

    console.log('ウェルカムメール送信成功:', data)

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

export async function GET() {
  return NextResponse.json({ 
    message: 'User creation webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}