#!/usr/bin/env python3
"""
Generator 6 ikon grup - kolorowe okrągłe odznaki w stylu logo dla dzieci.
Format: 400x400 SVG (kwadratowe, łatwe do wyświetlenia jako kafelek).
"""

import os
OUT = os.path.dirname(os.path.abspath(__file__))

def save(name, body, bg='#ffd93d', border='#5a3a26'):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<circle cx="200" cy="200" r="180" fill="{bg}" stroke="{border}" stroke-width="12"/>
{body}
</svg>'''
    path = os.path.join(OUT, f"{name}.svg")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"  {name}.svg ({len(svg)} B)")


# 1. PSZCZÓŁKA
save('pszczolka', '''
<g transform="translate(200,200)">
  <ellipse cx="0" cy="0" rx="80" ry="55" fill="#ffd93d" stroke="#2c3e50" stroke-width="4"/>
  <rect x="-65" y="-20" width="130" height="15" fill="#2c3e50"/>
  <rect x="-65" y="5" width="130" height="15" fill="#2c3e50"/>
  <ellipse cx="-30" cy="-50" rx="40" ry="25" fill="white" opacity="0.7"/>
  <ellipse cx="30" cy="-50" rx="40" ry="25" fill="white" opacity="0.7"/>
  <circle cx="-65" cy="0" r="22" fill="#ffd93d" stroke="#2c3e50" stroke-width="3"/>
  <circle cx="-72" cy="-5" r="4" fill="#2c3e50"/>
  <circle cx="-58" cy="-5" r="4" fill="#2c3e50"/>
  <path d="M-72,5 Q-65,12 -58,5" stroke="#2c3e50" stroke-width="3" fill="none"/>
</g>
''', bg='#fff8dc')

# 2. ŻOŁĄDŹ
save('zoladz', '''
<g transform="translate(200,210)">
  <ellipse cx="0" cy="20" rx="65" ry="100" fill="#d4a574" stroke="#5a3a26" stroke-width="4"/>
  <ellipse cx="0" cy="-30" rx="80" ry="40" fill="#5a3a26"/>
  <ellipse cx="0" cy="-30" rx="80" ry="40" fill="none" stroke="#3d2814" stroke-width="3"/>
  <!-- siateczka czapeczki -->
  <line x1="-50" y1="-50" x2="-30" y2="-10" stroke="#3d2814" stroke-width="2"/>
  <line x1="-20" y1="-55" x2="-10" y2="-10" stroke="#3d2814" stroke-width="2"/>
  <line x1="10" y1="-55" x2="20" y2="-10" stroke="#3d2814" stroke-width="2"/>
  <line x1="40" y1="-50" x2="35" y2="-10" stroke="#3d2814" stroke-width="2"/>
  <!-- ogonek -->
  <line x1="0" y1="-65" x2="-5" y2="-95" stroke="#3d2814" stroke-width="6" stroke-linecap="round"/>
  <!-- twarzyczka -->
  <circle cx="-15" cy="40" r="5" fill="#5a3a26"/>
  <circle cx="15" cy="40" r="5" fill="#5a3a26"/>
  <path d="M-12,60 Q0,70 12,60" stroke="#5a3a26" stroke-width="4" fill="none" stroke-linecap="round"/>
</g>
''', bg='#a8e6a3')

# 3. LISEK
save('lisek', '''
<g transform="translate(200,210)">
  <!-- głowa -->
  <circle cx="0" cy="20" r="100" fill="#e67e22" stroke="#3d2814" stroke-width="4"/>
  <!-- uszy -->
  <polygon points="-80,-50 -40,-10 -90,30" fill="#e67e22" stroke="#3d2814" stroke-width="4"/>
  <polygon points="80,-50 40,-10 90,30" fill="#e67e22" stroke="#3d2814" stroke-width="4"/>
  <polygon points="-72,-30 -52,5 -75,15" fill="#3d2814"/>
  <polygon points="72,-30 52,5 75,15" fill="#3d2814"/>
  <!-- mordka biała -->
  <ellipse cx="0" cy="50" rx="50" ry="40" fill="white"/>
  <!-- nos -->
  <ellipse cx="0" cy="35" rx="14" ry="10" fill="#2c3e50"/>
  <!-- oczy -->
  <circle cx="-30" cy="0" r="8" fill="#2c3e50"/>
  <circle cx="30" cy="0" r="8" fill="#2c3e50"/>
  <circle cx="-28" cy="-2" r="3" fill="white"/>
  <circle cx="32" cy="-2" r="3" fill="white"/>
  <!-- pyszczek -->
  <path d="M-15,55 Q0,65 15,55" stroke="#2c3e50" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>
''', bg='#fff5e1')

# 4. SOWA
save('sowka', '''
<g transform="translate(200,210)">
  <!-- ciało -->
  <ellipse cx="0" cy="20" rx="105" ry="120" fill="#8b5a3c" stroke="#3d2814" stroke-width="4"/>
  <ellipse cx="0" cy="50" rx="65" ry="60" fill="#d4a574"/>
  <!-- "uszy" -->
  <polygon points="-70,-95 -45,-130 -30,-90" fill="#5a3a26"/>
  <polygon points="70,-95 45,-130 30,-90" fill="#5a3a26"/>
  <!-- oczy -->
  <circle cx="-32" cy="-10" r="35" fill="white" stroke="#3d2814" stroke-width="3"/>
  <circle cx="32" cy="-10" r="35" fill="white" stroke="#3d2814" stroke-width="3"/>
  <circle cx="-32" cy="-10" r="22" fill="#ffd93d"/>
  <circle cx="32" cy="-10" r="22" fill="#ffd93d"/>
  <circle cx="-32" cy="-10" r="14" fill="#2c3e50"/>
  <circle cx="32" cy="-10" r="14" fill="#2c3e50"/>
  <circle cx="-28" cy="-14" r="4" fill="white"/>
  <circle cx="36" cy="-14" r="4" fill="white"/>
  <!-- dziób -->
  <polygon points="-12,25 0,55 12,25" fill="#ffd93d" stroke="#3d2814" stroke-width="2"/>
  <!-- pióra -->
  <circle cx="-30" cy="80" r="10" fill="#5a3a26" opacity="0.5"/>
  <circle cx="30" cy="80" r="10" fill="#5a3a26" opacity="0.5"/>
  <circle cx="0" cy="100" r="12" fill="#5a3a26" opacity="0.5"/>
</g>
''', bg='#1a3a5c', border='#0d1d2e')

# 5. GRZYBEK (muchomor - rozpoznawalny)
save('grzybek', '''
<g transform="translate(200,220)">
  <!-- nóżka -->
  <rect x="-30" y="0" width="60" height="100" fill="white" stroke="#5a3a26" stroke-width="4" rx="6"/>
  <!-- kapelusz -->
  <ellipse cx="0" cy="-30" rx="120" ry="80" fill="#e74c3c" stroke="#5a3a26" stroke-width="4"/>
  <ellipse cx="0" cy="-50" rx="100" ry="50" fill="#e74c3c"/>
  <!-- kropki -->
  <circle cx="-50" cy="-50" r="14" fill="white"/>
  <circle cx="40" cy="-65" r="16" fill="white"/>
  <circle cx="-15" cy="-30" r="11" fill="white"/>
  <circle cx="60" cy="-30" r="13" fill="white"/>
  <circle cx="-80" cy="-25" r="10" fill="white"/>
  <circle cx="0" cy="-75" r="11" fill="white"/>
  <!-- twarzyczka na nóżce -->
  <circle cx="-10" cy="40" r="4" fill="#5a3a26"/>
  <circle cx="10" cy="40" r="4" fill="#5a3a26"/>
  <path d="M-8,60 Q0,68 8,60" stroke="#5a3a26" stroke-width="3" fill="none"/>
</g>
''', bg='#a8e6a3')

# 6. SOSENKA
save('sosenka', '''
<g transform="translate(200,210)">
  <!-- pień -->
  <rect x="-15" y="80" width="30" height="60" fill="#5a3a26" stroke="#3d2814" stroke-width="3"/>
  <!-- 3 trójkąty -->
  <polygon points="0,-130 -110,80 110,80" fill="#2d5016" stroke="#1a3009" stroke-width="3"/>
  <polygon points="0,-160 -90,30 90,30" fill="#3d6e26" stroke="#1a3009" stroke-width="3"/>
  <polygon points="0,-180 -65,-40 65,-40" fill="#4d8c2f" stroke="#1a3009" stroke-width="3"/>
  <!-- bombki/szyszki -->
  <ellipse cx="-50" cy="40" rx="8" ry="12" fill="#8b5a3c"/>
  <ellipse cx="55" cy="20" rx="8" ry="12" fill="#8b5a3c"/>
  <ellipse cx="-30" cy="-50" rx="7" ry="10" fill="#8b5a3c"/>
  <!-- gwiazdka na czubku -->
  <polygon points="0,-180 5,-165 20,-165 8,-155 12,-140 0,-150 -12,-140 -8,-155 -20,-165 -5,-165"
           fill="#ffd93d" stroke="#3d2814" stroke-width="2"/>
</g>
''', bg='#87ceeb')

print("Done. 6 ikon grup wygenerowanych.")
