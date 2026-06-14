import { track } from '@vercel/analytics/react'

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

export async function apiWithRetry(fn, key) {
  let lastError
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await fn()
      if (!error) return { data, error: null, permanent: false }
      lastError = error
      console.error(`[apiWithRetry] attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for "${key}":`, error)
    } catch (err) {
      lastError = err
      console.error(`[apiWithRetry] attempt ${attempt + 1}/${MAX_RETRIES + 1} threw for "${key}":`, err)
    }
    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 300
      await new Promise(r => setTimeout(r, delay))
    }
  }
  track('api_permanent_failure', { key })
  console.error(`[apiWithRetry] all retries exhausted for "${key}"`)
  return { data: null, error: lastError, permanent: true }
}
