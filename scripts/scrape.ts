import axios from 'axios';
import { load } from 'cheerio';
import fs from 'node:fs';

async function scrapeCarvolution() {
    const url = 'http://benjaminjeschke.com';
    const res = await axios.get(url);
    const $ = load(res.data);
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    fs.writeFileSync('public/benjaminjeschke.txt', text);
    console.log('✅ Website-Inhalt gespeichert in public/benjaminjeschke.txt');
}

scrapeCarvolution();

// npx tsx scripts/scrape.ts
