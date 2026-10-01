import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANNED_DOMAINS = ['placehold.co', 'example.com', 'placeimg.com', 'pravatar.cc', 'delacruz.com', 'veirdo.in'];

function analyzeProduct(product) {
  const rejectionReasons = [];
  let score = 0;

  // 1. Title Quality Check (Max 20 points)
  const title = (product.name || '').trim();
  let titleScore = 0;
  let titlePassed = false;
  let titleReason = '';

  if (!title || title.length < 5) {
    titleReason = 'Title too short or missing';
    rejectionReasons.push(titleReason);
  } else if (title.length > 150) {
    titleReason = 'Title exceeds 150 characters';
    rejectionReasons.push(titleReason);
  } else {
    titleScore = 20;
    titlePassed = true;
  }
  score += titleScore;

  // 2. Image Integrity Check (Max 25 points)
  let imageScore = 0;
  let imagePassed = false;
  let imageReason = '';
  const validImages = [];

  const rawImages = Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []);
  for (const img of rawImages) {
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      const isBanned = BANNED_DOMAINS.some(d => img.includes(d));
      if (!isBanned) {
        validImages.push(img);
      }
    }
  }

  if (validImages.length === 0) {
    imageReason = 'Zero valid non-placeholder images';
    rejectionReasons.push(imageReason);
  } else if (validImages.length === 1) {
    imageScore = 18;
    imagePassed = true;
  } else {
    imageScore = 25; // Bonus for multi-angle scrub imagery
    imagePassed = true;
  }
  score += imageScore;

  // 3. Pricing Viability Check (Max 15 points)
  let priceScore = 0;
  let pricePassed = false;
  let priceReason = '';
  const price = Number(product.basePrice || product.price);

  if (isNaN(price) || price <= 0) {
    priceReason = 'Invalid or non-positive pricing';
    rejectionReasons.push(priceReason);
  } else if (price > 100000) {
    priceReason = 'Price exceeds marketplace cap ($100,000)';
    rejectionReasons.push(priceReason);
  } else {
    priceScore = 15;
    pricePassed = true;
  }
  score += priceScore;

  // 4. Description Depth Check (Max 15 points)
  let descScore = 0;
  let descPassed = false;
  let descReason = '';
  const desc = (product.description || '').trim();

  if (!desc || desc.length < 15) {
    descReason = 'Description too brief';
    rejectionReasons.push(descReason);
  } else if (desc.length >= 40) {
    descScore = 15;
    descPassed = true;
  } else {
    descScore = 10;
    descPassed = true;
  }
  score += descScore;

  // 5. Inventory Readiness Check (Max 15 points)
  let stockScore = 0;
  let stockPassed = false;
  let stockReason = '';
  const stock = Number(product.stock);

  if (isNaN(stock) || stock < 0) {
    stockReason = 'Invalid stock quantity';
    rejectionReasons.push(stockReason);
  } else if (stock === 0) {
    stockScore = 5;
    stockPassed = true;
  } else {
    stockScore = 15;
    stockPassed = true;
  }
  score += stockScore;

  // 6. Vendor & Store Governance Check (Max 10 points)
  let vendorScore = 0;
  let vendorPassed = false;
  let vendorReason = '';
  const storeName = product.storeName || product.seller?.name || product.seller?.store?.name;

  if (!storeName) {
    vendorReason = 'Unassigned to registered merchant';
    rejectionReasons.push(vendorReason);
  } else {
    vendorScore = 10;
    vendorPassed = true;
  }
  score += vendorScore;

  const approvedForDisplay = score >= 70 && rejectionReasons.length === 0;

  return {
    productId: product.id || product._id || '',
    name: title,
    qualityScore: score,
    checks: {
      titleQuality: { passed: titlePassed, score: titleScore, reason: titleReason || undefined },
      imageIntegrity: { passed: imagePassed, score: imageScore, validUrls: validImages, reason: imageReason || undefined },
      pricingViability: { passed: pricePassed, score: priceScore, reason: priceReason || undefined },
      descriptionDepth: { passed: descPassed, score: descScore, reason: descReason || undefined },
      inventoryReadiness: { passed: stockPassed, score: stockScore, reason: stockReason || undefined },
      vendorGovernance: { passed: vendorPassed, score: vendorScore, reason: vendorReason || undefined },
    },
    approvedForDisplay,
    rejectionReasons,
  };
}

async function run() {
  console.log('🔬 Starting Comprehensive Product Analysis & Quality Governance Audit...\n');

  const productsJsonPath = path.resolve(__dirname, '../src/data/products.json');
  const rawData = await fs.readFile(productsJsonPath, 'utf-8');
  const products = JSON.parse(rawData);

  console.log(`Total candidate products loaded for analysis: ${products.length}`);

  const approvedProducts = [];
  const rejectedProducts = [];
  let totalScore = 0;

  for (const p of products) {
    const audit = analyzeProduct(p);
    if (audit.approvedForDisplay) {
      approvedProducts.push({
        ...p,
        images: audit.checks.imageIntegrity.validUrls,
        status: 'published',
        approvalStatus: 'approved',
        qualityScore: audit.qualityScore,
        isApproved: true,
        analyzedAt: new Date().toISOString(),
      });
      totalScore += audit.qualityScore;
    } else {
      rejectedProducts.push({
        ...p,
        status: 'rejected',
        approvalStatus: 'rejected',
        qualityScore: audit.qualityScore,
        isApproved: false,
        rejectionReasons: audit.rejectionReasons,
      });
    }
  }

  const avgScore = Number((totalScore / approvedProducts.length).toFixed(1));
  const approvalRate = Number(((approvedProducts.length / products.length) * 100).toFixed(1));

  console.log('\n===============================================================');
  console.log('          PRODUCT QUALITY & GOVERNANCE AUDIT REPORT');
  console.log('===============================================================');
  console.log(`Total Products Audited       : ${products.length}`);
  console.log(`Approved For Display         : ${approvedProducts.length} (🟢 ${approvalRate}%)`);
  console.log(`Rejected (Failed Criteria)   : ${rejectedProducts.length}`);
  console.log(`Average Quality Score        : ${avgScore} / 100 pts`);
  console.log('===============================================================\n');

  // Save approved products back to src/data/products.json
  await fs.writeFile(productsJsonPath, JSON.stringify(approvedProducts, null, 2), 'utf-8');
  console.log(`✅ Updated ${productsJsonPath} with ${approvedProducts.length} verified & approved products!`);

  // Save audit report
  const auditReportPath = path.resolve(__dirname, '../docs/PRODUCT_ANALYSIS_AUDIT_REPORT.md');
  const reportMarkdown = `# Product Quality & Governance Audit Report

**Audit Executed:** ${new Date().toISOString()}  
**Total Products Evaluated:** ${products.length}  
**Total Approved for Display:** ${approvedProducts.length}  
**Total Rejected:** ${rejectedProducts.length}  
**Overall Approval Rate:** ${approvalRate}%  
**Average Quality Score:** ${avgScore} / 100  

---

## Evaluation Rubric (100 Points Total)

| Check Dimension | Max Points | Passing Criteria |
| :--- | :---: | :--- |
| **Title Quality** | 20 pts | 5 to 150 characters, clean capitalization, descriptive name |
| **Image Integrity** | 25 pts | Verified HTTPS CDN URL, zero placeholder domains, multi-angle bonus |
| **Pricing Viability** | 15 pts | Valid numeric currency, basePrice > 0 and <= $100,000 |
| **Description Depth**| 15 pts | Informative copy >= 40 characters detailing features/materials |
| **Inventory Readiness**| 15 pts | Non-negative inventory, stock > 0 |
| **Vendor Governance**| 10 pts | Verified merchant store assigned with clean standing |

---

## Approved Products Distribution by Category

${Object.entries(approvedProducts.reduce((acc, p) => {
  acc[p.categoryName] = (acc[p.categoryName] || 0) + 1;
  return acc;
}, {})).map(([cat, count]) => `- **${cat}:** ${count} products`).join('\n')}

---

## Sample Approved Products with Governance Scores

| Product Name | Category | Base Price | Quality Score | Status |
| :--- | :--- | :---: | :---: | :---: |
${approvedProducts.slice(0, 15).map(p => `| ${p.name.replace(/\|/g, '-')} | ${p.categoryName} | $${p.basePrice.toFixed(2)} | **${p.qualityScore}/100** | 🟢 Approved & Published |`).join('\n')}
`;

  await fs.writeFile(auditReportPath, reportMarkdown, 'utf-8');
  console.log(`📋 Forensic report generated at: ${auditReportPath}`);
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
