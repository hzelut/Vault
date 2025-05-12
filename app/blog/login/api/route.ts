import { NextRequest, NextResponse } from 'next/server'
import { login, refresh } from '@/app/lib/admin'

export async function POST(req: NextRequest) {
  try {
    const { name, passwd } = await req.json()

    if(!name || !passwd)
      throw new Error('Give me the info!!')

    const res = await login(name, passwd)

    if(!res)
      throw new Error('Failed login')

    const response = NextResponse.json({opts: res.opts}, {status: 200})
    response.cookies.set('token', res.token, res.cookie_opts)
    return response
  } catch(err) {
    console.error(err)
  }

  return NextResponse.json({ message:'Failed' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  try {
    const { token } = await req.json()
    if(!token)
      throw new Error('Give me the token')

    const res = await refresh(token)
    if(!res)
      throw new Error('Failed')

    return NextResponse.json(
      {token: res.token},
      {status: 200}
    )
  } catch(err) {
    console.error(err)
  }
  return NextResponse.json({ message:'Failed' }, { status: 400 })
}
