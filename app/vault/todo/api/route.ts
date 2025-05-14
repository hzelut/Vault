import { NextRequest, NextResponse } from 'next/server'
import { create, gets, update, done, remove } from '@/app/lib/todo'
import { TodoType, TodoCategory } from '@/app/types/todo'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('a') as TodoCategory
  const data = await gets(action)

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

export async function PATCH(req: NextRequest) {
  try {
    const item: TodoType = await req.json()
    const res = await update(item)

    if(res)
      return NextResponse.json({id: item.id},{status: 200})
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  try {
    const { id }  = await req.json()
    const res = await done(id)

    if(res !== 0)
      return NextResponse.json({done: res},{status: 200})
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  try {
    const { id }  = await req.json()
    const res = await remove(id)

    if(res)
      return NextResponse.json({id: id},{status: 200})
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}
