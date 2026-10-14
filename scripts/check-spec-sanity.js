const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

const idsToRemove = new Set([
  'prod-15', 'prod-43', 'prod-44', 'prod-109', 'prod-146', 'prod-147', 'prod-148',
  'prod-149', 'prod-150', 'prod-151', 'prod-152', 'prod-98', 'prod-101', 'prod-102',
  'prod-104', 'prod-106', 'prod-108', 'prod-110', 'prod-111', 'prod-107', 'prod-171',
  'prod-172', 'prod-173', 'prod-174', 'prod-175', 'prod-181', 'prod-182', 'prod-183',
  'prod-199', 'prod-225', 'prod-237', 'prod-238', 'prod-240', 'prod-241', 'prod-326',
  'prod-84', 'prod-161', 'prod-162', 'prod-164', 'prod-179', 'prod-194', 'prod-196',
  'prod-197', 'prod-200', 'prod-202', 'prod-203', 'prod-204', 'prod-205', 'prod-208',
  'prod-209', 'prod-184', 'prod-186', 'prod-187', 'prod-227', 'prod-228', 'prod-229',
  'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-117', 'prod-118', 'prod-119'
]);

const clean100 = products.filter(p => !idsToRemove.has(p.id));

console.log(`Checking ${clean100.length} clean products for spec/semantic sanity...`);

let specIssues = 0;
clean100.forEach(p => {
  const name = p.name.toLowerCase();
  const specs = JSON.stringify(p.specs || {}).toLowerCase();
  const cat = (p.category?.name || '').toLowerCase();
  const store = (p.storeName || '').toLowerCase();

  // Check for watch movement on non-watch
  if (specs.includes('cosc') || specs.includes('horological')) {
    if (!name.includes('watch') && !name.includes('calibre') && !name.includes('rolex') && !name.includes('longines') && !name.includes('iwc')) {
      console.log(`ISSUE: Watch specs on ${p.id} (${p.name})`);
      specIssues++;
    }
  }

  // Check store sanity
  if (store.includes('horologie') && !cat.includes('jewelry') && !cat.includes('watch')) {
    console.log(`ISSUE: Watchmaker store on ${p.id} (${p.name}) in ${cat}`);
    specIssues++;
  }
});

console.log(`Spec sanity check finished. Issues: ${specIssues}`);
