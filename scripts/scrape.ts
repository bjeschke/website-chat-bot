import { chromium } from 'playwright';
import * as fs from 'fs';

const visited = new Set<string>();
const baseUrl = 'https://sunbonoo.com/de';
const domain = new URL(baseUrl).origin;
let fullText = '';

async function crawl(url: string, depth = 0): Promise<void> {
    if (visited.has(url) || depth > 2) return;
    visited.add(url);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113 Safari/537.36',
    });
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3000);

        await page.evaluate(() => {
            const selectorsToRemove = ['.cookie-banner', 'footer', '.newsletter', '.social-icons', 'script', 'style', 'svg'];
            selectorsToRemove.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => el.remove());
            });
        });

        const text = await page.evaluate(() => {
            const titles = Array.from(document.querySelectorAll('h1, h2, h3'))
                .map(h => `## ${h.textContent?.trim()}`);
            const paras = Array.from(document.querySelectorAll('p'))
                .map(p => p.textContent?.trim())
                .filter(Boolean);
            return [...titles, ...paras].join('\n\n');
        });

        fullText += `\n\n--- ${url} ---\n\n${text}`;

        const hrefs = await page.$$eval('a', (anchors) =>
            anchors.map((a) => a.getAttribute('href')).filter((href): href is string => !!href)
        );

        const normalizedLinks = hrefs
            .filter((href) => href.startsWith('/') || href.startsWith(domain))
            .map((href) => (href.startsWith('/') ? domain + href : href));

        for (const link of normalizedLinks) {
            await crawl(link, depth + 1);
        }
    } catch (err) {
        console.warn(`Fehler beim Crawlen von ${url}:`, err);
    } finally {
        await browser.close();
    }
}

(async () => {
    await crawl(baseUrl);
    fs.writeFileSync('public/sunbonoo.txt', fullText);
    console.log(`✅ Playwright Crawling abgeschlossen – ${visited.size} Seiten gespeichert.`);
})();


// npx tsx scripts/scrape.ts
