import axios from 'axios';
import { load } from 'cheerio';
import fs from 'node:fs';

async function scrapeCarvolution() {
    const url = 'https://www.smileybedeutung.com/';
    const res = await axios.get(url);
    const $ = load(res.data);
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    fs.writeFileSync('public/smileybedeutung.txt', text);
    console.log('✅ Website-Inhalt gespeichert in public/smileybedeutung.txt');
}

scrapeCarvolution();

// npx tsx scripts/scrape.ts
