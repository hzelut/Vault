import { NextRequest, NextResponse } from 'next/server'
import {} from '@/app/types/note'
import { gets, create } from '@/app/lib/note'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const data = await gets()

  return NextResponse.json({data: data})
}

export async function PUT(req: NextRequest) {
  try {
    const { title }  = await req.json()
    const res = await create(title)

    if(res > 0)
      return NextResponse.json({id: res},{status: 200})
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}
