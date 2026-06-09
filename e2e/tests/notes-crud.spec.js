import { test, expect } from '../fixtures/auth.js'

test.describe('Notes CRUD', () => {
  test('create a new note via sidebar button', async ({ authenticatedPage: page }) => {
    // Use the exact "New note" button (not "New note in folder" buttons)
    await page.locator('aside').getByRole('button', { name: 'New note', exact: true }).click()
    await expect(page.locator('aside').getByText('Untitled')).toBeVisible({ timeout: 5000 })
    const titleInput = page.locator('input[placeholder="Untitled"]')
    await expect(titleInput).toBeVisible()
  })

  test('rename a note by editing the title input', async ({ authenticatedPage: page }) => {
    // Quick Thought is a standalone note (no folder needed)
    await page.locator('aside').getByText('Quick Thought').click()
    const titleInput = page.locator('input[placeholder="Untitled"]')
    await expect(titleInput).toHaveValue('Quick Thought')
    await titleInput.fill('Updated Thought Title')
    await expect(titleInput).toHaveValue('Updated Thought Title')
  })

  test('note content is editable in TipTap', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Quick Thought').click()
    const editor = page.locator('.tiptap')
    await expect(editor).toBeVisible()
    await editor.click()
    await page.keyboard.press('End')
    await page.keyboard.type(' — updated content')
    await expect(editor).toContainText('updated content')
  })

  test('delete a note shows confirmation and removes it', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Standalone Note').click()
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByTitle('Delete note').click()
    await expect(page.locator('aside').getByText('Standalone Note')).not.toBeVisible({ timeout: 5000 })
  })

  test('create note inside a specific folder', async ({ authenticatedPage: page }) => {
    // Expand Work Notes folder
    await page.locator('aside').getByText('Work Notes').click()
    // Click the "+" for that folder (the New note in folder button)
    await page.locator('aside').getByTitle('New note in folder').first().click()
    await expect(page.locator('aside').getByText('Untitled')).toBeVisible({ timeout: 5000 })
  })
})
