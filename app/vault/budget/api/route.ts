import { NextRequest, NextResponse } from 'next/server'
import { gets, upsert, remove } from '@/app/lib/budget'
import { BudgetType } from '@/app/types/budget'

export async function GET(req: NextRequest) {
  const data = await gets()
  return NextResponse.json({data: data})
}

export async function PATCH(req: NextRequest) {
  try {
    const data: {data:string} = await req.json()
    const items = JSON.parse(data.data)
    const res = await upsert(items)

    if(res)
      return NextResponse.json({count: items.length},{status: 200})
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
