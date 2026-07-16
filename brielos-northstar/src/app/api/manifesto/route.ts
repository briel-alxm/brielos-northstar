import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET manifesto (singleton — return first or empty)
export async function GET() {
  const manifesto = await db.manifesto.findFirst()
  if (!manifesto) {
    return NextResponse.json({
      id: '',
      goal: 'Define the Goal Here',
      purpose: "The 'Why' that survives the daily grind",
      targetDate: '2026-12-31',
      commitmentLevel: 'Absolute',
    })
  }
  return NextResponse.json(manifesto)
}

// UPSERT manifesto
export async function PUT(request: Request) {
  const body = await request.json()
  const { goal, purpose, targetDate, commitmentLevel } = body

  const existing = await db.manifesto.findFirst()

  if (existing) {
    const updated = await db.manifesto.update({
      where: { id: existing.id },
      data: { goal, purpose, targetDate, commitmentLevel },
    })
    return NextResponse.json(updated)
  } else {
    const created = await db.manifesto.create({
      data: { goal, purpose, targetDate, commitmentLevel },
    })
    return NextResponse.json(created)
  }
}