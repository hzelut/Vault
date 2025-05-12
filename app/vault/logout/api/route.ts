import { NextRequest, NextResponse } from 'next/server'
import { logout } from '@/app/lib/admin'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if(!token || !(await logout(token)))
      throw new Error('Failed logout')
    const response = NextResponse.json({}, {status: 200})
    response.cookies.set('token', '', {maxAge: 0})
    return response
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}
