import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, message } = body || {}

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email mancante' }, { status: 400 })
    }

    const atIndex = email.indexOf('@')
    if (!(atIndex > 0 && atIndex < email.length - 1)) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
    }

    // Here you could integrate with email sending service (SendGrid, SMTP, etc.)
    // For now we'll just log the message on the server for debugging.
    console.log('[contact] New message received:', { name, email, message })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error in contact route:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
