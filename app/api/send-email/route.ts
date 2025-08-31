import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // APIキー確認
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not found' }, { status: 500 })
    }

    const body = await request.json()
    const { to, subject, userData } = body

    if (!to || !subject) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    // シンプルなテストメール
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resendの認証済みドメイン
      to: [to],
      subject: subject,
      html: `
        <h1>テストメール送信成功!</h1>
        <p>こんにちは、${userData?.name || 'ユーザー'}さん</p>
        <p>LearnHubのメール配信機能が正常に動作しています。</p>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'メール送信エラー', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Email API is working', hasApiKey: !!process.env.RESEND_API_KEY })
}