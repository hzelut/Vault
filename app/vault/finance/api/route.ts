import { NextRequest, NextResponse } from 'next/server'
import { getsMonthly, create, update, remove } from '@/app/lib/finance'
import { FinanceType } from '@/app/types/finance'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = Number(searchParams.get('y'))
  const month = Number(searchParams.get('m'))
  const data = await getsMonthly(year, month)

  return NextResponse.json({data: data})
}

export async function PUT(req: NextRequest) {
  try {
    const { date, query }  = await req.json()
    const res = await create(date, query)

    if(res > 0)
      return NextResponse.json({id: res},{status: 200})
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  try {
    const item: FinanceType = await req.json()
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
