const fs = require('fs');

function getImageDimensions(buffer) {
  // PNG: width at bytes 16-20, height at 20-24 (big endian)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { type: 'png', width, height };
  }

  // WebP: RIFF....WEBPVP8
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const vp8 = buffer.toString('ascii', 12, 16);
    if (vp8 === 'VP8 ') {
      // VP8 lossy: 10 bytes offset
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { type: 'webp', width, height };
    }
    if (vp8 === 'VP8L') {
      // VP8L lossless
      const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { type: 'webp', width, height };
    }
    if (vp8 === 'VP8X') {
      // VP8X extended
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { type: 'webp', width, height };
    }
  }

  // JPEG: scan for SOF0/SOF2 marker (0xFF, 0xC0 or 0xC2)
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xFF) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) || (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { type: 'jpeg', width, height };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  return { type: 'unknown', width: 0, height: 0 };
}

async function auditDimensions() {
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
  console.log(`Auditing dimensions for ${products.length} products...`);

  const results = [];
  for (let i = 0; i < products.length; i += 20) {
    const chunk = products.slice(i, i + 20);
    await Promise.all(chunk.map(async (p) => {
      const url = p.images?.[0];
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const buf = Buffer.from(await res.arrayBuffer());
        const dims = getImageDimensions(buf);
        results.push({
          id: p.id,
          name: p.name,
          category: p.category?.name,
          store: p.storeName || p.seller?.name,
          url,
          ...dims,
          bytes: buf.length
        });
      } catch (e) {
        results.push({ id: p.id, name: p.name, error: e.message });
      }
    }));
  }

  // Group by resolution
  const tiny = results.filter(r => r.width < 400 || r.height < 400);
  const low = results.filter(r => (r.width >= 400 && r.width < 600) || (r.height >= 400 && r.height < 600));
  const good = results.filter(r => r.width >= 600 && r.height >= 600);

  console.log(`\n--- RESOLUTION REPORT ---`);
  console.log(`Total checked: ${results.length}`);
  console.log(`Tiny (<400px, definitely blurry): ${tiny.length}`);
  console.log(`Low (400-600px): ${low.length}`);
  console.log(`Good (>=600px HD): ${good.length}`);

  if (tiny.length > 0) {
    console.log('\nTiny Images (<400px):');
    tiny.forEach(t => console.log(`  ${t.id}: ${t.name} -> ${t.width}x${t.height} (${t.url})`));
  }

  console.log('\nSample dimensions:');
  results.slice(0, 15).forEach(r => console.log(`  ${r.id}: ${r.name.slice(0, 30).padEnd(30)} -> ${r.width}x${r.height} (${r.type}, ${Math.round(r.bytes/1024)}KB)`));

  fs.writeFileSync('./scripts/dimension-audit-results.json', JSON.stringify(results, null, 2));
}

auditDimensions();
