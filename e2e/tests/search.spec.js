import { test, expect } from '../fixtures/auth.js'

test.describe('Search (desktop)', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      test.skip(true, 'Desktop-only search — mobile search is tested in mobile.spec.js')
    }
  })

  test('search filters notes by title', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]')
    await searchInput.fill('Meeting')
    await expect(page.locator('header').getByText('Meeting Agenda')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('header').getByText('Shopping List')).not.toBeVisible()
  })

  test('search filters notes by content', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]')
    await searchInput.fill('quarterly goals')
    await expect(page.locator('header').getByText('Meeting Agenda')).toBeVisible({ timeout: 3000 })
  })

  test('clicking search result selects note and clears search', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]')
    await searchInput.fill('Shopping')
    const result = page.locator('header').getByText('Shopping List')
    await expect(result).toBeVisible({ timeout: 3000 })
    await result.click()
    await expect(searchInput).toHaveValue('')
    await expect(page.locator('input[placeholder="Untitled"]')).toHaveValue('Shopping List')
  })

  test('no results message for unmatched query', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]')
    await searchInput.fill('xyznonexistent')
    await expect(page.locator('header').getByText('No results found')).toBeVisible({ timeout: 3000 })
  })

  test('Ctrl+K focuses search input', async ({ authenticatedPage: page }) => {
    await page.keyboard.press('Control+k')
    const searchInput = page.locator('header input[placeholder*="Search"]')
    await expect(searchInput).toBeFocused()
  })

  test('clear button resets search', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]')
    await searchInput.fill('Meeting')
    await expect(page.locator('header').getByText('Meeting Agenda')).toBeVisible({ timeout: 3000 })
    // Click X button to clear
    const clearBtn = page.locator('header .relative').locator('button').last()
    await clearBtn.click()
    await expect(page.locator('header').getByText('Meeting Agenda')).not.toBeVisible({ timeout: 3000 })
  })
})
