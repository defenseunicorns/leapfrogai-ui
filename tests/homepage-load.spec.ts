import { test, expect } from '@playwright/test';

test('Smoke test', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/LeapfrogAI/);
});