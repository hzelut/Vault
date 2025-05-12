type FetchOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  data?: Record<string, string | number | boolean>
  params?: Record<string, string | number | boolean>
}

function makeUrlParams(params: Record<string, string | number | boolean>): string {
  const ret = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    ret.append(key, String(value))
  })

  return ret.toString()
}

export default async function fetchAPI(url: string, options: FetchOptions) {
  try {
    const { method, data, params } = options
    let fullUrl = url
    if(params && method === 'GET')
      fullUrl = `${url}?${makeUrlParams(params)}`

    return await fetch(fullUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data? JSON.stringify(data) : null
    })
    .then(res => {
      if(!res.ok)
        return res.json().then(err => {throw err})
      return res.json()
    })
  } catch(err) {
    throw err
  }

  return null
}
