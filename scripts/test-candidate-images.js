// Test candidates for each flagship product
const candidates = {
  // 1. Eames Lounge Chair & Ottoman
  eames: [
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200', // Mid-century leather lounge chair
    'https://images.unsplash.com/photo-1580481077195-c328a37db779?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200'
  ],
  // 2. Tuscan Leather Weekender Duffle
  duffle: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1200', // Brown leather duffle / weekender bag
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1200', // Brown leather travel bag
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1200'
  ],
  // 3. Tailored Cashmere Overcoat
  overcoat: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1200', // Men in tailored winter coat
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=1200', // Man wearing tailored overcoat
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200'
  ],
  // 4. Tuscan Goodyear Chelsea Boots
  chelseaBoots: [
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=1200', // Classic leather chelsea boots
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=1200'
  ],
  // 5. Nike Dunk Low Panda (Black and White court sneaker)
  pandaSneaker: [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1200', // Nike sneakers
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=80&w=1200', // Nike court sneaker
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=1200'
  ],
  // 6. La Mer Moisturizing Cream (Luxury white cream jar)
  laMerCream: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200', // Minimal white cosmetic cream jar
    'https://images.unsplash.com/photo-1608248597359-0091871a39fa?auto=format&fit=crop&q=80&w=1200', // Luxury cream jar on marble
    'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1200', // Aesthetic cosmetic jar
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200'
  ],
  // 7. Augustinus Bader Rich Cream (Luxury pump / bottle)
  richCream: [
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=1200', // Luxury skincare pump/serum
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1608248597359-0091871a39fa?auto=format&fit=crop&q=80&w=1200'
  ],
  // 8. Le Labo Santal 33 (Minimalist apothecary glass flacon)
  santal33: [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200', // Artisanal glass perfume bottle
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200', // Minimalist clear perfume bottle
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200'
  ],
  // 9. Tom Ford Tobacco Vanille (Dark amber/brown luxury perfume bottle)
  tobaccoVanille: [
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200', // Dark amber/black glass luxury fragrance
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200', // Luxury dark perfume bottle
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1200'
  ]
};

const fs = require('fs');

async function testAll() {
  console.log('Testing candidates...');
  for (const [key, list] of Object.entries(candidates)) {
    for (let i = 0; i < list.length; i++) {
      const url = list[i];
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(`./scripts/candidate_${key}_${i}.jpg`, buf);
          console.log(`Saved candidate_${key}_${i}.jpg (${Math.round(buf.length/1024)}KB)`);
        } else {
          console.log(`Failed HTTP ${res.status}: ${key}_${i}`);
        }
      } catch (e) {
        console.log(`Error ${key}_${i}: ${e.message}`);
      }
    }
  }
}

testAll();
