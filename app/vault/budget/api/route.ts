import { NextRequest, NextResponse } from 'next/server'
import { gets, create, update, remove } from '@/app/lib/budget'
import { BudgetType } from '@/app/types/budget'

export async function GET(req: NextRequest) {
  const data = await gets()
  return NextResponse.json({data: data})
}

export async function PUT(req: NextRequest) {
  try {
    const { category, amount }  = await req.json()
    const res = await create(category, amount)

    if(res > 0)
      return NextResponse.json({id: res},{status: 200})
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  try {
    const item: BudgetType = await req.json()
    const res = await update(item)

    if(res)
      return NextResponse.json({id: item.id},{status: 200})
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
