import { test, expect } from '../fixtures/auth.js'

test.describe('Theme', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      test.skip(true, 'Theme toggle via header menu is desktop-only; mobile uses sidebar menu')
    }
  })

  test('default theme is dark', async ({ authenticatedPage: page }) => {
    const theme = await page.locator('html').getAttribute('data-theme')
    expect(theme).toBe('dark')
  })

  test('toggle to light theme', async ({ authenticatedPage: page }) => {
    await page.locator('header').getByRole('button').last().click()
    await page.getByText('Light mode').click()
    const theme = await page.locator('html').getAttribute('data-theme')
    expect(theme).toBe('light')
  })

  test('theme persists across page reload', async ({ authenticatedPage: page }) => {
    await page.locator('header').getByRole('button').last().click()
    await page.getByText('Light mode').click()
    expect(await page.locator('html').getAttribute('data-theme')).toBe('light')

    await page.reload()
    await page.waitForSelector('aside', { timeout: 10_000 })
    expect(await page.locator('html').getAttribute('data-theme')).toBe('light')
  })

  test('toggling back to dark works', async ({ authenticatedPage: page }) => {
    await page.locator('header').getByRole('button').last().click()
    await page.getByText('Light mode').click()
    expect(await page.locator('html').getAttribute('data-theme')).toBe('light')

    await page.locator('header').getByRole('button').last().click()
    await page.getByText('Dark mode').click()
    expect(await page.locator('html').getAttribute('data-theme')).toBe('dark')
  })

  test('localStorage stores theme after toggle', async ({ authenticatedPage: page }) => {
    const initialStored = await page.evaluate(() => localStorage.getItem('app-theme'))
    expect(initialStored === null || initialStored === 'dark').toBeTruthy()

    await page.locator('header').getByRole('button').last().click()
    await page.getByText('Light mode').click()

    const storedAfter = await page.evaluate(() => localStorage.getItem('app-theme'))
    expect(storedAfter).toBe('light')
  })
})
