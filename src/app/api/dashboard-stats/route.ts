import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/app/actions/dashboardAction'

export async function GET() {
  const stats = await getDashboardStats()
  return NextResponse.json(stats)
}
