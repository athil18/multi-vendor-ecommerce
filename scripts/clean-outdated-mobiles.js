const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '..', 'src', 'data', 'products.json');
const BACKUP_PATH = path.join(__dirname, '..', 'src', 'data', 'products.json.pre-mobile-purge');

const raw = fs.readFileSync(PRODUCTS_PATH, 'utf8');
fs.writeFileSync(BACKUP_PATH, raw, 'utf8');

const products = JSON.parse(raw);
console.log(`Original catalog count: ${products.length}`);

// Target outdated & unpopular mobile IDs identified in user screenshots & audit
const PURGE_IDS = new Set([
  'prod-123', // iPhone X (2017)
  'prod-124', // Oppo A57 (2016 legacy budget phone)
  'prod-125', // Oppo F19 Pro Plus
  'prod-126', // Oppo K1
  'prod-127', // Realme C35
  'prod-128', // Realme X (2019 pop-up phone)
  'prod-129', // Realme XT
  'prod-130', // Samsung Galaxy S7 (2016)
  'prod-131', // Samsung Galaxy S8 (2017)
  'prod-132', // Samsung Galaxy S10 (2019)
  'prod-133', // Vivo S1 (2019 budget phone)
  'prod-134', // Vivo V9 (2018 budget phone)
  'prod-135', // Vivo X21 (2018 budget phone)
  'prod-218', // Sleek Mirror Finish Phone Case (unpopular cheap accessory)
  'prod-103', // Apple iPhone Charger (outdated 5W wire/charger)
  'prod-160', // Samsung Galaxy Tab White (obsolete 2014-era tablet)
]);

const purged = products.filter(p => PURGE_IDS.has(p.id));
console.log(`Identified ${purged.length} outdated items to purge:`);
purged.forEach(p => console.log(` - [${p.id}] ${p.name}`));

const filtered = products.filter(p => !PURGE_IDS.has(p.id));

// Add modern flagship smartphones representing the pinnacle of popular tech
const modernFlagships = [
  {
    id: "flagship-iphone-15-pro-max",
    _id: "flagship-iphone-15-pro-max",
    name: "Apple iPhone 15 Pro Max Natural Titanium",
    slug: "apple-iphone-15-pro-max-natural-titanium",
    description: "Forged in aerospace-grade titanium with the breakthrough A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever featuring 5x optical telephoto.",
    basePrice: 1199.99,
    price: 1199.99,
    compareAtPrice: 1299.99,
    stock: 25,
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=1200"
    ],
    category: {
      id: "cat-tech",
      name: "Tech & Electronics",
      slug: "tech-electronics"
    },
    categoryId: {
      id: "cat-tech",
      name: "Tech & Electronics",
      slug: "tech-electronics"
    },
    categoryName: "Tech & Electronics",
    seller: {
      id: "seller-techgear-pro",
      name: "TechGear Pro Laboratories",
      email: "lab@techgearpro.com",
      store: {
        id: "seller-techgear-pro",
        name: "TechGear Pro Laboratories",
        slug: "techgear-pro"
      }
    },
    sellerId: {
      id: "seller-techgear-pro",
      name: "TechGear Pro Laboratories",
      email: "lab@techgearpro.com",
      store: {
        id: "seller-techgear-pro",
        name: "TechGear Pro Laboratories",
        slug: "techgear-pro"
      }
    },
    storeName: "TechGear Pro Laboratories",
    store: {
      id: "seller-techgear-pro",
      name: "TechGear Pro Laboratories",
      slug: "techgear-pro"
    },
    rating: 5.0,
    averageRating: 5.0,
    numReviews: 482,
    reviewCount: 482,
    variants: [
      {
        id: "ip15-256",
        name: "Natural Titanium / 256GB",
        sku: "IP15PM-NAT-256",
        price: 1199.99,
        priceModifier: 0,
        colorHex: "#8D8B88",
        stock: 15,
        isPopular: true,
        imageIndex: 0
      },
      {
        id: "ip15-512",
        name: "Black Titanium / 512GB",
        sku: "IP15PM-BLK-512",
        price: 1399.99,
        priceModifier: 200,
        colorHex: "#2D2C2E",
        stock: 10,
        imageIndex: 0
      }
    ],
    source: "curated-flagship",
    approvalStatus: "approved",
    qualityScore: 99,
    isApproved: true,
    inStock: true,
    specs: {
      "Processor": "Apple A17 Pro (3nm architecture, 6-core GPU with hardware ray tracing)",
      "Display": "6.7\" Super Retina XDR OLED (1-120Hz ProMotion, Always-On, 2000 nits peak)",
      "Camera System": "Pro Array: 48MP Main (f/1.78 sensor-shift), 12MP Ultra-Wide, 12MP 5x Telephoto (120mm)",
      "Chassis": "Aerospace-grade Grade 5 Titanium with textured matte glass back",
      "Connector": "USB-C with USB 3 speeds (up to 10Gbps)",
      "Water Resistance": "IP68 rated under IEC standard 60529"
    },
    benefits: [
      "Groundbreaking A17 Pro gaming performance and console-quality rendering",
      "5x optical zoom at 120mm gives the longest optical reach ever on iPhone",
      "Action button provides fast tactile access to silence, camera, flashlight, or shortcuts"
    ],
    tags: ["tech-electronics", "flagship", "smartphones", "apple", "luxury"],
    materials: "Grade 5 Aerospace Titanium & Ceramic Shield Glass"
  },
  {
    id: "flagship-galaxy-s24-ultra",
    _id: "flagship-galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra Titanium Gray",
    slug: "samsung-galaxy-s24-ultra-titanium-gray",
    description: "The ultimate Galaxy experience powered by Galaxy AI, a built-in S Pen, titanium exterior frame, and a pro-grade 200MP Quad Telephoto optical camera system.",
    basePrice: 1299.99,
    price: 1299.99,
    compareAtPrice: 1419.99,
    stock: 18,
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=1200"
    ],
    category: {
      id: "cat-tech",
      name: "Tech & Electronics",
      slug: "tech-electronics"
    },
    categoryId: {
      id: "cat-tech",
      name: "Tech & Electronics",
      slug: "tech-electronics"
    },
    categoryName: "Tech & Electronics",
    seller: {
      id: "seller-techgear-pro",
      name: "TechGear Pro Laboratories",
      email: "lab@techgearpro.com",
      store: {
        id: "seller-techgear-pro",
        name: "TechGear Pro Laboratories",
        slug: "techgear-pro"
      }
    },
    sellerId: {
      id: "seller-techgear-pro",
      name: "TechGear Pro Laboratories",
      email: "lab@techgearpro.com",
      store: {
        id: "seller-techgear-pro",
        name: "TechGear Pro Laboratories",
        slug: "techgear-pro"
      }
    },
    storeName: "TechGear Pro Laboratories",
    store: {
      id: "seller-techgear-pro",
      name: "TechGear Pro Laboratories",
      slug: "techgear-pro"
    },
    rating: 4.9,
    averageRating: 4.9,
    numReviews: 394,
    reviewCount: 394,
    variants: [
      {
        id: "s24u-256",
        name: "Titanium Gray / 256GB",
        sku: "S24U-GRY-256",
        price: 1299.99,
        priceModifier: 0,
        colorHex: "#71706E",
        stock: 12,
        isPopular: true,
        imageIndex: 0
      },
      {
        id: "s24u-512",
        name: "Titanium Black / 512GB",
        sku: "S24U-BLK-512",
        price: 1419.99,
        priceModifier: 120,
        colorHex: "#232323",
        stock: 6,
        imageIndex: 0
      }
    ],
    source: "curated-flagship",
    approvalStatus: "approved",
    qualityScore: 99,
    isApproved: true,
    inStock: true,
    specs: {
      "Processor": "Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm)",
      "Display": "6.8\" Dynamic AMOLED 2X Flat Display with Corning Gorilla Armor (2600 nits)",
      "Camera System": "Quad Optical Array: 200MP Wide OIS, 50MP 5x Periscope, 10MP 3x Telephoto, 12MP Ultra-Wide",
      "Productivity": "Integrated S Pen with Bluetooth Air Actions",
      "Battery & Charging": "5,000mAh with 45W Super Fast Charging 2.0 & Fast Wireless Charging 2.0",
      "Intelligence": "Galaxy AI suite with Live Translate, Circle to Search, and Generative Photo Edit"
    },
    benefits: [
      "Corning Gorilla Armor reduces ambient screen glare by up to 75%",
      "Built-in S Pen offers precision writing, annotating, and remote shutter release",
      "Industry-leading 7 years of major OS upgrades and security patches"
    ],
    tags: ["tech-electronics", "flagship", "smartphones", "samsung", "luxury"],
    materials: "Titanium Shield Frame & Corning Gorilla Armor Glass"
  }
];

// Insert modern flagships near the beginning of Tech
const finalProducts = [...modernFlagships, ...filtered];
console.log(`New catalog count: ${finalProducts.length}`);

fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(finalProducts, null, 2), 'utf8');
console.log('Successfully updated src/data/products.json!');
