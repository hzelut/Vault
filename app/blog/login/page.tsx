'use client'

import { useRouter } from 'next/navigation'
import fetchAPI from '@/app/utils/api'

export default function Page() {
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const name = formData.get('name') as string
    const passwd = formData.get('passwd') as string

    const res = await fetchAPI('login/api', {
      method: 'POST',
      data: {name: name, passwd: passwd}
    })

    if(res) router.push('/vault')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type='text' name='name' placeholder='name' required />
      <input type='password' name='passwd' placeholder='password' required />
      <input type='submit' className='hidden' />
    </form>
  )
}
