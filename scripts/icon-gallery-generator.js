/**
 * Nexus 500+ AI Agent — 10-Item Icon Visual Preview Sheet Generator
 * 
 * Takes any 10 icons (or category from .ai/ecommerce-icons-catalog.json),
 * fetches all 10 real vector SVGs, and renders a stunning HTML visual sheet
 * for the user to compare, evaluate, and choose their favorite icon.
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const CATALOG_PATH = path.join(WORKSPACE_ROOT, '.ai', 'ecommerce-icons-catalog.json');
const OUTPUT_HTML_PATH = path.join(WORKSPACE_ROOT, '.ai', 'icon_visual_preview_10.html');

async function fetchSvg(iconId) {
  const [collection, name] = iconId.includes(':') ? iconId.split(':') : ['lucide', iconId];
  const url = `https://api.iconify.design/${collection}/${name}.svg`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    return `<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="red" stroke-width="2" fill="none"/></svg>`;
  }
}

async function generateVisualSheet(categoryKey = 'shopping_cart_and_bag') {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Catalog not found at: ${CATALOG_PATH}`);
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  const items = catalog.categories[categoryKey];

  if (!items) {
    console.error(`Unknown category "${categoryKey}". Available: ${Object.keys(catalog.categories).join(', ')}`);
    return;
  }

  console.log(`\n🎨 Generating 10-Icon Visual Preview Sheet for: "${categoryKey.toUpperCase()}"...`);

  const cardsHtml = [];

  for (const item of items) {
    const rawSvg = await fetchSvg(item.id);
    
    // Scale SVG for display (48x48)
    const displaySvg = rawSvg
      .replace(/width="[^"]+"/, 'width="48"')
      .replace(/height="[^"]+"/, 'height="48"')
      .replace(/<svg/, '<svg class="icon-svg"');

    cardsHtml.push(`
      <div class="icon-card">
        <div class="badge-number">#${item.number}</div>
        <div class="icon-render-box">
          ${displaySvg}
        </div>
        <div class="icon-details">
          <div class="icon-id">${item.id}</div>
          <div class="icon-style">${item.style} • Set: <span class="tag">${item.set}</span></div>
          <div class="icon-desc">${item.description}</div>
          <button class="choose-btn" onclick="copyChoose('${item.id}', '${item.number}')">
            Select Item #${item.number}
          </button>
        </div>
      </div>
    `);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus 10-Icon Visual Preview — ${categoryKey}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090D16;
      --card-bg: rgba(15, 23, 42, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --accent: #38BDF8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 0%, #172554 0%, var(--bg) 70%);
      color: var(--text-main);
      font-family: 'Geist', -apple-system, sans-serif;
      padding: 40px 24px;
      min-height: 100vh;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 36px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #FFF, #94A3B8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header p {
      color: var(--text-muted);
      font-size: 14px;
    }
    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .icon-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px 18px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      backdrop-filter: blur(12px);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .icon-card:hover {
      border-color: var(--accent);
      box-shadow: 0 10px 25px -5px var(--accent-glow);
      transform: translateY(-4px);
    }
    .badge-number {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      color: var(--accent);
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .icon-render-box {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 14px;
      margin: 16px 0 18px;
      color: #38BDF8;
      transition: transform 0.2s ease;
    }
    .icon-card:hover .icon-render-box {
      transform: scale(1.1);
      color: #FFF;
      background: rgba(56, 189, 248, 0.12);
    }
    .icon-render-box svg {
      width: 44px;
      height: 44px;
    }
    .icon-id {
      font-size: 13px;
      font-weight: 600;
      color: #FFF;
      word-break: break-all;
      margin-bottom: 4px;
    }
    .icon-style {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    .tag {
      color: #38BDF8;
      font-weight: 600;
    }
    .icon-desc {
      font-size: 12px;
      color: #CBD5E1;
      line-height: 1.4;
      margin-bottom: 16px;
      min-height: 34px;
    }
    .choose-btn {
      width: 100%;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #090D16;
      background: #38BDF8;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .choose-btn:hover {
      background: #7DD3FC;
    }
    .copied-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0284C7;
      color: #FFF;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      display: none;
      box-shadow: 0 10px 20px rgba(0,0,0,0.4);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Nexus 10-Icon Visual Gallery Preview</h1>
    <p>Category: <strong>${categoryKey.toUpperCase()}</strong> • Compare all 10 candidate styles and tell me your choice!</p>
  </div>

  <div class="grid">
    ${cardsHtml.join('')}
  </div>

  <div id="toast" class="copied-toast">Selected! Tell me your choice in chat.</div>

  <script>
    function copyChoose(id, number) {
      const toast = document.getElementById('toast');
      toast.innerText = 'Item #' + number + ' (' + id + ') Selected! Reply in chat.';
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML_PATH, html, 'utf-8');
  console.log(`✅ Visual Preview Sheet generated at: ${OUTPUT_HTML_PATH}`);
}

const cat = process.argv[2] || 'shopping_cart_and_bag';
generateVisualSheet(cat);
