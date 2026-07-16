import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET daily pulse — by date or all
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (date) {
    const pulse = await db.dailyPulse.findUnique({ where: { date } })
    return NextResponse.json(pulse || null)
  }

  const pulses = await db.dailyPulse.findMany({
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(pulses)
}

// UPSERT daily pulse
export async function PUT(request: Request) {
  const body = await request.json()
  const { date, focus, routines, friction, committed } = body

  const existing = await db.dailyPulse.findUnique({ where: { date } })

  if (existing) {
    const updated = await db.dailyPulse.update({
      where: { date },
      data: { focus, routines, friction, committed },
    })
    return NextResponse.json(updated)
  } else {
    const created = await db.dailyPulse.create({
      data: { date, focus, routines, friction, committed },
    })
    return NextResponse.json(created)
  }
}