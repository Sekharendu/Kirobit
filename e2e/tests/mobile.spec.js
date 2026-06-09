import { test, expect } from '../fixtures/auth.js'

test.describe('Mobile Layout', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (testInfo.project.name !== 'mobile') {
      test.skip(true, 'Mobile-only test')
    }
  })

  test('app starts showing sidebar on mobile', async ({ authenticatedPage: page }) => {
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
  })

  test('tapping a note switches to editor view', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Quick Thought').click()
    const titleInput = page.locator('input[placeholder="Untitled"]')
    await expect(titleInput).toBeVisible({ timeout: 5000 })
    await expect(titleInput).toHaveValue('Quick Thought')
  })

  test('back button returns to sidebar view', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Quick Thought').click()
    await expect(page.locator('input[placeholder="Untitled"]')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /back to notes/i }).click()
    await expect(page.locator('aside')).toBeVisible()
  })

  test('mobile search bar is in sidebar, not header', async ({ authenticatedPage: page }) => {
    const sidebarSearch = page.locator('aside input[placeholder*="Search"]')
    await expect(sidebarSearch).toBeVisible()
  })

  test('mobile search shows results overlay', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('aside input[placeholder*="Search"]')
    await searchInput.fill('Meeting')
    await expect(page.locator('aside').getByText('Meeting Agenda')).toBeVisible({ timeout: 3000 })
  })

  test('mobile tab switcher shows All and Favorites pills', async ({ authenticatedPage: page }) => {
    await expect(page.locator('aside').getByText('All')).toBeVisible()
    await expect(page.locator('aside').getByText('Favorites')).toBeVisible()
  })

  test('mobile favorites tab filters notes', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Favorites').click()
    await expect(page.locator('aside').getByText('Meeting Agenda')).toBeVisible()
    await expect(page.locator('aside').getByText('Quick Thought')).toBeVisible()
    await expect(page.locator('aside').getByText('API Design Draft')).not.toBeVisible()
  })

  test('three-dot menu on mobile note row opens context menu', async ({ authenticatedPage: page }) => {
    const noteRow = page.locator('aside button').filter({ hasText: 'Quick Thought' })
    const moreBtn = noteRow.locator('button').last()
    await moreBtn.click()
    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })
  })

  test('mobile user menu in sidebar header', async ({ authenticatedPage: page }) => {
    // The user avatar/button in sidebar header area
    const header = page.locator('aside .shrink-0').first()
    // Click the last button in header (avatar)
    await header.locator('button').last().click()
    await expect(page.getByText('Log out')).toBeVisible({ timeout: 3000 })
  })

  test('favorite and delete buttons in mobile editor topbar', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Quick Thought').click()
    await expect(page.locator('input[placeholder="Untitled"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('header').getByTitle(/favourites/i)).toBeVisible()
    await expect(page.locator('header').getByTitle('Delete note')).toBeVisible()
  })
})
