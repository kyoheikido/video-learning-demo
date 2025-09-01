import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log('=== API開始 ===')
    console.log('APIキー存在確認:', !!process.env.RESEND_API_KEY)
    console.log('APIキー先頭:', process.env.RESEND_API_KEY?.substring(0, 8))

    const body = await request.json()
    console.log('リクエストボディ:', body)

    const { to, subject, userData } = body

    if (!to || !subject) {
      console.log('必須パラメータ不足:', { to: !!to, subject: !!subject })
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    console.log('メール送信開始...')

    const emailData = {
      from: 'Acme <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3B82F6;">テストメール送信成功!</h1>
          <p>こんにちは、${userData?.name || 'ユーザー'}さん</p>
          <p>LearnHubのメール配信機能が正常に動作しています。</p>
        </div>
      `,
    }

    console.log('送信データ:', emailData)

    const { data, error } = await resend.emails.send(emailData)

    console.log('Resend レスポンス:')
    console.log('- data:', data)
    console.log('- error:', error)

    if (error) {
      console.error('Resend エラー詳細:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Resendエラー', 
        details: error,
        resendError: true 
      }, { status: 500 })
    }

    console.log('=== 送信成功 ===')
    return NextResponse.json({ success: true, data, debug: 'メール送信成功' })

  } catch (error) {
    console.error('=== キャッチエラー ===')
    console.error('エラータイプ:', typeof error)
    console.error('エラー内容:', error)
    console.error('エラースタック:', error instanceof Error ? error.stack : 'スタックなし')
    
    return NextResponse.json({ 
      error: 'APIエラー', 
      details: error instanceof Error ? error.message : String(error),
      caught: true
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Email API is working', 
    hasApiKey: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8)
  })
}