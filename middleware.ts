import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/app/utils/auth'
import fetchAPI from '@/app/utils/api'

export async function middleware(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if(!token)
      throw new Error('Not found token')

    const res = await verifyToken(token)
    if(!res || !res.success)
      throw new Error('Failed varify token')

    const response = NextResponse.next()

    // refresh
    if(res.expire) {
      await fetchAPI(`http://${req.nextUrl.host}/blog/login/api`, {
        method: 'PATCH',
      data: {token: token}
      })
      .then(res => {
        if(!('token' in res))
          throw new Error('Failed refresh')

        response.cookies.set('token', res.token, res.cookie_opts)
      })
    }

    return response
  } catch(err) {
    console.error(err)
  }
  return NextResponse.redirect(new URL('/blog', req.url))
}

export const config = {
  matcher: '/vault/:path*'
}
