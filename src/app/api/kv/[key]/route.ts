import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { db } from '~/server/db'
import { kvStore } from '~/server/db/schema'

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  const { key } = params

  try {
    const result = await db.select().from(kvStore).where(eq(kvStore.key, key))
    if (result.length > 0 && result[0]) {
      const parsedValue = JSON.parse(result[0].value) as unknown
      return NextResponse.json({ value: parsedValue })
    }

    return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  } catch (error) {
    console.error('Error retrieving value:', error)
    return NextResponse.json({ error: 'Error retrieving value' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { key: string } }) {
  const { key } = params

  try {
    const body = (await request.json()) as { value?: unknown }
    const { value } = body
    if (value === undefined) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 })
    }
    await db
      .insert(kvStore)
      .values({ key, value: JSON.stringify(value) })
      .onConflictDoUpdate({
        target: kvStore.key,
        set: { value: JSON.stringify(value) },
      })
    return NextResponse.json({ message: 'Value set successfully' })
  } catch (error) {
    console.error('Error setting value:', error)
    return NextResponse.json({ error: 'Error setting value' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { key: string } }) {
  const { key } = params

  try {
    await db.delete(kvStore).where(eq(kvStore.key, key))
    return NextResponse.json({ message: 'Value deleted successfully' })
  } catch (error) {
    console.error('Error deleting value:', error)
    return NextResponse.json({ error: 'Error deleting value' }, { status: 500 })
  }
}
