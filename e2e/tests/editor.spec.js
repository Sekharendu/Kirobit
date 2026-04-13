import { test, expect } from '../fixtures/auth.js'

test.describe('Rich Text Editor', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Meeting Agenda is inside Work Notes folder — expand it first
    await page.locator('aside').getByText('Work Notes').click()
    await page.locator('aside').getByText('Meeting Agenda').click()
    await page.locator('.tiptap').waitFor({ state: 'visible' })
  })

  test('typing in editor updates content', async ({ authenticatedPage: page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('End')
    await page.keyboard.type('Hello testing world')
    await expect(editor).toContainText('Hello testing world')
  })

  test('slash menu opens when typing /', async ({ authenticatedPage: page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('Enter')
    await page.keyboard.type('/')
    const formatMenu = page.locator('[role="listbox"][aria-label="Formatting"]')
    await expect(formatMenu).toBeVisible({ timeout: 3000 })
    await expect(formatMenu.getByText('Heading 1')).toBeVisible()
    await expect(formatMenu.getByText('Bold')).toBeVisible()
    await expect(formatMenu.getByText('Code block')).toBeVisible()
  })

  test('slash menu Escape closes and removes slash', async ({ authenticatedPage: page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('Enter')
    await page.keyboard.type('/')
    const formatMenu = page.locator('[role="listbox"][aria-label="Formatting"]')
    await expect(formatMenu).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
    await expect(formatMenu).not.toBeVisible()
  })

  test('selecting Heading 1 from slash menu applies h1', async ({ authenticatedPage: page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('Enter')
    await page.keyboard.type('/')
    const formatMenu = page.locator('[role="listbox"][aria-label="Formatting"]')
    await expect(formatMenu).toBeVisible({ timeout: 3000 })
    await formatMenu.getByText('Heading 1').click()
    await page.keyboard.type('Test Heading')
    await expect(editor.locator('h1')).toContainText('Test Heading')
  })

  test('arrow key navigation in slash menu', async ({ authenticatedPage: page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('Enter')
    await page.keyboard.type('/')
    const formatMenu = page.locator('[role="listbox"][aria-label="Formatting"]')
    await expect(formatMenu).toBeVisible({ timeout: 3000 })

    const firstOption = formatMenu.locator('[role="option"]').first()
    await expect(firstOption).toHaveAttribute('aria-selected', 'true')

    await page.keyboard.press('ArrowDown')
    const secondOption = formatMenu.locator('[role="option"]').nth(1)
    await expect(secondOption).toHaveAttribute('aria-selected', 'true')
  })

  test('bold formatting via slash menu', async ({ authenticatedPage: page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('Enter')
    await page.keyboard.type('/')
    const formatMenu = page.locator('[role="listbox"][aria-label="Formatting"]')
    await expect(formatMenu).toBeVisible({ timeout: 3000 })
    await formatMenu.getByText('Bold').click()
    await expect(formatMenu).not.toBeVisible()
  })

  test('code block via slash menu supports Tab indentation', async ({ authenticatedPage: page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('Enter')
    await page.keyboard.type('/')
    const formatMenu = page.locator('[role="listbox"][aria-label="Formatting"]')
    await expect(formatMenu).toBeVisible({ timeout: 3000 })
    await formatMenu.getByText('Code block').click()
    await expect(formatMenu).not.toBeVisible()

    await page.keyboard.type('function hello() {')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    await page.keyboard.type('return "world"')

    await expect(editor.locator('pre')).toBeVisible()
  })

  test('slash key inside code block does not open menu', async ({ authenticatedPage: page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('Enter')
    await page.keyboard.type('/')
    const formatMenu = page.locator('[role="listbox"][aria-label="Formatting"]')
    await expect(formatMenu).toBeVisible({ timeout: 3000 })
    await formatMenu.getByText('Code block').click()
    await expect(formatMenu).not.toBeVisible()

    await page.keyboard.type('/')
    await expect(formatMenu).not.toBeVisible()
  })
})
