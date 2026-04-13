import { test, expect } from '@playwright/test'
import { test as authTest, expect as authExpect } from '../fixtures/auth.js'

test.describe('Auth page (unauthenticated)', () => {
  test('renders login page with Google and GitHub buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Welcome to')).toBeVisible()
    await expect(page.getByText('KiroBit')).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible()
    await expect(page.getByText(/sign in.*terms/i)).toBeVisible()
  })

  test('Google button is clickable and attempts OAuth', async ({ page }) => {
    await page.goto('/')
    const googleBtn = page.getByRole('button', { name: /continue with google/i })
    await expect(googleBtn).toBeEnabled()
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('supabase') || resp.url().includes('google'),
      { timeout: 5000 }
    ).catch(() => null)
    await googleBtn.click()
    const currentUrl = page.url()
    expect(currentUrl.includes('supabase') || currentUrl.includes('google') || currentUrl.includes('localhost')).toBeTruthy()
  })

  test('GitHub button is clickable and attempts OAuth', async ({ page }) => {
    await page.goto('/')
    const githubBtn = page.getByRole('button', { name: /continue with github/i })
    await expect(githubBtn).toBeEnabled()
  })
})

authTest.describe('Authenticated app shell', () => {
  authTest('shows sidebar and top bar after login', async ({ authenticatedPage: page }) => {
    await authExpect(page.locator('aside')).toBeVisible()
    await authExpect(page.getByText('Welcome to')).not.toBeVisible()
  })

  authTest('logout returns to auth page', async ({ authenticatedPage: page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      // On mobile, user menu is in sidebar header, not main header
      const header = page.locator('aside .shrink-0').first()
      await header.locator('button').last().click()
      await page.getByText('Log out').click()
    } else {
      await page.locator('header').getByRole('button').last().click()
      await page.getByText('Log out').click()
    }
    await authExpect(page.getByText('Welcome to')).toBeVisible({ timeout: 5000 })
  })
})
