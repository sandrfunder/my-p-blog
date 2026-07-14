import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const faviconDir = path.join(process.cwd(), 'public', 'favicons');
const sourcePath = path.join(faviconDir, 'wolf_new .png');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'web-app-manifest-192x192.png', size: 192 },
  { name: 'web-app-manifest-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
  console.log('Generating favicons from wolf_new.png...');
  
  for (const { name, size } of sizes) {
    await sharp(sourcePath)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .png()
      .toFile(path.join(faviconDir, name));
    console.log('  ✓', name, size + 'x' + size);
  }

  // Generate multi-resolution ICO
  const icoBuffers = await Promise.all(
    [16, 32, 48].map(size => 
      sharp(sourcePath).resize(size, size, { fit: 'cover', position: 'center' }).png().toBuffer()
    )
  );

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
  console.log('  ✓ favicon.ico (16, 32, 48)');

  // Generate SVG favicon with embedded PNG
  const png128 = await sharp(sourcePath).resize(128, 128, { fit: 'cover' }).png().toBuffer();
  const base64 = png128.toString('base64');
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <image href="data:image/png;base64,${base64}" width="128" height="128"/>
</svg>`;
  fs.writeFileSync(path.join(faviconDir, 'favicon.svg'), svgFavicon);
  console.log('  ✓ favicon.svg');

  console.log('\nAll favicons generated!');
}

generate().catch(console.error);