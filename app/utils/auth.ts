import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)

type VerifyResult = {
  success: boolean
  expire: boolean
}

export async function makeToken(name: string): Promise<string> {
  return await new SignJWT({name: name})
    .setProtectedHeader({alg: String(process.env.AUTH_ALG)})
    .setExpirationTime('7 days')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<VerifyResult> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if('name' in payload
       && payload.name === String(process.env.ADMIN_NAME)) {
         return {success:true, expire:false}
       }
  } catch(err) {
    if(err !== null
       && typeof err === 'object'
       && 'code' in err
       && err.code === 'ERR_JWT_EXPIRED') {
         console.log('Expired token')
         return {success:true, expire:true}
       }
    else
      console.error(err)
  }
  return {success:false, expire:false}
}
