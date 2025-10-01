import fs from 'fs';
import path from 'path';

const DATA_PATH = path.resolve('src/data/faqs.json');

export function getFAQs() {
  if (!fs.existsSync(DATA_PATH)) return {};
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}
