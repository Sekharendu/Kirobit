import { test, expect } from '../fixtures/auth.js'

test.describe('Context Menu', () => {
  test('right-click note shows context menu with all actions', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Work Notes').click()
    await page.locator('aside').getByText('Meeting Agenda').click({ button: 'right' })

    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })
    await expect(menu.getByText('Add to Favourites').or(menu.getByText('Remove from Favourites'))).toBeVisible()
    await expect(menu.getByText('Rename')).toBeVisible()
    await expect(menu.getByText('Move to...')).toBeVisible()
    await expect(menu.getByText('Delete')).toBeVisible()
  })

  test('right-click folder shows context menu with rename and delete', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Work Notes').click({ button: 'right' })

    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })
    await expect(menu.getByText('Rename')).toBeVisible()
    await expect(menu.getByText('Delete')).toBeVisible()
  })

  test('Move to submenu shows folders and No folder option', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Work Notes').click()
    await page.locator('aside').getByText('Meeting Agenda').click({ button: 'right' })

    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })
    await menu.getByText('Move to...').click()

    await expect(menu.getByText('No folder')).toBeVisible()
    await expect(menu.getByText('Work Notes')).toBeVisible()
    await expect(menu.getByText('Personal')).toBeVisible()
  })

  test('context menu closes on Escape', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Work Notes').click()
    await page.locator('aside').getByText('Meeting Agenda').click({ button: 'right' })

    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
    await expect(menu).not.toBeVisible()
  })

  test('keyboard navigation in context menu', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Work Notes').click()
    await page.locator('aside').getByText('Meeting Agenda').click({ button: 'right' })

    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Escape')
    await expect(menu).not.toBeVisible()
  })

  test('multi-select notes and right-click shows bulk delete', async ({ authenticatedPage: page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      test.skip(true, 'Multi-select with Ctrl+click is desktop-only')
      return
    }

    await page.locator('aside').getByText('Work Notes').click()
    await page.locator('aside').getByText('Meeting Agenda').click()
    await page.locator('aside').getByText('API Design Draft').click({ modifiers: ['Control'] })

    await page.locator('aside').getByText('API Design Draft').click({ button: 'right' })
    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })
    await expect(menu.getByText(/Delete \d+ notes/)).toBeVisible()
  })
})
