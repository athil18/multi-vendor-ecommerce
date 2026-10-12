/**
 * Nexus 500+ AI Agent — Icon Retrieval, Selection & Auto-Injection Engine
 * 
 * Powered by 200+ icon sets (200,000+ vector icons via Iconify & Better-Icons)
 * Allows developers and AI agents to search, select, preview, and auto-inject
 * production-ready React/TypeScript SVG icons into the storefront.
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent engineering-frontend-developer
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'src', 'components', 'ui', 'icons');
const INDEX_FILE = path.join(ICONS_DIR, 'index.ts');

// Ensure target directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Ensure index.ts exists
if (!fs.existsSync(INDEX_FILE)) {
  fs.writeFileSync(INDEX_FILE, '// Nexus Auto-Injected Vector Icons\n', 'utf-8');
}

/**
 * Curated Choosing Sets for E-Commerce
 */
const CURATED_PRESETS = {
  ecommerce: [
    { id: 'lucide:shopping-bag', name: 'ShoppingBagIcon' },
    { id: 'lucide:shopping-cart', name: 'ShoppingCartIcon' },
    { id: 'lucide:tag', name: 'PriceTagIcon' },
    { id: 'lucide:truck', name: 'ShippingTruckIcon' },
    { id: 'lucide:shield-check', name: 'BuyerProtectionIcon' },
    { id: 'lucide:rotate-ccw', name: 'ReturnPolicyIcon' },
    { id: 'lucide:package', name: 'OrderPackageIcon' }
  ],
  payments: [
    { id: 'simple-icons:visa', name: 'VisaCardIcon' },
    { id: 'simple-icons:mastercard', name: 'MastercardIcon' },
    { id: 'simple-icons:stripe', name: 'StripePaymentIcon' },
    { id: 'simple-icons:applepay', name: 'ApplePayIcon' },
    { id: 'simple-icons:googlepay', name: 'GooglePayIcon' },
    { id: 'lucide:credit-card', name: 'CreditCardIcon' },
    { id: 'lucide:lock', name: 'SecureLockIcon' }
  ],
  navigation: [
    { id: 'lucide:search', name: 'SearchIcon' },
    { id: 'lucide:bell', name: 'NotificationBellIcon' },
    { id: 'lucide:heart', name: 'WishlistHeartIcon' },
    { id: 'lucide:user', name: 'UserAccountIcon' },
    { id: 'lucide:menu', name: 'MenuDrawerIcon' },
    { id: 'lucide:filter', name: 'CatalogFilterIcon' },
    { id: 'lucide:sun', name: 'SunModeIcon' },
    { id: 'lucide:moon', name: 'MoonModeIcon' }
  ],
  storefront: [
    { id: 'lucide:store', name: 'StoreIcon' },
    { id: 'lucide:zap', name: 'FlashSaleIcon' },
    { id: 'solar:fire-bold-duotone', name: 'TrendingFlameIcon' },
    { id: 'lucide:award', name: 'AwardMedalIcon' },
    { id: 'solar:star-bold', name: 'StarRatingIcon' },
    { id: 'lucide:help-circle', name: 'HelpCircleIcon' },
    { id: 'lucide:gift', name: 'GiftBoxIcon' },
    { id: 'lucide:percent', name: 'PercentDiscountIcon' },
    { id: 'solar:verified-check-bold', name: 'CheckCircleBadgeIcon' },
    { id: 'tabler:scale', name: 'DisputeScaleIcon' }
  ]
};

async function searchIcons(query, setFilter = '') {
  console.log(`\n🔍 Searching 200,000+ vector icons for: "${query}"...`);
  try {
    const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=30`;
    const res = await fetch(url);
    const data = await res.json();

    let icons = data.icons || [];
    if (setFilter) {
      icons = icons.filter(i => i.startsWith(setFilter + ':'));
    }

    if (icons.length === 0) {
      console.log('⚠️ No icons found. Try different keywords like "cart", "bag", "shield", "payment".');
      return;
    }

    console.log(`✨ Found ${icons.length} matching vector icons across collections:\n`);
    icons.forEach((id, idx) => {
      const [set, name] = id.split(':');
      console.log(`  [${String(idx + 1).padStart(2, ' ')}] ${id.padEnd(35)} (Set: ${set})`);
    });

    console.log('\n💡 To auto-inject any icon, run:');
    console.log(`   node scripts/icon-manager.js inject <icon-id> --as <ComponentName>\n`);
  } catch (err) {
    console.error('❌ Search error:', err.message);
  }
}

async function fetchSvg(iconId) {
  const [collection, name] = iconId.includes(':') ? iconId.split(':') : ['lucide', iconId];
  const url = `https://api.iconify.design/${collection}/${name}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download icon [${iconId}]: HTTP ${res.status}`);
  }
  return await res.text();
}

function cleanSvgForReact(svgContent, componentName) {
  // Extract viewBox
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  let inner = svgContent
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();

  // Convert SVG attributes to React camelCase
  inner = inner
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/stop-color=/g, 'stopColor=')
    .replace(/stop-opacity=/g, 'stopOpacity=')
    .replace(/class=/g, 'className=');

  // Detect if icon is primarily stroke-based or fill-based
  const isFillBased = inner.includes('fill="currentColor"') && !inner.includes('stroke="currentColor"');

  const svgAttributes = isFillBased
    ? `viewBox="${viewBox}"
      fill="currentColor"
      className={className}`
    : `viewBox="${viewBox}"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}`;

  const tsx = `import React from 'react';

export interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * ${componentName}
 * Auto-injected from 200k+ vector collection via Nexus Icon Manager
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 */
export const ${componentName}: React.FC<${componentName}Props> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      ${svgAttributes}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      ${inner}
    </svg>
  );
};

export default ${componentName};
`;
  return tsx;
}

async function injectIcon(iconId, componentName) {
  try {
    if (!componentName) {
      const parts = iconId.split(':');
      const rawName = parts[1] || parts[0];
      componentName = rawName
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('') + 'Icon';
    }

    console.log(`⬇️ Retrieving vector icon [${iconId}]...`);
    const svg = await fetchSvg(iconId);
    const tsx = cleanSvgForReact(svg, componentName);

    const filePath = path.join(ICONS_DIR, `${componentName}.tsx`);
    fs.writeFileSync(filePath, tsx, 'utf-8');
    console.log(`✅ Auto-injected React component: src/components/ui/icons/${componentName}.tsx`);

    // Update index.ts export
    let indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');
    const exportLine = `export * from './${componentName}';\n`;
    if (!indexContent.includes(exportLine)) {
      indexContent += exportLine;
      fs.writeFileSync(INDEX_FILE, indexContent, 'utf-8');
      console.log(`📌 Updated export in: src/components/ui/icons/index.ts`);
    }

    console.log(`🎉 Ready for import in your UI:`);
    console.log(`   import { ${componentName} } from '@/components/ui/icons';\n`);
  } catch (err) {
    console.error(`❌ Injection error:`, err.message);
  }
}

async function injectPreset(presetName) {
  if (presetName === 'all') {
    console.log(`\n🚀 Auto-injecting ALL curated e-commerce icon bundles...`);
    for (const key of Object.keys(CURATED_PRESETS)) {
      await injectPreset(key);
    }
    console.log(`🌟 All icon bundles successfully injected!`);
    return;
  }

  const preset = CURATED_PRESETS[presetName];
  if (!preset) {
    console.log(`⚠️ Unknown preset "${presetName}". Available: ecommerce, payments, navigation, storefront, all`);
    return;
  }
  console.log(`\n📦 Auto-injecting curated "${presetName.toUpperCase()}" icon bundle (${preset.length} icons)...`);
  for (const item of preset) {
    await injectIcon(item.id, item.name);
  }
  console.log(`✨ All ${preset.length} icons from bundle "${presetName}" successfully injected!\n`);
}

function listInjectedIcons() {
  const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.tsx'));
  console.log(`\n📁 Current Injected Icons in src/components/ui/icons/ (${files.length} components):`);
  console.log('------------------------------------------------------------');
  files.forEach(f => {
    console.log(`  🔹 ${f.replace('.tsx', '')}`);
  });
  console.log('');
}

// CLI Routing
const args = process.argv.slice(2);
const command = args[0] || 'help';

(async () => {
  switch (command) {
    case 'search':
      const q = args[1] || 'cart';
      const set = args[2] === '--set' ? args[3] : '';
      await searchIcons(q, set);
      break;
    case 'inject':
      const id = args[1];
      let name = '';
      if (args[2] === '--as') name = args[3];
      if (!id) {
        console.log('Usage: node scripts/icon-manager.js inject <icon-id> [--as ComponentName]');
        return;
      }
      await injectIcon(id, name);
      break;
    case 'bundle':
      const b = args[1] || 'all';
      await injectPreset(b);
      break;
    case 'list':
      listInjectedIcons();
      break;
    default:
      console.log(`
Nexus Icon Manager — 200k+ Vector Icon Auto-Injection
Usage:
  node scripts/icon-manager.js search <keyword> [--set <collection>]
  node scripts/icon-manager.js inject <collection:name> [--as ComponentName]
  node scripts/icon-manager.js bundle <ecommerce|payments|navigation|storefront|all>
  node scripts/icon-manager.js list
      `);
  }
})();
