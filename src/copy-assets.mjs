import { copyFile, mkdir } from 'node:fs/promises';

const assets = new URL('../assets/', import.meta.url);
await mkdir(assets, { recursive: true });
await copyFile(new URL('../dist/portfolio-motion.js', import.meta.url), new URL('../assets/portfolio-motion.js', import.meta.url));
await copyFile(new URL('./portfolio.css', import.meta.url), new URL('../assets/portfolio.css', import.meta.url));
console.log(`Updated served assets in ${assets.pathname}`);
