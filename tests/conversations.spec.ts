import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/');
});

test.describe('Open to a blank LeapfrogAI page', () => {
  test('Clicking on chat', async ({page}) => {
    await expect(page).toHaveTitle(/LeapfrogAI/);
    await page.getByText('Chat').click();
    await page.getByText('NEW CHAT').click();
    expect(page.getByText('New conversation')).toBeTruthy();
  });
});