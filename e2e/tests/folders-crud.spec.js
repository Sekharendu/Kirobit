import { test, expect } from '../fixtures/auth.js'

test.describe('Folders CRUD', () => {
  test('create a new folder via sidebar button', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByTitle('New folder').click()
    // Wait for an input to appear inside the sidebar for folder naming
    const folderInput = page.locator('aside input')
    await expect(folderInput.last()).toBeVisible({ timeout: 5000 })
    await folderInput.last().fill('My New Folder')
    await folderInput.last().press('Enter')
    await expect(page.locator('aside').getByText('My New Folder')).toBeVisible()
  })

  test('cancel folder creation with Escape removes temp folder', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByTitle('New folder').click()
    const folderInput = page.locator('aside input').last()
    await expect(folderInput).toBeVisible({ timeout: 5000 })
    await folderInput.press('Escape')
    // The temp folder input should be gone
    await page.waitForTimeout(300)
    // Verify original folders still exist
    await expect(page.locator('aside').getByText('Work Notes')).toBeVisible()
  })

  test('rename a folder via context menu', async ({ authenticatedPage: page }) => {
    const folderBtn = page.locator('aside button').filter({ hasText: 'Work Notes' })
    await folderBtn.click({ button: 'right' })
    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })
    await menu.getByRole('menuitem', { name: 'Rename' }).click()
    const renameInput = page.locator('aside input').last()
    await expect(renameInput).toBeVisible({ timeout: 5000 })
    await renameInput.fill('Renamed Folder')
    await renameInput.press('Enter')
    await expect(page.locator('aside').getByText('Renamed Folder')).toBeVisible()
  })

  test('delete a folder via context menu shows confirmation', async ({ authenticatedPage: page }) => {
    page.on('dialog', (dialog) => dialog.accept())
    const folderBtn = page.locator('aside button').filter({ hasText: 'Personal' })
    await folderBtn.click({ button: 'right' })
    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible({ timeout: 3000 })
    await menu.getByRole('menuitem', { name: 'Delete' }).click()
    await expect(page.locator('aside button').filter({ hasText: 'Personal' })).not.toBeVisible({ timeout: 5000 })
  })

  test('folder expand/collapse shows and hides notes', async ({ authenticatedPage: page }) => {
    const folderBtn = page.locator('aside').getByText('Work Notes')
    await folderBtn.click()
    await expect(page.locator('aside').getByText('Meeting Agenda')).toBeVisible()
    await expect(page.locator('aside').getByText('API Design Draft')).toBeVisible()

    await folderBtn.click()
    await expect(page.locator('aside').getByText('Meeting Agenda')).not.toBeVisible()
  })
})
