import bcrypt from 'bcrypt'

import fetchQuery from '@/app/lib/database'
import { makeToken } from '@/app/utils/auth'
import * as types from '@/app/types/admin'

type AdminResult = {
  token: string
  opts?: string
  cookie_opts: unknown
}

const cookie_opts = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 60*60*24*10,
  path: '/'
}

async function updateToken(oldToken: string, newToken: string): Promise<boolean> {
  try {
    const res = await fetchQuery(
      `UPDATE ${types.TABLE} SET token=? WHERE token=? RETURNING name`,
      [newToken, oldToken]
    ) as Array<{name: string}>

    if(res.length !== 1 || res[0].name !== String(process.env.ADMIN_NAME))
      throw new Error('Failed update')

    return true
  } catch(err) {
    console.error(err)
  }

  return false
}

export async function login(name: string, passwd: string): Promise<AdminResult|null> {
  try {
    const res = await fetchQuery(
      `SELECT * FROM ${types.TABLE} WHERE name=?`,
      [name]
    ) as Array<types.AdminType>

    if(res.length !== 1 || name !== String(process.env.ADMIN_NAME))
      throw new Error(`Wrong name: ${name}`)

    const admin = res[0]
    await bcrypt.compare(passwd, admin.passwd).then(res => {
      if(!res)
        throw new Error(`Wrong passwd: ${passwd}`)
    })

    const token = await makeToken(admin.name)

    // for refresh
    fetchQuery(
      `UPDATE ${types.TABLE} SET token=? WHERE name=?`,
      [token, admin.name]
    )
    return {token: token, opts: admin.opts, cookie_opts: cookie_opts}
  } catch(err) {
    console.error(err)
  }

  return null
}

export async function logout(token:string): Promise<boolean> {
  try {
    if(!(await updateToken(token, null)))
      throw new Error('Failed logout')
    return true
  } catch(err) {
    console.error(err)
  }

  return false
}

export async function refresh(token: string): Promise<AdminResult|null> {
  try {
    const res = await fetchQuery(
      `SELECT name FROM ${types.TABLE} WHERE token=?`,
      [token]
    ) as Array<{name: string}>

    if(res.length !== 1)
      throw new Error(`Not Found token owner`)
    if(res[0].name !== String(process.env.ADMIN_NAME))
      throw new Error(`Missmatched token owner`)

    const newToken = await makeToken(res[0].name)
    if(!(await updateToken(token, newToken)))
      throw new Error('Failed refresh')
    console.log(`REFRESH ${res[0].name} TOKEN`)

    return {token:newToken, cookie_opts:cookie_opts}
  } catch(err) {
    console.error(err)
  }

  return null
}
