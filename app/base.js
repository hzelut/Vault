async function fetchApi(method, path='', formData=null, data=null, params=null) {
  const opts = {method}
  let headers = null
  let body = null
  let url = `/api${path}`

  if(formData) {
    opts.body = formData
  }
  else if(data) {
    opts.headers = {'Content-Type':'application/json'}
    opts.body = JSON.stringify(data)
  }

  if(params) {
    const p = new URLSearchParams(params)
    url += `?${p.toString()}`
  }

  const res = await fetch(url, opts)
  if(!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }

  return await res.json()
}
