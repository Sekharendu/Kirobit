import { test, expect } from '../fixtures/auth.js'

test.describe('Favorites', () => {
  test('toggle favorite on a note via editor star icon', async ({ authenticatedPage: page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      // On mobile, need to tap into a note first to see star
      await page.locator('aside').getByText('Standalone Note').click()
      const starBtn = page.locator('header').getByTitle(/favourites/i)
      await expect(starBtn).toBeVisible({ timeout: 3000 })
      await starBtn.click()
      return
    }

    // Desktop: expand folder, click note, then star
    await page.locator('aside').getByText('Work Notes').click()
    await page.locator('aside').getByText('API Design Draft').click()
    const titleInput = page.locator('input[placeholder="Untitled"]')
    await expect(titleInput).toHaveValue('API Design Draft')
    const starBtn = page.getByTitle('Add to favourites')
    await starBtn.click()
    await expect(page.getByTitle('Remove from favourites')).toBeVisible()
  })

  test('favorites tab shows only favorited notes', async ({ authenticatedPage: page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      await page.locator('aside').getByText('Favorites').click()
    } else {
      await page.locator('aside').getByTitle('Favorites').click()
    }

    await expect(page.locator('aside').getByText('Meeting Agenda')).toBeVisible()
    await expect(page.locator('aside').getByText('Quick Thought')).toBeVisible()
    await expect(page.locator('aside').getByText('API Design Draft')).not.toBeVisible()
    await expect(page.locator('aside').getByText('Shopping List')).not.toBeVisible()
    await expect(page.locator('aside').getByText('Standalone Note')).not.toBeVisible()
  })

  test('unfavoriting a note removes it from favorites tab', async ({ authenticatedPage: page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      await page.locator('aside').getByText('Favorites').click()
      await expect(page.locator('aside').getByText('Quick Thought')).toBeVisible()
      await page.locator('aside button').filter({ hasText: 'Quick Thought' }).first().click()
      // On mobile editor view, unfavorite via header star
      const starBtn = page.locator('header').getByTitle(/favourites/i)
      await starBtn.click()
      // Go back to sidebar
      await page.getByRole('button', { name: /back to notes/i }).click()
      await expect(page.locator('aside').getByText('Quick Thought')).not.toBeVisible({ timeout: 5000 })
      return
    }

    await page.locator('aside').getByTitle('Favorites').click()
    await expect(page.locator('aside').getByText('Quick Thought')).toBeVisible()
    await page.locator('aside').getByText('Quick Thought').click()
    await page.getByTitle('Remove from favourites').click()
    await expect(page.locator('aside').getByText('Quick Thought')).not.toBeVisible({ timeout: 3000 })
  })

  test('favorited notes show star icon in sidebar', async ({ authenticatedPage: page }) => {
    await page.locator('aside').getByText('Work Notes').click()
    const noteRow = page.locator('aside button').filter({ hasText: 'Meeting Agenda' })
    await expect(noteRow.locator('svg').last()).toBeVisible()
  })
})
