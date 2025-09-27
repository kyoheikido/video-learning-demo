import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { triggerType, userId, userEmail } = await request.json()

    // ユーザー情報取得
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    const userName = user?.user?.email?.split('@')[0] || 'ユーザー'

    // トリガー別テンプレート取得
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', triggerType)
      .eq('is_active', true)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'テンプレートが見つかりません' }, { status: 404 })
    }

    // 変数置換
    const subject = template.subject
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{user_email\}\}/g, userEmail)

    const htmlContent = template.html_content
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{user_email\}\}/g, userEmail)
      .replace(/\{\{site_url\}\}/g, process.env.NEXTAUTH_URL || 'https://video-learning-demo.vercel.app')

    // メール送信
    const { data, error } = await resend.emails.send({
      from: 'LearnHub <onboarding@resend.dev>',
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    })

    if (error) {
      throw error
    }

    // 送信履歴記録
    await supabase.from('email_logs').insert({
      user_id: userId,
      email: userEmail,
      template_type: triggerType,
      subject: subject,
      sent_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('自動メール送信エラー:', error)
    return NextResponse.json({ error: '自動メール送信に失敗しました' }, { status: 500 })
  }
}