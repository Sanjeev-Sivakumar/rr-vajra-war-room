import urllib.request
import re

def verify():
    base_url = 'https://sanjeev-sivakumar.github.io/rr-vajra-war-room/'
    req = urllib.request.Request(base_url, headers={'User-Agent': 'Mozilla/5.0'})
    
    print('1. Checking HTML document...')
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        print(f'   Status: {resp.status} OK (Length: {len(html)} bytes)')

    # Find JS and CSS
    js_match = re.search(r'src=["\']\./(assets/index-[^"\']+\.js)["\']', html)
    css_match = re.search(r'href=["\']\./(assets/index-[^"\']+\.css)["\']', html)

    print('2. Checking JS Bundle & Static Datasets...')
    if js_match:
        js_url = base_url + js_match.group(1)
        req_js = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_js) as r:
            js_data = r.read()
            print(f'   Status: {r.status} OK ({len(js_data):,} bytes)')
            
            # Verify embedded datasets
            checks = [
                (b'Rahul Tripathi', 'Top 1 Batter data'),
                (b'Eshan Malinga', 'Top 1 Bowler data'),
                (b'14159', 'Match 14159 SRH vs MI thriller data'),
                (b'Project Vajra', 'App title and core branding'),
                (b'0.9654', 'Model ROC-AUC metric'),
                (b'199029', 'Total deliveries volume')
            ]
            for term, desc in checks:
                if term in js_data:
                    print(f'   [PASS] {desc}')
                else:
                    print(f'   [FAIL] {desc}')
    else:
        print('   [FAIL] Could not parse JS bundle from HTML!')

    print('3. Checking CSS Bundle & Tailwind Themes...')
    if css_match:
        css_url = base_url + css_match.group(1)
        req_css = urllib.request.Request(css_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_css) as r:
            css_data = r.read()
            print(f'   Status: {r.status} OK ({len(css_data):,} bytes)')
            if b'#ea1a85' in css_data.lower():
                print('   [PASS] Rajasthan Royals Signature Pink styling confirmed')
    else:
        print('   [FAIL] Could not parse CSS bundle from HTML!')

    print('4. Checking Official Rajasthan Royals Logo Image...')
    logo_url = base_url + 'rr_official_logo.jpg'
    req_logo = urllib.request.Request(logo_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_logo) as r:
        logo_data = r.read()
        print(f'   Status: {r.status} OK (Size: {len(logo_data):,} bytes)')
        print('   [PASS] Official RR Crest loaded successfully')

if __name__ == '__main__':
    verify()

