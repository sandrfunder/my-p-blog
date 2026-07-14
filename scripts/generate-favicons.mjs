import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const wolfSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" fill="#000"/>
  <path fill="#FFF" d="M64 8 C40 8 20 28 20 52 c0 12 6 22 15 28 C28 88 20 100 20 112 c0 8 6 14 14 14 h8 c8 0 14-6 14-14 0-12 8-24 20-28 C50 74 56 64 56 52 C56 28 36 8 64 8 Z M64 18 C48 18 35 31 35 47 c0 8 5 15 12 17 C44 68 40 74 40 80 c0 6 4 10 10 10 h8 c6 0 10-4 10-10 0-6-4-12-10-16 C53 40 58 33 58 24 C58 18 52 12 44 12 c-8 0-14 6-14 14 0 8 6 14 14 14 8 0 14-6 14-14 Z"/>
</svg>`;

const faviconDir = path.join(process.cwd(), 'public', 'favicons');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'web-app-manifest-192x192.png', size: 192 },
  { name: 'web-app-manifest-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateFavicons() {
  console.log('Generating favicons in public/favicons...');
  
  for (const { name, size } of sizes) {
    await sharp(Buffer.from(wolfSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(faviconDir, name));
    console.log(`  ✓ ${name} (${size}x${size})`);
  }

  // Generate multi-resolution ICO (16, 32, 48)
  const icoBuffers = await Promise.all(
    [16, 32, 48].map(size => 
      sharp(Buffer.from(wolfSvg))
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // Build ICO file
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(3, 4);

  const dirEntries = Buffer.alloc(16 * 3);
  let imageOffset = 6 + 16 * 3;
  const icoImages = [];

  for (let i = 0; i < 3; i++) {
    const size = [16, 32, 48][i];
    const imgBuffer = icoBuffers[i];
    
    const bmpHeader = Buffer.alloc(40);
    bmpHeader.writeUInt32LE(40, 0);
    bmpHeader.writeInt32LE(size, 4);
    bmpHeader.writeInt32LE(size * 2, 8);
    bmpHeader.writeUInt16LE(1, 12);
    bmpHeader.writeUInt16LE(32, 14);
    bmpHeader.writeUInt32LE(0, 16);
    bmpHeader.writeUInt32LE(imgBuffer.length, 20);
    bmpHeader.writeInt32LE(0, 24);
    bmpHeader.writeInt32LE(0, 28);
    bmpHeader.writeUInt32LE(0, 32);
    bmpHeader.writeUInt32LE(0, 36);

    const imgData = Buffer.concat([bmpHeader, imgBuffer]);
    icoImages.push(imgData);

    dirEntries.writeUInt8(size, i * 16 + 0);
    dirEntries.writeUInt8(size, i * 16 + 1);
    dirEntries.writeUInt8(0, i * 16 + 2);
    dirEntries.writeUInt8(0, i * 16 + 3);
    dirEntries.writeUInt16LE(1, i * 16 + 4);
    dirEntries.writeUInt16LE(32, i * 16 + 6);
    dirEntries.writeUInt32LE(imgData.length, i * 16 + 8);
    dirEntries.writeUInt32LE(imageOffset, i * 16 + 12);
    
    imageOffset += imgData.length;
  }

  const icoBuffer = Buffer.concat([icoHeader, dirEntries, ...icoImages]);
  fs.writeFileSync(path.join(faviconDir, 'favicon.ico'), icoBuffer);
  console.log('  ✓ favicon.ico (multi-resolution: 16, 32, 48)');

  // Generate SVG favicon (with dark mode support)
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <style>
    rect { fill: #000; }
    path { fill: #FFF; }
    @media (prefers-color-scheme: dark) {
      rect { fill: #000; }
      path { fill: #FFF; }
    }
  </style>
  <rect width="128" height="128" fill="#000"/>
  <path fill="#FFF" d="M64 8 C40 8 20 28 20 52 c0 12 6 22 15 28 C28 88 20 100 20 112 c0 8 6 14 14 14 h8 c8 0 14-6 14-14 0-12 8-24 20-28 C50 74 56 64 56 52 C56 28 36 8 64 8 Z M64 18 C48 18 35 31 35 47 c0 8 5 15 12 17 C44 68 40 74 40 80 c0 6 4 10 10 10 h8 c6 0 10-4 10-10 0-6-4-12-10-16 C53 40 58 33 58 24 C58 18 52 12 44 12 c-8 0-14 6-14 14 0 8 6 14 14 14 8 0 14-6 14-14 Z"/>
</svg>`;
  fs.writeFileSync(path.join(faviconDir, 'favicon.svg'), svgFavicon);
  console.log('  ✓ favicon.svg (with dark mode support)');

  console.log('\nAll favicons generated successfully in public/favicons/!');
}

generateFavicons().catch(console.error);