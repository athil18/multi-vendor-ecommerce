const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

console.log(`Starting deep audit of all ${products.length} products...\n`);

const flagged = [];

products.forEach((p, idx) => {
  const name = (p.name || '').trim();
  const cat = (p.category?.name || p.categoryName || '').trim();
  const desc = (p.description || '').trim();
  const store = (p.storeName || p.seller?.name || '').trim();
  const img = (p.images?.[0] || '').trim();
  const id = p.id;

  const reasons = [];

  // 1. Capitalization / formatting issues
  if (name === 'tshirt' || name === name.toLowerCase() && name.length < 15) {
    reasons.push(`Uncapitalized / low-quality title: "${name}"`);
  }

  // 2. Mismatched category for Sports goods in Jewelry
  if (cat.includes('Jewelry') || cat.includes('Accessories')) {
    if (/football|golf|baseball|tennis|volleyball|bat/i.test(name)) {
      reasons.push(`Sports equipment placed in Jewelry & Accessories ("${name}")`);
    }
    if (/echo plus|airpower|homepod|magsafe|beats flex|monopod|pedestal|camera/i.test(name)) {
      reasons.push(`Electronics/camera accessories placed in Jewelry & Accessories ("${name}")`);
    }
    if (/jogger|sweatpant|hoodie|shirt|dress/i.test(name)) {
      reasons.push(`Clothing/apparel placed in Jewelry & Accessories ("${name}")`);
    }
  }

  // 3. Mismatched items in Tech & Electronics
  if (cat.includes('Tech') || cat.includes('Electronic')) {
    if (/swing|photo frame|sink|plant|bicycle|go-kart|luggage|handbag|carry-on/i.test(name)) {
      reasons.push(`Non-electronic vehicle/furniture/decor placed in Tech & Electronics ("${name}")`);
    }
  }

  // 4. Mismatched items in Home & Living
  if (cat.includes('Home') || cat.includes('Living')) {
    if (/selfie lamp with iphone|sink with mirror/i.test(name)) {
      reasons.push(`Plumbing fixture or phone gadget placed in Home & Living ("${name}")`);
    }
  }

  // 5. Cheap drugstore cosmetics in luxury atelier
  if (cat.includes('Beauty') || cat.includes('Wellness')) {
    if (/mascara lash princess|eyeshadow palette|powder canister|red nail polish|hand soap|body wash|face lotion/i.test(name)) {
      reasons.push(`Drugstore/convenience bath item not fitting luxury atelier ("${name}")`);
    }
  }

  // 6. Generic Platzi repetitive apparel items
  if (/^Classic (Red|Heather|Grey|Black|Navy|Blue|Olive|White) (Pullover|Hooded|Comfort|Jogger|Baseball Cap|Chino Shorts|Athletic Shorts|White Tee|T-Shirt)/i.test(name)) {
    reasons.push(`Repetitive generic Platzi stock apparel ("${name}")`);
  }

  // 7. Generic footwear
  if (/rainbow glitter high heels|futuristic holographic soccer cleats|espadrille sandals|pampi shoes|golden shoes woman|black & brown slipper/i.test(name)) {
    reasons.push(`Low-aesthetic/mismatched footwear ("${name}")`);
  }

  // 8. Frocks and cheap dresses
  if (/blue frock|short frock|girl summer dress|dress pea/i.test(name)) {
    reasons.push(`Low-quality / weirdly titled dress ("${name}")`);
  }

  if (reasons.length > 0) {
    flagged.push({
      index: idx + 1,
      id,
      name,
      cat,
      store,
      reasons
    });
  }
});

console.log(`Total Flagged Products: ${flagged.length} / ${products.length}\n`);
flagged.forEach(f => {
  console.log(`[${f.index}] ${f.id} | ${f.name} (${f.cat}) -> ${f.reasons.join(', ')}`);
});
