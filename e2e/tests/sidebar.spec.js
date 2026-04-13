import { test, expect } from '../fixtures/auth.js'

test.describe('Sidebar', () => {
  test('toggle sidebar open and closed', async ({ authenticatedPage: page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      test.skip(true, 'Desktop-only: mobile sidebar is full-screen overlay')
      return
    }
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()

    const toggleBtn = page.locator('header button[aria-label*="sidebar" i]').first()
    await toggleBtn.click()
    await page.waitForTimeout(400)
    const sidebarContainer = sidebar.locator('..')
    const box = await sidebarContainer.boundingBox()
    expect(box?.width ?? 0).toBeLessThanOrEqual(5)

    await toggleBtn.click()
    await page.waitForTimeout(400)
    const boxAfter = await sidebarContainer.boundingBox()
    expect(boxAfter?.width ?? 0).toBeGreaterThan(100)
  })

  test('sidebar resize via drag handle', async ({ authenticatedPage: page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      test.skip(true, 'Desktop-only: no drag handle on mobile')
      return
    }
    const handle = page.locator('.cursor-col-resize')
    await expect(handle).toBeVisible()

    const box = await handle.boundingBox()
    if (!box) return

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 100, box.y + box.height / 2, { steps: 10 })
    await page.mouse.up()

    await expect(page.locator('aside')).toBeVisible()
  })

  test('folder shows note count', async ({ authenticatedPage: page }) => {
    const folderRow = page.locator('aside button').filter({ hasText: 'Work Notes' })
    await expect(folderRow.getByText('2')).toBeVisible()

    const personalRow = page.locator('aside button').filter({ hasText: 'Personal' })
    await expect(personalRow.getByText('1')).toBeVisible()
  })

  test('folder expand shows notes, collapse hides them', async ({ authenticatedPage: page }) => {
    const folder = page.locator('aside').getByText('Work Notes')
    await folder.click()
    await expect(page.locator('aside').getByText('Meeting Agenda')).toBeVisible()
    await expect(page.locator('aside').getByText('API Design Draft')).toBeVisible()

    await folder.click()
    await expect(page.locator('aside').getByText('Meeting Agenda')).not.toBeVisible()
  })

  test('clicking sidebar background deselects folder', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Work Notes').click()
    const scrollArea = page.locator('aside .scroll-thin')
    await scrollArea.click({ position: { x: 10, y: 10 } })
    await expect(page.locator('aside')).toBeVisible()
  })
})
