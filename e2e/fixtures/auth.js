import { test as base } from '@playwright/test'
import { TEST_USER, TEST_FOLDERS, TEST_NOTES } from './test-data.js'

const SUPABASE_URL = 'https://dahanwpqjtlmftapnvsc.supabase.co'

function buildSessionPayload() {
  return {
    access_token: 'fake-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'fake-refresh-token',
    user: TEST_USER,
  }
}

/**
 * Extends the base Playwright test with an `authenticatedPage` fixture that:
 * 1. Seeds localStorage with a fake Supabase auth token
 * 2. Intercepts all Supabase REST/Auth API calls and returns mock data
 *
 * Each test gets its own mutable copy of notes/folders so mutations are isolated.
 */
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    let localNotes = structuredClone(TEST_NOTES)
    let localFolders = structuredClone(TEST_FOLDERS)
    const session = buildSessionPayload()

    // Seed auth token into localStorage before any navigation
    await page.addInitScript((sessionStr) => {
      localStorage.setItem(
        'sb-dahanwpqjtlmftapnvsc-auth-token',
        sessionStr,
      )
    }, JSON.stringify(session))

    // --- Auth endpoints ---
    await page.route(`${SUPABASE_URL}/auth/v1/token*`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) })
    })

    await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TEST_USER) })
    })

    await page.route(`${SUPABASE_URL}/auth/v1/logout`, (route) => {
      route.fulfill({ status: 204, body: '' })
    })

    // --- REST: folders ---
    await page.route(`${SUPABASE_URL}/rest/v1/folders*`, (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(localFolders),
        })
      }
      if (method === 'POST') {
        const body = route.request().postDataJSON()
        const items = Array.isArray(body) ? body : [body]
        const created = items.map((item) => ({
          id: `folder-new-${Date.now()}`,
          user_id: TEST_USER.id,
          created_at: new Date().toISOString(),
          ...item,
        }))
        localFolders.push(...created)
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created.length === 1 ? created[0] : created),
        })
      }
      if (method === 'PATCH') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      }
      if (method === 'DELETE') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      }
      return route.continue()
    })

    // --- REST: notes ---
    await page.route(`${SUPABASE_URL}/rest/v1/notes*`, (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(localNotes),
        })
      }
      if (method === 'POST') {
        const body = route.request().postDataJSON()
        const items = Array.isArray(body) ? body : [body]
        const created = items.map((item) => ({
          id: `note-new-${Date.now()}`,
          user_id: TEST_USER.id,
          is_favorite: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item,
        }))
        localNotes.unshift(...created)
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created.length === 1 ? created[0] : created),
        })
      }
      if (method === 'PATCH') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      }
      if (method === 'DELETE') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      }
      return route.continue()
    })

    await page.goto('/')
    // Wait for the app to be fully loaded (sidebar should be visible when authenticated)
    await page.waitForSelector('aside', { timeout: 10_000 })

    await use(page)
  },
})

export { expect } from '@playwright/test'
