'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import fetchAPI from '@/app/utils/api'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      await fetchAPI('logout/api', {
        method: 'POST',
      })
      .then(res => {
        if(res)
          router.push('/blog')
      })
    }

    logout()
  }, [router])

  return (<></>)
}
