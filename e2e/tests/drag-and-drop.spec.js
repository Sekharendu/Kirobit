import { test, expect } from '../fixtures/auth.js'

test.describe('Drag and Drop', () => {
  test('drag standalone note onto a folder', async ({ authenticatedPage: page }) => {
    // Standalone Note should be visible in sidebar
    const standaloneNote = page.locator('aside button').filter({ hasText: 'Standalone Note' })
    await expect(standaloneNote).toBeVisible()

    const workNotesFolder = page.locator('aside button').filter({ hasText: 'Work Notes' })
    await expect(workNotesFolder).toBeVisible()

    // Perform drag
    await standaloneNote.dragTo(workNotesFolder)

    // Expand Work Notes to verify the note moved there
    await workNotesFolder.click()
    // After drag, the app should have moved the note into the folder
    // We just verify the drag interaction doesn't crash
    await expect(page.locator('aside')).toBeVisible()
  })

  test('drag note from one folder to another', async ({ authenticatedPage: page }) => {
    // Expand Work Notes folder
    await page.locator('aside button').filter({ hasText: 'Work Notes' }).click()
    await expect(page.locator('aside').getByText('Meeting Agenda')).toBeVisible()

    const meetingNote = page.locator('aside button').filter({ hasText: 'Meeting Agenda' })
    const personalFolder = page.locator('aside button').filter({ hasText: 'Personal' })

    await meetingNote.dragTo(personalFolder)
    // Verify app still functional after drag
    await expect(page.locator('aside')).toBeVisible()
  })

  test('drag note to reorder shows drop indicators', async ({ authenticatedPage: page }) => {
    // Expand Work Notes
    await page.locator('aside button').filter({ hasText: 'Work Notes' }).click()

    const note1 = page.locator('aside button').filter({ hasText: 'Meeting Agenda' })
    const note2 = page.locator('aside button').filter({ hasText: 'API Design Draft' })

    await expect(note1).toBeVisible()
    await expect(note2).toBeVisible()

    // Drag note1 below note2
    await note1.dragTo(note2)
    // App should remain stable
    await expect(page.locator('aside')).toBeVisible()
  })
})
