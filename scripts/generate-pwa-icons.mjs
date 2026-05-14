import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '..', 'public')

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B9D1D3"/>
      <stop offset="100%" stop-color="#74A5A8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#g)"/>
  <rect x="136" y="112" width="80" height="288" rx="16" fill="white"/>
  <rect x="296" y="112" width="80" height="288" rx="16" fill="white"/>
  <rect x="136" y="224" width="240" height="80" rx="16" fill="white" opacity="0.6"/>
</svg>`

async function generate(svg, size, output) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(publicDir, output))
  console.log(`✓ ${output} (${size}x${size})`)
}

async function main() {
  await generate(iconSvg, 192, 'pwa-192x192.png')
  await generate(iconSvg, 512, 'pwa-512x512.png')
}

main().catch(console.error)
