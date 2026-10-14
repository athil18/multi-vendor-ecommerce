const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

async function checkAllImages() {
  const allImages = new Set();
  products.forEach(p => {
    if (p.images) p.images.forEach(img => allImages.add(img));
  });

  console.log(`Checking ${allImages.size} unique images...`);
  const imageList = Array.from(allImages);
  const broken = [];
  
  // Test in batches of 20
  for (let i = 0; i < imageList.length; i += 20) {
    const chunk = imageList.slice(i, i + 20);
    await Promise.all(chunk.map(async (url) => {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(t);
        if (!res.ok) {
          broken.push({ url, status: res.status });
        }
      } catch (err) {
        broken.push({ url, error: err.message });
      }
    }));
  }

  console.log(`Finished check. Total broken: ${broken.length}`);
  if (broken.length > 0) {
    console.log('Broken images:', broken.slice(0, 30));
  }
}

checkAllImages();
