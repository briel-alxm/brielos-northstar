import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET all milestones ordered
export async function GET() {
  const milestones = await db.milestone.findMany({
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(milestones)
}

// CREATE a milestone
export async function POST(request: Request) {
  const body = await request.json()
  const { title, description } = body

  const count = await db.milestone.count()
  const milestone = await db.milestone.create({
    data: { title, description, order: count },
  })
  return NextResponse.json(milestone)
}

// BULK UPDATE milestones (reorder + toggle)
export async function PUT(request: Request) {
  const body = await request.json()
  const updates = body.map(
    (m: { id: string; order?: number; completed?: boolean; title?: string; description?: string }) =>
      db.milestone.update({ where: { id: m.id }, data: m })
  )
  const results = await db.$transaction(updates)
  return NextResponse.json(results)
}

// DELETE a milestone
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.milestone.delete({ where: { id } })
  return NextResponse.json({ success: true })
}