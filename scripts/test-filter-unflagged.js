const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

function isFlagged(p) {
  const name = (p.name || '').trim();
  const cat = (p.category?.name || p.categoryName || '').trim();
  const desc = (p.description || '').trim();
  const store = (p.storeName || p.seller?.name || '').trim();
  const img = (p.images?.[0] || '').trim();

  // 1. Uncapitalized / low-quality title
  if (name === 'tshirt' || (name === name.toLowerCase() && name.length < 15)) {
    return 'Low-quality / uncapitalized title';
  }

  // 2. Mismatched category for Sports goods in Jewelry
  if (cat.includes('Jewelry') || cat.includes('Accessories')) {
    if (/football|golf|baseball|tennis|volleyball|bat/i.test(name)) {
      return 'Sports equipment in Jewelry & Accessories';
    }
    if (/echo plus|airpower|homepod|magsafe|beats flex|monopod|pedestal|camera/i.test(name)) {
      return 'Electronics/camera accessories in Jewelry & Accessories';
    }
    if (/jogger|sweatpant|hoodie|shirt|dress/i.test(name)) {
      return 'Clothing/apparel in Jewelry & Accessories';
    }
  }

  // 3. Mismatched items in Tech & Electronics
  if (cat.includes('Tech') || cat.includes('Electronic')) {
    if (/swing|photo frame|sink|plant|bicycle|go-kart|luggage|handbag|carry-on/i.test(name)) {
      return 'Non-electronic vehicle/furniture/decor in Tech & Electronics';
    }
  }

  // 4. Mismatched items in Home & Living
  if (cat.includes('Home') || cat.includes('Living')) {
    if (/selfie lamp with iphone|sink with mirror/i.test(name)) {
      return 'Plumbing fixture or phone gadget in Home & Living';
    }
  }

  // 5. Cheap drugstore cosmetics in luxury atelier
  if (cat.includes('Beauty') || cat.includes('Wellness')) {
    if (/mascara lash princess|eyeshadow palette|powder canister|red lipstick|red nail polish|hand soap|body wash|face lotion/i.test(name)) {
      return 'Drugstore convenience bath item';
    }
  }

  // 6. Generic Platzi repetitive apparel items
  if (/^Classic (Red|Heather|Grey|Black|Navy|Blue|Olive|White) (Pullover|Hooded|Comfort|Jogger|Baseball Cap|Chino Shorts|Athletic Shorts|White Tee|T-Shirt)/i.test(name)) {
    return 'Repetitive generic Platzi stock apparel';
  }

  // 7. Low aesthetic footwear
  if (/rainbow glitter high heels|futuristic holographic soccer cleats|espadrille sandals|pampi shoes|golden shoes woman|black & brown slipper/i.test(name)) {
    return 'Low-aesthetic/mismatched footwear';
  }

  // 8. Frocks and cheap dresses
  if (/blue frock|short frock|girl summer dress|dress pea/i.test(name)) {
    return 'Low-quality / weirdly titled dress';
  }

  return null;
}

const unflagged = [];
const flagged = [];

products.forEach((p, idx) => {
  const reason = isFlagged(p);
  if (reason) {
    flagged.push({ id: p.id, name: p.name, cat: p.category?.name, reason });
  } else {
    unflagged.push({ id: p.id, name: p.name, cat: p.category?.name, store: p.storeName || p.seller?.name, img: p.images?.[0] });
  }
});

console.log(`Flagged (to remove): ${flagged.length}`);
console.log(`Unflagged (retained): ${unflagged.length}`);

console.log('\n--- RETAINED PRODUCTS LIST ---');
unflagged.forEach((p, i) => {
  console.log(`${(i+1).toString().padStart(3)} | ${p.id.padEnd(28)} | ${(p.cat||'').padEnd(22)} | ${p.name.slice(0, 40).padEnd(40)} | ${p.img?.slice(0, 45)}`);
});
