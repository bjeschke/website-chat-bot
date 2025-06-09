import axios from 'axios';
import { load } from 'cheerio';
import fs from 'node:fs';

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Benjamin Jeschke';

async function scrapeCarvolution() {
    const url = 'https://www.smileybedeutung.com/';
    const res = await axios.get(url);
    const $ = load(res.data);
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    fs.writeFileSync(`public/${COMPANY_NAME}.txt`, text);
}

scrapeCarvolution();

// npx tsx scripts/scrape.ts
