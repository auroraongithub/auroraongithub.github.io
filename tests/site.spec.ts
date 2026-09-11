import { expect, test } from '@playwright/test';

const routes = ['/', '/about/', '/portfolio/', '/blogs/', '/stories/', '/experiments/', '/resources/', '/changelog/'];
const primaryLabels = ['Home', 'About', 'Portfolio', 'Blogs', 'Stories'];
const themeColors = ['cyan', 'pink', 'purple', 'green', 'orange', 'blue', 'red', 'yellow', 'teal'];

for (const route of routes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('.site-banner')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
}

test('primary navigation contract stays intact', async ({ page }) => {
  await page.goto('/');
  const labels = await page.locator('.primary-nav-list > li > a').allTextContents();
  expect(labels.map((label) => label.trim())).toEqual(primaryLabels);
  await expect(page.locator('.primary-nav-list')).not.toContainText('Arcade');
  await page.goto('/experiments/');
  await expect(page.getByRole('heading', { name: 'Arcade / Games' })).toBeVisible();
});

test('mobile navigation preserves the original More drawer experience', async ({ page }) => {
  await page.goto('/');
  if ((await page.evaluate(() => window.innerWidth)) > 600) test.skip();

  await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
  const labels = await page.locator('.mobile-bottom-nav a').allTextContents();
  expect(labels.map((label) => label.trim())).toEqual(['Home', 'About', 'Blogs', 'Stories', 'More']);
  await page.locator('[data-more-toggle]').click();
  await expect(page.locator('#moreDrawer')).toHaveClass(/active/);
  await expect(page.locator('#drawerWorkingOn')).toBeVisible();
  await expect(page.locator('#drawerShoutboxMessages')).toBeVisible();
  await page.locator('.more-drawer-close').click();
  await expect(page.locator('#moreDrawer')).not.toHaveClass(/active/);
  await expect(page.locator('.mobile-shoutbox-section')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Join Us!' })).toBeVisible();
});

test('all nine color themes and dark mode persist', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-color-picker]').click();
  await expect(page.locator('.color-option')).toHaveCount(9);
  const colors = await page.locator('.color-option').evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.color));
  expect(colors).toEqual(themeColors);
  await page.locator('.color-option[data-color="red"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-color', 'red');
  expect(await page.evaluate(() => localStorage.getItem('color'))).toBe('red');
  await page.locator('[data-toggle-theme]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-color', 'red');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('local image assets render and a screenshot is captured', async ({ page, request }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const sources = await page.locator('img[src^="/img/"]').evaluateAll((images) => [...new Set(images.map((image) => (image as HTMLImageElement).getAttribute('src')).filter(Boolean))] as string[]);
  expect(sources.length).toBeGreaterThan(0);
  for (const source of sources) {
    const response = await request.get(new URL(source, page.url()).href);
    expect(response.status(), `local image failed: ${source}`).toBeLessThan(400);
  }
  await expect(page.locator('.about-grid img[src^="/img/"]').first()).toBeVisible();
  const fontFamily = await page.locator('body').evaluate((body) => getComputedStyle(body).fontFamily);
  expect(fontFamily.trim().length).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath('home-full.png'), fullPage: true });
});

test('blog and story detail routes are generated and navigable', async ({ page }) => {
  for (const section of ['blogs', 'stories']) {
    await page.goto(`/${section}/`);
    const first = page.locator('.post-card a').first();
    await expect(first).toBeVisible();
    const href = await first.getAttribute('href');
    expect(href).toMatch(new RegExp(`^/${section}/.+/$`));
    const response = await page.goto(href!);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('.neo-article > .article-header > h1')).toBeVisible();
  }
});

test('legacy public URLs and admin remain available', async ({ page }) => {
  for (const [legacy, current] of [['/blogs.html', '/blogs/'], ['/stories.html', '/stories/'], ['/resources.html', '/resources/'], ['/changelog.html', '/changelog/']]) {
    await page.goto(legacy);
    await expect(page).toHaveURL(new RegExp(`${current.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\?.*)?$`));
  }
  const admin = await page.goto('/admin/');
  expect(admin?.status()).toBeLessThan(400);
});

test('public API outages degrade without breaking the site shell', async ({ page }) => {
  await page.route('https://nijikade-backend.vercel.app/**', (route) => route.abort());
  await page.goto('/resources/');
  await expect(page.locator('.site-banner')).toBeVisible();
  await expect(page.locator('#resourcePanels')).toContainText('temporarily unavailable');
  await page.goto('/');
  await expect(page.locator('.site-banner')).toBeVisible();
  await expect(page.locator('#statusFeeling')).toHaveText('Offline');
  await expect(page.locator('#portfolioGrid .portfolio-item').first()).toBeVisible();
  await expect(page.locator('#recentBlogs .recent-item').first()).toBeVisible();
});

test('important external links remain valid URLs', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('a').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href')).filter(Boolean));
  expect(hrefs).toContain('https://x.com/_kuzuminn');
  expect(hrefs).toContain('https://youtube.com/@pmuaurora');
  expect(hrefs).toContain('https://github.com/auroraongithub');
  expect(hrefs).toContain('mailto:aurorashorts.forbusiness@gmail.com');
  for (const href of hrefs.filter((href): href is string => Boolean(href) && /^(https?:|mailto:)/.test(href!))) {
    expect(() => new URL(href)).not.toThrow();
  }
});
