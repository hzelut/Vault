import { NextRequest, NextResponse } from 'next/server'
import { create, getInbox } from '@/app/lib/todo'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('a')
  let data = null

  switch(action) {
    case 'inbox':
      data = await getInbox()
      break
  }

  return NextResponse.json({data: data})
}

export async function PUT(req: NextRequest) {
  try {
    const { name }  = await req.json()
    const res = await create(name)

    if(res > 0)
      return NextResponse.json({id: res},{status: 200})
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}
