const candidates = [
  // Eames Lounge Chair & Ottoman
  { id: 'eames-1', url: 'https://images.unsplash.com/photo-1580481077194-c1114b09b577?auto=format&fit=crop&q=80&w=1000' },
  { id: 'eames-2', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000' },
  { id: 'eames-3', url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80&w=1000' },
  { id: 'eames-4', url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1000' },

  // Leather Weekender Duffle Bag
  { id: 'duffle-1', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1000' },
  { id: 'duffle-2', url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=1000' },
  { id: 'duffle-3', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1000' },
  { id: 'duffle-4', url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&q=80&w=1000' },

  // Cashmere Overcoat
  { id: 'overcoat-1', url: 'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&q=80&w=1000' },
  { id: 'overcoat-2', url: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'overcoat-3', url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=1000' },
  { id: 'overcoat-4', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000' },

  // Nike Dunk Panda (Black & White Sneakers)
  { id: 'panda-1', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1000' },
  { id: 'panda-2', url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=1000' },
  { id: 'panda-3', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=1000' },
  { id: 'panda-4', url: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&q=80&w=1000' },

  // Luxury Face Cream / Skincare Jar
  { id: 'cream-1', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=1000' },
  { id: 'cream-2', url: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1000' },
  { id: 'cream-3', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1000' },
  { id: 'cream-4', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1000' },

  // Augustinus Bader (Luxury Skincare / Cobalt Serum Pump)
  { id: 'bader-1', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1000' },
  { id: 'bader-2', url: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1000' },
  { id: 'bader-3', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=1000' },

  // Le Labo Santal 33 (Apothecary niche perfume)
  { id: 'santal-1', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000' },
  { id: 'santal-2', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000' },
  { id: 'santal-3', url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1000' },

  // Tom Ford Tobacco Vanille (Dark luxury niche flacon)
  { id: 'vanille-1', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000' },
  { id: 'vanille-2', url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1000' },
  { id: 'vanille-3', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000' }
];

Promise.all(candidates.map(async c => {
  try {
    const res = await fetch(c.url, { method: 'HEAD' });
    return { id: c.id, status: res.status, ok: res.ok, url: c.url };
  } catch (err) {
    return { id: c.id, ok: false, error: err.message };
  }
})).then(results => {
  results.forEach(r => console.log(`${r.id}: ${r.ok ? 'OK (200)' : 'FAILED (' + (r.status || r.error) + ')'} -> ${r.url}`));
});
