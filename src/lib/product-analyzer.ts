/**
 * Product Quality & Governance Analyzing Engine
 * Implements automated multi-dimensional compliance scoring and approval gating
 * 
 * @agent catalog-quality-auditor
 * @agent governance-compliance-checker
 * @agent design-brand-guardian
 */

export interface ProductAuditResult {
  productId: string;
  name: string;
  qualityScore: number; // 0 - 100
  status: 'published' | 'approved' | 'rejected' | 'pending_review';
  checks: {
    titleQuality: { passed: boolean; score: number; reason?: string };
    imageIntegrity: { passed: boolean; score: number; validUrls: string[]; reason?: string };
    pricingViability: { passed: boolean; score: number; reason?: string };
    descriptionDepth: { passed: boolean; score: number; reason?: string };
    inventoryReadiness: { passed: boolean; score: number; reason?: string };
    vendorGovernance: { passed: boolean; score: number; reason?: string };
  };
  approvedForDisplay: boolean;
  rejectionReasons: string[];
}

const BANNED_DOMAINS = ['placehold.co', 'example.com', 'placeimg.com', 'pravatar.cc', 'delacruz.com', 'veirdo.in'];

/**
 * Analyzes a single product record against platform quality and marketplace standards.
 */
export function analyzeProduct(product: any): ProductAuditResult {
  const rejectionReasons: string[] = [];
  let score = 0;

  // 1. Title Quality Check (Max 20 points)
  const title = (product.name || '').trim();
  let titleScore = 0;
  let titlePassed = false;
  let titleReason = '';

  if (!title || title.length < 5) {
    titleReason = 'Title is too short or missing';
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
  const validImages: string[] = [];

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
    imageReason = 'Zero valid, non-placeholder images found';
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
    descReason = 'Description is too brief to inform buyers';
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
    stockScore = 5; // Backorderable or draft
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
    vendorReason = 'Product is unassigned to a registered merchant';
    rejectionReasons.push(vendorReason);
  } else {
    vendorScore = 10;
    vendorPassed = true;
  }
  score += vendorScore;

  // Decision Gate: Must achieve >= 70 points AND zero critical rejections
  const approvedForDisplay = score >= 70 && rejectionReasons.length === 0;
  const status: 'published' | 'approved' | 'rejected' | 'pending_review' = 
    approvedForDisplay ? 'published' : 'rejected';

  return {
    productId: product.id || product._id || '',
    name: title,
    qualityScore: score,
    status,
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

/**
 * Batch analyzes an entire catalog, returning audited records and metric distributions.
 */
export function analyzeAndApproveCatalog(products: any[]) {
  const audited: any[] = [];
  const rejected: any[] = [];
  let totalScore = 0;

  for (const product of products) {
    const analysis = analyzeProduct(product);
    if (analysis.approvedForDisplay) {
      audited.push({
        ...product,
        status: 'published',
        governanceScore: analysis.qualityScore,
        isApproved: true,
        approvedAt: new Date().toISOString(),
      });
      totalScore += analysis.qualityScore;
    } else {
      rejected.push({
        ...product,
        status: 'rejected',
        governanceScore: analysis.qualityScore,
        isApproved: false,
        rejectionReasons: analysis.rejectionReasons,
      });
    }
  }

  const averageScore = audited.length > 0 ? Number((totalScore / audited.length).toFixed(1)) : 0;
  const approvalRate = Number(((audited.length / products.length) * 100).toFixed(1));

  return {
    approvedProducts: audited,
    rejectedProducts: rejected,
    totalAudited: products.length,
    totalApproved: audited.length,
    totalRejected: rejected.length,
    averageQualityScore: averageScore,
    approvalRatePercent: approvalRate,
  };
}
