const fs = require('fs');

function getImageDimensions(buffer) {
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { type: 'png', width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  // WebP
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const vp8 = buffer.toString('ascii', 12, 16);
    if (vp8 === 'VP8 ') {
      return { type: 'webp', width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (vp8 === 'VP8L') {
      const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
      return { type: 'webp', width: 1 + (((b1 & 0x3f) << 8) | b0), height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)) };
    }
    if (vp8 === 'VP8X') {
      return { type: 'webp', width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
    }
  }
  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xFF) { offset++; continue; }
      const marker = buffer[offset + 1];
      if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) || (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
        return { type: 'jpeg', height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }
  return { type: 'unknown', width: 0, height: 0 };
}

async function verifyAll100() {
  const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
  const idsToRemove = new Set([
    'prod-15', 'prod-43', 'prod-44', 'prod-109', 'prod-146', 'prod-147', 'prod-148',
    'prod-149', 'prod-150', 'prod-151', 'prod-152', 'prod-98', 'prod-101', 'prod-102',
    'prod-104', 'prod-106', 'prod-108', 'prod-110', 'prod-111', 'prod-107', 'prod-171',
    'prod-172', 'prod-173', 'prod-174', 'prod-175', 'prod-181', 'prod-182', 'prod-183',
    'prod-199', 'prod-225', 'prod-237', 'prod-238', 'prod-240', 'prod-241', 'prod-326',
    'prod-84', 'prod-161', 'prod-162', 'prod-164', 'prod-179', 'prod-194', 'prod-196',
    'prod-197', 'prod-200', 'prod-202', 'prod-203', 'prod-204', 'prod-205', 'prod-208',
    'prod-209', 'prod-184', 'prod-186', 'prod-187', 'prod-227', 'prod-228', 'prod-229',
    'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-117', 'prod-118', 'prod-119'
  ]);

  const candidates = products.filter(p => !idsToRemove.has(p.id));
  console.log(`Checking ${candidates.length} candidates...`);

  let failures = 0;
  for (let i = 0; i < candidates.length; i += 15) {
    const batch = candidates.slice(i, i + 15);
    await Promise.all(batch.map(async (p) => {
      const url = p.images?.[0];
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) {
          console.error(`FAIL [HTTP ${res.status}] ${p.id}: ${p.name} (${url})`);
          failures++;
          return;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        const dims = getImageDimensions(buf);
        if (dims.width < 500 || dims.height < 500) {
          console.error(`FAIL [LOW RES ${dims.width}x${dims.height}] ${p.id}: ${p.name}`);
          failures++;
        }
      } catch (err) {
        console.error(`FAIL [FETCH ERROR] ${p.id}: ${p.name} - ${err.message}`);
        failures++;
      }
    }));
  }

  console.log(`\nVerification complete. Total Failures: ${failures}`);
}

verifyAll100();
