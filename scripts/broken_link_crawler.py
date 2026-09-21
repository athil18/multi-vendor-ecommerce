import urllib.request
import urllib.parse
import urllib.error
import re
import time
import json

base_url = 'https://multi-vendor-ecommerce-gq1t.onrender.com'
start_pages = [
    '/',
    '/products',
    '/stores',
    '/terms',
    '/privacy',
    '/auth/login',
    '/auth/register',
    '/checkout',
    '/customer',
    '/seller',
    '/admin'
]

discovered_links = {}  # target_url -> set of source_pages
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

print('=== STEP 1: CRAWLING PAGES FOR LINKS ===')
for page in start_pages:
    page_url = urllib.parse.urljoin(base_url, page)
    try:
        req = urllib.request.Request(page_url, headers=headers)
        res = urllib.request.urlopen(req, timeout=15)
        html = res.read().decode('utf-8', errors='ignore')
        
        # Match all href attributes
        raw_hrefs = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
        print(f'Crawled {page:20} -> Found {len(raw_hrefs)} raw links')
        
        for href in raw_hrefs:
            href = href.strip()
            # Ignore non-navigational links
            if not href or href.startswith(('javascript:', 'mailto:', 'tel:', '#')):
                continue
            
            # Normalize URL
            full_url = urllib.parse.urljoin(page_url, href)
            
            if full_url not in discovered_links:
                discovered_links[full_url] = set()
            discovered_links[full_url].add(page)
    except Exception as e:
        print(f'Error crawling {page}: {e}')

print(f'\nTotal unique links discovered across the site: {len(discovered_links)}')

print('\n=== STEP 2: VERIFYING ALL DISCOVERED LINKS ===')
verified_results = []

for idx, (url, sources) in enumerate(discovered_links.items(), 1):
    src_str = ', '.join(sorted(list(sources)))
    status = None
    ok = False
    err_msg = ''
    
    try:
        # Try GET request with streaming / partial read to avoid downloading huge media
        req = urllib.request.Request(url, headers=headers)
        res = urllib.request.urlopen(req, timeout=12)
        status = res.status
        ok = status < 400
        # Read small chunk to confirm stream
        _ = res.read(1024)
    except urllib.error.HTTPError as e:
        status = e.code
        ok = False
        err_msg = f'HTTP {e.code}'
    except Exception as ex:
        status = 'ERR'
        ok = False
        err_msg = str(ex)
    
    verified_results.append({
        'index': idx,
        'url': url,
        'status': status,
        'sources': sorted(list(sources)),
        'ok': ok,
        'error': err_msg
    })
    
    status_label = 'PASS' if ok else 'FAIL'
    print(f'[{idx:02d}/{len(discovered_links)}] [{status_label} {status}] {url} (found on: {src_str})')

broken = [r for r in verified_results if not r['ok']]
working = [r for r in verified_results if r['ok']]

print('\n=== AUDIT SUMMARY ===')
print(f'Total Unique Links Checked: {len(verified_results)}')
print(f'Passing / Working Links:    {len(working)}')
print(f'Broken / Failing Links:     {len(broken)}')

# Save JSON results
with open('scripts/broken_links_report.json', 'w', encoding='utf-8') as f:
    json.dump({
        'timestamp': time.time(),
        'total': len(verified_results),
        'passing': len(working),
        'broken_count': len(broken),
        'working_links': working,
        'broken_links': broken
    }, f, indent=2)

print('Saved report to scripts/broken_links_report.json')
