import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login')

    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/protected')

    // Should redirect to login
    await expect(page).toHaveURL(/.*auth\/login/)
  })

  test('should display home page', async ({ page }) => {
    await page.goto('/')

    // Check if home page loads
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
  })
})
