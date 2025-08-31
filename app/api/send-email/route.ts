import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log('API called')

    const body = await request.json()
    console.log('Request body:', body)

    const { to, subject, template, userData } = body

    if (!to || !subject) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    // 簡単なメール送信テスト
    const { data, error } = await resend.emails.send({
      from: 'LearnHub <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3B82F6;">テストメール</h1>
          <p>こんにちは、${userData?.name || 'ユーザー'}さん</p>
          <p>メール配信機能のテストです。</p>
          <p>このメールが届いていれば、システムは正常に動作しています！</p>
        </div>
      `,
    })

    console.log('Resend response:', { data, error })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'メール送信に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Email API is working' })
}