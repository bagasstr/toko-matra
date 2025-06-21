import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
  })
}
