#!/usr/bin/env python3
"""
Generator 30 ilustracji SVG dla Leśnego Quizu.
Styl: flat/cartoon, dziecięcy, kolorowy.
ViewBox: 800x600 (4:3, optymalne dla iPada).
"""

import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ===== KOLORY =====
C = {
    'sky_top':    '#87ceeb',
    'sky_bot':    '#b8e6b8',
    'grass':      '#6ab04c',
    'grass_dark': '#4d8c2f',
    'leaf':       '#4d8c2f',
    'leaf_lt':    '#6ab04c',
    'trunk':      '#8b5a3c',
    'trunk_dk':   '#5a3a26',
    'bear':       '#6b4423',
    'bear_dk':    '#3d2814',
    'fox':        '#e67e22',
    'fox_dk':     '#c0392b',
    'sun':        '#ffd93d',
    'sun_lt':     '#ffe066',
    'white':      '#ffffff',
    'gray':       '#7f8c8d',
    'black':      '#2c3e50',
    'red':        '#e74c3c',
    'pink':       '#ff7ca0',
    'blue':       '#3498db',
    'snow':       '#ecf0f1',
    'birch_w':    '#f5f5f5',
    'birch_b':    '#2c3e50',
    'maple':      '#e74c3c',
    'autumn':     '#f39c12',
    'soil':       '#7d4f2a',
}

# ===== HELPERY =====
def svg_open():
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">\n'
            '<defs>'
            '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0%" stop-color="{C["sky_top"]}"/>'
            f'<stop offset="100%" stop-color="{C["sky_bot"]}"/>'
            '</linearGradient>'
            '</defs>')

def bg_forest():
    """Tło z niebem i trawą"""
    return ('<rect width="800" height="600" fill="url(#sky)"/>'
            f'<path d="M0,400 Q400,360 800,400 L800,600 L0,600 Z" fill="{C["grass"]}"/>'
            f'<ellipse cx="650" cy="120" rx="50" ry="50" fill="{C["sun_lt"]}"/>'
            f'<ellipse cx="650" cy="120" rx="38" ry="38" fill="{C["sun"]}"/>')

def bg_meadow():
    """Łąka pełna trawy"""
    return ('<rect width="800" height="600" fill="url(#sky)"/>'
            f'<rect y="350" width="800" height="250" fill="{C["grass"]}"/>'
            f'<path d="M0,350 Q200,330 400,350 T800,350 L800,400 L0,400 Z" fill="{C["grass_dark"]}"/>')

def bg_dark():
    """Ciemniejsze tło na noc"""
    return (f'<rect width="800" height="600" fill="#1a3a5c"/>'
            f'<circle cx="650" cy="120" r="55" fill="{C["sun_lt"]}" opacity="0.9"/>'
            f'<circle cx="650" cy="120" r="42" fill="{C["white"]}"/>'
            f'<circle cx="635" cy="105" r="18" fill="#1a3a5c"/>'  # cien ksiezyca
            f'<rect y="430" width="800" height="170" fill="{C["grass_dark"]}"/>')

def tree_pine(x, y, scale=1.0):
    """Świerk - trójkątny, ciemnozielony"""
    s = scale
    return (f'<rect x="{x-10*s}" y="{y}" width="{20*s}" height="{40*s}" fill="{C["trunk_dk"]}"/>'
            f'<polygon points="{x},{y-180*s} {x-90*s},{y} {x+90*s},{y}" fill="{C["leaf"]}"/>'
            f'<polygon points="{x},{y-220*s} {x-75*s},{y-40*s} {x+75*s},{y-40*s}" fill="{C["leaf_lt"]}"/>'
            f'<polygon points="{x},{y-250*s} {x-55*s},{y-80*s} {x+55*s},{y-80*s}" fill="{C["leaf"]}"/>')

def tree_oak(x, y, scale=1.0):
    """Dąb - okrągły, jasnozielony"""
    s = scale
    return (f'<rect x="{x-15*s}" y="{y}" width="{30*s}" height="{50*s}" fill="{C["trunk"]}"/>'
            f'<circle cx="{x}" cy="{y-50*s}" r="{80*s}" fill="{C["leaf"]}"/>'
            f'<circle cx="{x-50*s}" cy="{y-30*s}" r="{55*s}" fill="{C["leaf_lt"]}"/>'
            f'<circle cx="{x+50*s}" cy="{y-30*s}" r="{55*s}" fill="{C["leaf_lt"]}"/>'
            f'<circle cx="{x}" cy="{y-100*s}" r="{55*s}" fill="{C["leaf_lt"]}"/>')


def save(name, body):
    """Zapisz SVG"""
    full = svg_open() + body + '</svg>'
    path = os.path.join(OUT, f"{name}.svg")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(full)
    return path


# =====================================================================
# 30 ILUSTRACJI
# =====================================================================

# 1. NIEDŹWIEDŹ BRUNATNY
save('niedzwiedz', bg_forest() + tree_pine(120, 380, 0.8) + tree_oak(700, 380, 0.7) + f'''
<g transform="translate(400,400)">
  <ellipse cx="0" cy="40" rx="120" ry="80" fill="{C["bear"]}"/>
  <ellipse cx="-90" cy="100" rx="25" ry="25" fill="{C["bear_dk"]}"/>
  <ellipse cx="90" cy="100" rx="25" ry="25" fill="{C["bear_dk"]}"/>
  <circle cx="0" cy="-40" r="70" fill="{C["bear"]}"/>
  <ellipse cx="-50" cy="-90" rx="20" ry="22" fill="{C["bear"]}"/>
  <ellipse cx="50" cy="-90" rx="20" ry="22" fill="{C["bear"]}"/>
  <circle cx="-50" cy="-90" r="10" fill="{C["bear_dk"]}"/>
  <circle cx="50" cy="-90" r="10" fill="{C["bear_dk"]}"/>
  <ellipse cx="0" cy="-15" rx="25" ry="20" fill="{C["bear_dk"]}"/>
  <circle cx="-15" cy="-50" r="5" fill="{C["black"]}"/>
  <circle cx="15" cy="-50" r="5" fill="{C["black"]}"/>
  <ellipse cx="0" cy="-20" rx="8" ry="6" fill="{C["black"]}"/>
  <path d="M-10,-10 Q0,-5 10,-10" stroke="{C["black"]}" stroke-width="3" fill="none"/>
</g>
<text x="400" y="560" text-anchor="middle" font-family="Comic Sans MS, sans-serif" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">niedźwiedź brunatny</text>
''')

# 2. BÓBR
save('bobr', bg_forest() + f'''
<rect y="430" width="800" height="170" fill="#5dade2"/>
<path d="M0,430 Q200,420 400,430 T800,430" stroke="#3498db" stroke-width="3" fill="none" opacity="0.6"/>
<g transform="translate(450,380)">
  <!-- żeremie -->
  <ellipse cx="0" cy="40" rx="180" ry="60" fill="{C["trunk_dk"]}"/>
  <line x1="-150" y1="20" x2="150" y2="20" stroke="{C["trunk"]}" stroke-width="6"/>
  <line x1="-130" y1="40" x2="130" y2="60" stroke="{C["trunk"]}" stroke-width="5"/>
  <line x1="-100" y1="60" x2="100" y2="40" stroke="{C["trunk"]}" stroke-width="4"/>
</g>
<g transform="translate(220,410)">
  <ellipse cx="0" cy="0" rx="80" ry="45" fill="{C["bear_dk"]}"/>
  <circle cx="-60" cy="-15" r="35" fill="{C["bear_dk"]}"/>
  <circle cx="-75" cy="-25" r="6" fill="{C["bear"]}"/>
  <circle cx="-55" cy="-25" r="6" fill="{C["bear"]}"/>
  <circle cx="-78" cy="-25" r="3" fill="{C["black"]}"/>
  <circle cx="-58" cy="-25" r="3" fill="{C["black"]}"/>
  <ellipse cx="-85" cy="-10" rx="10" ry="6" fill="{C["white"]}"/>
  <rect x="-92" y="-12" width="14" height="6" fill="{C["sun"]}"/>
  <ellipse cx="60" cy="20" rx="50" ry="20" fill="{C["bear"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">bóbr i żeremie</text>
''')

# 3. DZIĘCIOŁ
save('dzieciol', bg_forest() + f'''
<g transform="translate(380,250)">
  <!-- pień drzewa -->
  <rect x="-40" y="-50" width="80" height="400" fill="{C["trunk"]}"/>
  <line x1="-30" y1="-30" x2="-30" y2="350" stroke="{C["trunk_dk"]}" stroke-width="2"/>
  <line x1="0" y1="-50" x2="0" y2="340" stroke="{C["trunk_dk"]}" stroke-width="2"/>
  <line x1="25" y1="-40" x2="25" y2="340" stroke="{C["trunk_dk"]}" stroke-width="2"/>
  <!-- otwór -->
  <ellipse cx="-15" cy="60" rx="12" ry="15" fill="{C["black"]}"/>
</g>
<g transform="translate(440,180)">
  <!-- dzięcioł czarno-biały z czerwonym łebkiem -->
  <ellipse cx="0" cy="0" rx="35" ry="50" fill="{C["white"]}"/>
  <path d="M-30,-20 L-30,30 L30,30 L30,-20 Z" fill="{C["black"]}"/>
  <ellipse cx="0" cy="0" rx="20" ry="35" fill="{C["white"]}"/>
  <circle cx="0" cy="-50" r="25" fill="{C["red"]}"/>
  <circle cx="-8" cy="-55" r="3" fill="{C["black"]}"/>
  <polygon points="-25,-50 -55,-45 -25,-40" fill="{C["sun"]}"/>
  <polygon points="0,40 -10,80 10,80" fill="{C["black"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">dzięcioł</text>
''')

# 4. JEŻ
save('jez', bg_forest() + f'''
<g transform="translate(400,420)">
  <!-- ciało -->
  <ellipse cx="0" cy="0" rx="130" ry="80" fill="{C["bear_dk"]}"/>
  <!-- kolce -->
  <g fill="{C["black"]}">
    <polygon points="-100,-65 -90,-100 -80,-65"/>
    <polygon points="-70,-75 -60,-110 -50,-75"/>
    <polygon points="-40,-78 -30,-115 -20,-78"/>
    <polygon points="-10,-80 0,-118 10,-80"/>
    <polygon points="20,-78 30,-115 40,-78"/>
    <polygon points="50,-75 60,-110 70,-75"/>
    <polygon points="80,-65 90,-100 100,-65"/>
    <polygon points="-110,-30 -125,-60 -100,-40"/>
    <polygon points="100,-30 125,-60 110,-40"/>
  </g>
  <!-- mordka -->
  <ellipse cx="-110" cy="20" rx="40" ry="30" fill="{C["bear"]}"/>
  <circle cx="-130" cy="10" r="4" fill="{C["black"]}"/>
  <circle cx="-140" cy="25" r="6" fill="{C["black"]}"/>
  <!-- nogi -->
  <ellipse cx="-50" cy="70" rx="15" ry="10" fill="{C["black"]}"/>
  <ellipse cx="50" cy="70" rx="15" ry="10" fill="{C["black"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">jeż</text>
''')

# 5. WIEWIÓRKA
save('wiewiorka', bg_forest() + tree_oak(150, 380, 0.6) + f'''
<g transform="translate(420,380)">
  <!-- ogon -->
  <path d="M50,40 Q140,-30 110,-130 Q40,-100 0,-30 Z" fill="{C["fox"]}"/>
  <path d="M70,30 Q120,-20 100,-110 Q60,-90 30,-30 Z" fill="{C["fox_dk"]}"/>
  <!-- ciało -->
  <ellipse cx="0" cy="20" rx="50" ry="60" fill="{C["fox"]}"/>
  <ellipse cx="-5" cy="40" rx="30" ry="35" fill="{C["sun_lt"]}"/>
  <!-- głowa -->
  <circle cx="0" cy="-40" r="35" fill="{C["fox"]}"/>
  <polygon points="-25,-65 -15,-80 -5,-65" fill="{C["fox_dk"]}"/>
  <polygon points="25,-65 15,-80 5,-65" fill="{C["fox_dk"]}"/>
  <circle cx="-12" cy="-45" r="5" fill="{C["black"]}"/>
  <circle cx="12" cy="-45" r="5" fill="{C["black"]}"/>
  <ellipse cx="0" cy="-30" rx="5" ry="3" fill="{C["black"]}"/>
  <!-- żołądź w łapkach -->
  <ellipse cx="0" cy="20" rx="15" ry="12" fill="{C["sun"]}"/>
  <ellipse cx="0" cy="14" rx="14" ry="6" fill="{C["trunk_dk"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">wiewiórka z żołędziem</text>
''')

# 6. SARNA (kozioł)
save('sarna', bg_forest() + tree_pine(680, 380, 0.7) + f'''
<g transform="translate(380,330)">
  <!-- ciało -->
  <ellipse cx="0" cy="40" rx="120" ry="55" fill="{C["bear"]}"/>
  <ellipse cx="0" cy="60" rx="100" ry="30" fill="{C["sun_lt"]}"/>
  <!-- nogi -->
  <rect x="-90" y="80" width="14" height="60" fill="{C["bear_dk"]}"/>
  <rect x="-50" y="80" width="14" height="60" fill="{C["bear_dk"]}"/>
  <rect x="40" y="80" width="14" height="60" fill="{C["bear_dk"]}"/>
  <rect x="80" y="80" width="14" height="60" fill="{C["bear_dk"]}"/>
  <!-- szyja i głowa -->
  <path d="M85,30 L120,-20 L160,-30 L150,30 Z" fill="{C["bear"]}"/>
  <ellipse cx="160" cy="-10" rx="35" ry="25" fill="{C["bear"]}"/>
  <ellipse cx="180" cy="-5" rx="15" ry="10" fill="{C["bear_dk"]}"/>
  <circle cx="170" cy="-15" r="3" fill="{C["black"]}"/>
  <!-- poroże -->
  <path d="M150,-30 Q145,-55 155,-70 M155,-70 Q170,-75 175,-65" stroke="{C["trunk_dk"]}" stroke-width="5" fill="none"/>
  <path d="M170,-30 Q175,-55 165,-70 M165,-70 Q150,-75 145,-65" stroke="{C["trunk_dk"]}" stroke-width="5" fill="none"/>
  <!-- ucho -->
  <ellipse cx="145" cy="-35" rx="8" ry="14" fill="{C["bear_dk"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">sarna (kozioł)</text>
''')

# 7. JELEŃ - "król lasu"
save('jelen', bg_forest() + f'''
<g transform="translate(400,300)">
  <!-- ciało -->
  <ellipse cx="0" cy="50" rx="140" ry="65" fill="{C["bear"]}"/>
  <ellipse cx="0" cy="75" rx="110" ry="35" fill="{C["sun_lt"]}"/>
  <!-- nogi długie -->
  <rect x="-110" y="100" width="16" height="100" fill="{C["bear_dk"]}"/>
  <rect x="-65" y="100" width="16" height="100" fill="{C["bear_dk"]}"/>
  <rect x="50" y="100" width="16" height="100" fill="{C["bear_dk"]}"/>
  <rect x="95" y="100" width="16" height="100" fill="{C["bear_dk"]}"/>
  <!-- szyja, głowa -->
  <path d="M100,30 L140,-50 L195,-60 L185,30 Z" fill="{C["bear"]}"/>
  <ellipse cx="190" cy="-40" rx="40" ry="28" fill="{C["bear"]}"/>
  <circle cx="200" cy="-45" r="4" fill="{C["black"]}"/>
  <ellipse cx="215" cy="-30" rx="10" ry="6" fill="{C["bear_dk"]}"/>
  <!-- WIELKIE poroże -->
  <g stroke="{C["trunk_dk"]}" stroke-width="6" fill="none" stroke-linecap="round">
    <path d="M170,-65 Q160,-110 130,-130 M130,-130 L100,-140"/>
    <path d="M170,-65 Q145,-95 115,-110"/>
    <path d="M170,-65 Q175,-95 200,-110"/>
    <path d="M195,-65 Q210,-110 240,-130 M240,-130 L270,-140"/>
    <path d="M195,-65 Q220,-95 255,-110"/>
    <path d="M195,-65 Q190,-95 165,-110"/>
  </g>
  <ellipse cx="170" cy="-65" rx="15" ry="8" fill="{C["bear_dk"]}"/>
  <ellipse cx="195" cy="-65" rx="15" ry="8" fill="{C["bear_dk"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">jeleń - król lasu</text>
''')

# 8. ŁANIA
save('lania', bg_forest() + f'''
<g transform="translate(330,330)">
  <ellipse cx="0" cy="40" rx="120" ry="55" fill="{C["sun_lt"]}"/>
  <rect x="-90" y="80" width="14" height="60" fill="{C["bear"]}"/>
  <rect x="-50" y="80" width="14" height="60" fill="{C["bear"]}"/>
  <rect x="40" y="80" width="14" height="60" fill="{C["bear"]}"/>
  <rect x="80" y="80" width="14" height="60" fill="{C["bear"]}"/>
  <path d="M85,30 L120,-20 L155,-30 L150,30 Z" fill="{C["sun_lt"]}"/>
  <ellipse cx="155" cy="-10" rx="32" ry="25" fill="{C["sun_lt"]}"/>
  <circle cx="165" cy="-15" r="3" fill="{C["black"]}"/>
  <ellipse cx="145" cy="-30" rx="6" ry="14" fill="{C["bear"]}"/>
</g>
<g transform="translate(540,400)">
  <ellipse cx="0" cy="20" rx="60" ry="30" fill="{C["sun_lt"]}"/>
  <rect x="-45" y="40" width="9" height="35" fill="{C["bear"]}"/>
  <rect x="-25" y="40" width="9" height="35" fill="{C["bear"]}"/>
  <rect x="20" y="40" width="9" height="35" fill="{C["bear"]}"/>
  <rect x="40" y="40" width="9" height="35" fill="{C["bear"]}"/>
  <ellipse cx="65" cy="-5" rx="20" ry="15" fill="{C["sun_lt"]}"/>
  <circle cx="71" cy="-8" r="2" fill="{C["black"]}"/>
  <ellipse cx="60" cy="-18" rx="3" ry="8" fill="{C["bear"]}"/>
  <!-- kropki młodego -->
  <circle cx="-20" cy="10" r="3" fill="{C["white"]}"/>
  <circle cx="0" cy="15" r="3" fill="{C["white"]}"/>
  <circle cx="20" cy="10" r="3" fill="{C["white"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">łania z jelonkiem</text>
''')

# 9. LIS
save('lis', bg_forest() + tree_oak(700, 380, 0.6) + f'''
<g transform="translate(380,400)">
  <!-- ogon -->
  <path d="M70,0 Q150,-20 170,-80 Q120,-50 80,-20 Z" fill="{C["fox"]}"/>
  <path d="M150,-50 Q160,-65 165,-75 L155,-65 Z" fill="{C["white"]}"/>
  <!-- ciało -->
  <ellipse cx="0" cy="0" rx="80" ry="45" fill="{C["fox"]}"/>
  <ellipse cx="-10" cy="20" rx="40" ry="20" fill="{C["white"]}"/>
  <!-- nogi -->
  <rect x="-50" y="35" width="14" height="35" fill="{C["fox_dk"]}"/>
  <rect x="-20" y="35" width="14" height="35" fill="{C["fox_dk"]}"/>
  <rect x="20" y="35" width="14" height="35" fill="{C["fox_dk"]}"/>
  <rect x="50" y="35" width="14" height="35" fill="{C["fox_dk"]}"/>
  <!-- głowa -->
  <circle cx="-70" cy="-20" r="40" fill="{C["fox"]}"/>
  <polygon points="-100,-50 -90,-75 -75,-55" fill="{C["fox"]}"/>
  <polygon points="-95,-55 -88,-67 -82,-58" fill="{C["fox_dk"]}"/>
  <polygon points="-50,-50 -60,-75 -45,-55" fill="{C["fox"]}"/>
  <polygon points="-55,-55 -53,-67 -48,-58" fill="{C["fox_dk"]}"/>
  <polygon points="-100,-15 -120,-15 -100,5" fill="{C["white"]}"/>
  <polygon points="-100,-15 -120,-5 -110,15" fill="{C["fox"]}"/>
  <circle cx="-115" cy="-10" r="4" fill="{C["black"]}"/>
  <circle cx="-85" cy="-25" r="4" fill="{C["black"]}"/>
  <circle cx="-65" cy="-25" r="4" fill="{C["black"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">lis rudy</text>
''')

# 10. GAJNO (gniazdo wiewiórki)
save('gajno', bg_forest() + f'''
<g transform="translate(400,380)">
  <!-- pień -->
  <rect x="-30" y="-50" width="60" height="250" fill="{C["trunk"]}"/>
  <line x1="-15" y1="-50" x2="-15" y2="200" stroke="{C["trunk_dk"]}" stroke-width="2"/>
  <line x1="10" y1="-50" x2="10" y2="200" stroke="{C["trunk_dk"]}" stroke-width="2"/>
  <!-- gałęzie -->
  <line x1="0" y1="-30" x2="-130" y2="-100" stroke="{C["trunk"]}" stroke-width="14"/>
  <line x1="0" y1="-50" x2="130" y2="-100" stroke="{C["trunk"]}" stroke-width="14"/>
  <line x1="0" y1="-100" x2="60" y2="-180" stroke="{C["trunk"]}" stroke-width="10"/>
  <!-- gajno - kula z patyków -->
  <g transform="translate(70,-150)">
    <ellipse cx="0" cy="0" rx="80" ry="65" fill="{C["trunk_dk"]}"/>
    <line x1="-60" y1="-30" x2="40" y2="-50" stroke="{C["trunk"]}" stroke-width="3"/>
    <line x1="-50" y1="20" x2="60" y2="0" stroke="{C["trunk"]}" stroke-width="3"/>
    <line x1="-30" y1="-50" x2="50" y2="-30" stroke="{C["trunk"]}" stroke-width="3"/>
    <line x1="-70" y1="0" x2="30" y2="40" stroke="{C["trunk"]}" stroke-width="3"/>
    <line x1="-40" y1="50" x2="70" y2="30" stroke="{C["trunk"]}" stroke-width="3"/>
    <!-- liście wystające -->
    <circle cx="-50" cy="-40" r="8" fill="{C["leaf"]}"/>
    <circle cx="55" cy="-45" r="8" fill="{C["leaf_lt"]}"/>
    <circle cx="60" cy="40" r="8" fill="{C["leaf"]}"/>
    <!-- wiewiórka wystaje -->
    <circle cx="0" cy="-10" r="15" fill="{C["fox"]}"/>
    <circle cx="-5" cy="-15" r="3" fill="{C["black"]}"/>
    <circle cx="5" cy="-15" r="3" fill="{C["black"]}"/>
    <polygon points="-12,-25 -8,-32 -4,-25" fill="{C["fox"]}"/>
    <polygon points="4,-25 8,-32 12,-25" fill="{C["fox"]}"/>
  </g>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">gajno - gniazdo wiewiórki</text>
''')

# 11. PSZCZOŁA
save('pszczola', bg_meadow() + f'''
<!-- kwiatek -->
<g transform="translate(250,380)">
  <rect x="-3" y="0" width="6" height="100" fill="{C["leaf"]}"/>
  <ellipse cx="-30" cy="50" rx="20" ry="8" fill="{C["leaf_lt"]}" transform="rotate(-30 -30 50)"/>
  <ellipse cx="30" cy="40" rx="18" ry="7" fill="{C["leaf_lt"]}" transform="rotate(30 30 40)"/>
  <circle cx="0" cy="0" r="35" fill="{C["pink"]}"/>
  <circle cx="-25" cy="-15" r="20" fill="{C["pink"]}"/>
  <circle cx="25" cy="-15" r="20" fill="{C["pink"]}"/>
  <circle cx="-25" cy="15" r="20" fill="{C["pink"]}"/>
  <circle cx="25" cy="15" r="20" fill="{C["pink"]}"/>
  <circle cx="0" cy="0" r="18" fill="{C["sun"]}"/>
</g>
<!-- pszczoła -->
<g transform="translate(450,300)">
  <ellipse cx="0" cy="0" rx="60" ry="40" fill="{C["sun"]}"/>
  <rect x="-50" y="-15" width="100" height="12" fill="{C["black"]}"/>
  <rect x="-50" y="5" width="100" height="12" fill="{C["black"]}"/>
  <ellipse cx="-25" cy="-30" rx="35" ry="20" fill="{C["white"]}" opacity="0.7"/>
  <ellipse cx="25" cy="-30" rx="35" ry="20" fill="{C["white"]}" opacity="0.7"/>
  <circle cx="-50" cy="0" r="20" fill="{C["sun"]}"/>
  <circle cx="-58" cy="-5" r="4" fill="{C["black"]}"/>
  <circle cx="-42" cy="-5" r="4" fill="{C["black"]}"/>
  <line x1="-58" y1="-20" x2="-65" y2="-30" stroke="{C["black"]}" stroke-width="3"/>
  <line x1="-42" y1="-20" x2="-35" y2="-30" stroke="{C["black"]}" stroke-width="3"/>
  <circle cx="-65" cy="-30" r="3" fill="{C["black"]}"/>
  <circle cx="-35" cy="-30" r="3" fill="{C["black"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">pszczoła zbiera nektar</text>
''')

# 12. MRÓWKI - mrowisko
save('mrowki', bg_forest() + tree_pine(120, 380, 0.7) + tree_pine(700, 380, 0.7) + f'''
<g transform="translate(400,420)">
  <!-- mrowisko -->
  <ellipse cx="0" cy="40" rx="180" ry="20" fill="{C["soil"]}"/>
  <path d="M-160,40 L0,-150 L160,40 Z" fill="{C["trunk_dk"]}"/>
  <path d="M-130,40 L-20,-100 L100,40 Z" fill="{C["trunk"]}"/>
  <path d="M-80,40 L20,-60 L120,40 Z" fill="{C["soil"]}"/>
  <!-- patyczki -->
  <line x1="-100" y1="0" x2="-80" y2="-20" stroke="{C["bear_dk"]}" stroke-width="3"/>
  <line x1="60" y1="-20" x2="80" y2="0" stroke="{C["bear_dk"]}" stroke-width="3"/>
  <line x1="20" y1="-50" x2="40" y2="-30" stroke="{C["bear_dk"]}" stroke-width="3"/>
  <!-- mrówki -->
  <g fill="{C["black"]}">
    <ellipse cx="-200" cy="50" rx="6" ry="3"/>
    <ellipse cx="-188" cy="50" rx="4" ry="2"/>
    <ellipse cx="-180" cy="50" rx="6" ry="3"/>
    <ellipse cx="200" cy="55" rx="6" ry="3"/>
    <ellipse cx="212" cy="55" rx="4" ry="2"/>
    <ellipse cx="220" cy="55" rx="6" ry="3"/>
    <ellipse cx="-100" cy="20" rx="4" ry="2"/>
    <ellipse cx="50" cy="0" rx="4" ry="2"/>
  </g>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">mrowisko</text>
''')

# 13. DZIK
save('dzik', bg_forest() + tree_oak(150, 380, 0.6) + f'''
<g transform="translate(450,400)">
  <ellipse cx="0" cy="0" rx="130" ry="65" fill="{C["bear_dk"]}"/>
  <!-- włosie na grzbiecie -->
  <g stroke="{C["black"]}" stroke-width="3">
    <line x1="-100" y1="-50" x2="-100" y2="-70"/>
    <line x1="-80" y1="-58" x2="-78" y2="-80"/>
    <line x1="-60" y1="-62" x2="-58" y2="-85"/>
    <line x1="-40" y1="-65" x2="-38" y2="-90"/>
    <line x1="-20" y1="-65" x2="-18" y2="-90"/>
    <line x1="0" y1="-65" x2="2" y2="-88"/>
    <line x1="20" y1="-62" x2="22" y2="-82"/>
  </g>
  <!-- nogi -->
  <rect x="-90" y="50" width="14" height="50" fill="{C["bear_dk"]}"/>
  <rect x="-50" y="50" width="14" height="50" fill="{C["bear_dk"]}"/>
  <rect x="40" y="50" width="14" height="50" fill="{C["bear_dk"]}"/>
  <rect x="80" y="50" width="14" height="50" fill="{C["bear_dk"]}"/>
  <!-- ryj -->
  <ellipse cx="-130" cy="0" rx="35" ry="25" fill="{C["bear"]}"/>
  <ellipse cx="-150" cy="0" rx="15" ry="12" fill="{C["bear_dk"]}"/>
  <circle cx="-155" cy="-3" r="2" fill="{C["black"]}"/>
  <circle cx="-145" cy="-3" r="2" fill="{C["black"]}"/>
  <!-- kły -->
  <polygon points="-145,5 -148,15 -142,15" fill="{C["white"]}"/>
  <polygon points="-128,5 -125,15 -131,15" fill="{C["white"]}"/>
  <!-- oko -->
  <circle cx="-90" cy="-20" r="4" fill="{C["black"]}"/>
  <!-- ucho -->
  <polygon points="-80,-50 -65,-70 -55,-50" fill="{C["bear_dk"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">dzik</text>
''')

# 14. TROPY
save('tropy', bg_meadow() + f'''
<rect y="380" width="800" height="220" fill="{C["snow"]}"/>
<g fill="{C["trunk_dk"]}">
  <!-- 4 ślady -->
  <g transform="translate(150,420)">
    <ellipse cx="0" cy="0" rx="25" ry="35"/>
    <ellipse cx="-25" cy="-20" rx="10" ry="15"/>
    <ellipse cx="25" cy="-20" rx="10" ry="15"/>
    <ellipse cx="-20" cy="-40" rx="8" ry="12"/>
    <ellipse cx="20" cy="-40" rx="8" ry="12"/>
  </g>
  <g transform="translate(280,470)">
    <ellipse cx="0" cy="0" rx="25" ry="35"/>
    <ellipse cx="-25" cy="-20" rx="10" ry="15"/>
    <ellipse cx="25" cy="-20" rx="10" ry="15"/>
    <ellipse cx="-20" cy="-40" rx="8" ry="12"/>
    <ellipse cx="20" cy="-40" rx="8" ry="12"/>
  </g>
  <g transform="translate(420,420)">
    <ellipse cx="0" cy="0" rx="25" ry="35"/>
    <ellipse cx="-25" cy="-20" rx="10" ry="15"/>
    <ellipse cx="25" cy="-20" rx="10" ry="15"/>
    <ellipse cx="-20" cy="-40" rx="8" ry="12"/>
    <ellipse cx="20" cy="-40" rx="8" ry="12"/>
  </g>
  <g transform="translate(560,470)">
    <ellipse cx="0" cy="0" rx="25" ry="35"/>
    <ellipse cx="-25" cy="-20" rx="10" ry="15"/>
    <ellipse cx="25" cy="-20" rx="10" ry="15"/>
  </g>
  <g transform="translate(680,420)">
    <ellipse cx="0" cy="0" rx="20" ry="28"/>
    <ellipse cx="-20" cy="-15" rx="8" ry="12"/>
    <ellipse cx="20" cy="-15" rx="8" ry="12"/>
  </g>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">tropy zwierzęcia</text>
''')

# 15. SOWA - nocą
save('sowa', bg_dark() + f'''
<g transform="translate(150,200)">
  <!-- gwiazdki -->
  <circle cx="0" cy="0" r="2" fill="{C["white"]}"/>
  <circle cx="80" cy="40" r="1.5" fill="{C["white"]}"/>
  <circle cx="500" cy="20" r="2" fill="{C["white"]}"/>
  <circle cx="450" cy="80" r="1.5" fill="{C["white"]}"/>
  <circle cx="50" cy="100" r="1" fill="{C["white"]}"/>
  <circle cx="600" cy="50" r="1.5" fill="{C["white"]}"/>
</g>
<!-- gałąź -->
<rect x="100" y="430" width="600" height="20" fill="{C["trunk_dk"]}"/>
<g transform="translate(400,400)">
  <!-- ciało sowy -->
  <ellipse cx="0" cy="0" rx="100" ry="120" fill="{C["bear"]}"/>
  <ellipse cx="0" cy="40" rx="60" ry="50" fill="{C["sun_lt"]}" opacity="0.7"/>
  <!-- "uszy" -->
  <polygon points="-70,-100 -45,-130 -30,-95" fill="{C["bear_dk"]}"/>
  <polygon points="70,-100 45,-130 30,-95" fill="{C["bear_dk"]}"/>
  <!-- oczy -->
  <circle cx="-30" cy="-30" r="35" fill="{C["white"]}"/>
  <circle cx="30" cy="-30" r="35" fill="{C["white"]}"/>
  <circle cx="-30" cy="-30" r="22" fill="{C["sun"]}"/>
  <circle cx="30" cy="-30" r="22" fill="{C["sun"]}"/>
  <circle cx="-30" cy="-30" r="14" fill="{C["black"]}"/>
  <circle cx="30" cy="-30" r="14" fill="{C["black"]}"/>
  <circle cx="-26" cy="-34" r="4" fill="{C["white"]}"/>
  <circle cx="34" cy="-34" r="4" fill="{C["white"]}"/>
  <!-- dziób -->
  <polygon points="-10,10 0,30 10,10" fill="{C["sun"]}"/>
  <!-- pierze - łuski -->
  <g fill="{C["bear_dk"]}" opacity="0.6">
    <ellipse cx="-40" cy="20" rx="15" ry="8"/>
    <ellipse cx="0" cy="30" rx="15" ry="8"/>
    <ellipse cx="40" cy="20" rx="15" ry="8"/>
    <ellipse cx="-30" cy="60" rx="15" ry="8"/>
    <ellipse cx="30" cy="60" rx="15" ry="8"/>
  </g>
  <!-- nogi -->
  <rect x="-15" y="115" width="8" height="20" fill="{C["sun"]}"/>
  <rect x="7" y="115" width="8" height="20" fill="{C["sun"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["white"]}">sowa nocą</text>
''')

print(f"Wygenerowano 15 SVG (zwierzeta)")

# ===== ROŚLINY =====

# 16. KLON - liść kanadyjski
save('klon', bg_forest() + f'''
<g transform="translate(400,300)">
  <path d="M0,-150 L-20,-100 L-50,-110 L-30,-70 L-90,-50 L-50,-20 L-100,30 L-50,40 L-30,90 L-10,60 L0,120 L10,60 L30,90 L50,40 L100,30 L50,-20 L90,-50 L30,-70 L50,-110 L20,-100 Z"
        fill="{C["maple"]}" stroke="{C["fox_dk"]}" stroke-width="3"/>
  <!-- żyłki -->
  <line x1="0" y1="-130" x2="0" y2="100" stroke="{C["fox_dk"]}" stroke-width="2" opacity="0.6"/>
  <line x1="0" y1="0" x2="-60" y2="-30" stroke="{C["fox_dk"]}" stroke-width="2" opacity="0.6"/>
  <line x1="0" y1="0" x2="60" y2="-30" stroke="{C["fox_dk"]}" stroke-width="2" opacity="0.6"/>
  <line x1="0" y1="0" x2="-50" y2="40" stroke="{C["fox_dk"]}" stroke-width="2" opacity="0.6"/>
  <line x1="0" y1="0" x2="50" y2="40" stroke="{C["fox_dk"]}" stroke-width="2" opacity="0.6"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">liść klonu</text>
''')

# 17. SOSNA
save('sosna', bg_forest() + f'''
{tree_pine(400, 480, 1.5)}
<!-- szyszki -->
<g fill="{C["trunk_dk"]}">
  <ellipse cx="320" cy="320" rx="8" ry="14"/>
  <ellipse cx="480" cy="280" rx="8" ry="14"/>
  <ellipse cx="450" cy="380" rx="8" ry="14"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">sosna - drzewo iglaste</text>
''')

# 18. DĄB z żołędziami
save('dab', bg_forest() + f'''
{tree_oak(400, 480, 1.4)}
<!-- żołędzie wiszące -->
<g transform="translate(350,400)">
  <ellipse cx="0" cy="0" rx="14" ry="22" fill="{C["sun"]}"/>
  <ellipse cx="0" cy="-15" rx="13" ry="6" fill="{C["trunk_dk"]}"/>
</g>
<g transform="translate(440,420)">
  <ellipse cx="0" cy="0" rx="14" ry="22" fill="{C["sun"]}"/>
  <ellipse cx="0" cy="-15" rx="13" ry="6" fill="{C["trunk_dk"]}"/>
</g>
<g transform="translate(500,380)">
  <ellipse cx="0" cy="0" rx="14" ry="22" fill="{C["sun"]}"/>
  <ellipse cx="0" cy="-15" rx="13" ry="6" fill="{C["trunk_dk"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">dąb z żołędziami</text>
''')

# 19. DRZEWO + fotosynteza
save('drzewo', bg_forest() + f'''
{tree_oak(400, 480, 1.4)}
<!-- strzałki tlenu -->
<g stroke="{C["white"]}" stroke-width="4" fill="none" opacity="0.9">
  <path d="M250,300 Q230,260 240,220" marker-end="url(#a)"/>
  <path d="M540,290 Q560,260 545,210" marker-end="url(#a)"/>
  <path d="M380,250 Q395,200 385,170" marker-end="url(#a)"/>
</g>
<g fill="{C["white"]}" opacity="0.9">
  <text x="200" y="200" font-family="Comic Sans MS" font-size="32" font-weight="bold">O₂</text>
  <text x="510" y="190" font-family="Comic Sans MS" font-size="32" font-weight="bold">O₂</text>
  <text x="370" y="160" font-family="Comic Sans MS" font-size="32" font-weight="bold">O₂</text>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">drzewo daje tlen</text>
''')

# 20. BRZOZA
save('brzoza', bg_forest() + f'''
<g transform="translate(400,480)">
  <rect x="-25" y="-380" width="50" height="380" fill="{C["birch_w"]}"/>
  <g fill="{C["birch_b"]}">
    <rect x="-25" y="-350" width="50" height="6"/>
    <rect x="-25" y="-280" width="50" height="5"/>
    <rect x="-15" y="-220" width="40" height="6"/>
    <rect x="-25" y="-150" width="35" height="5"/>
    <rect x="-25" y="-80" width="45" height="6"/>
    <rect x="-15" y="-30" width="35" height="4"/>
  </g>
  <!-- liście brzozy - drobne -->
  <g fill="{C["leaf_lt"]}">
    <ellipse cx="-80" cy="-380" rx="40" ry="60"/>
    <ellipse cx="80" cy="-380" rx="40" ry="60"/>
    <ellipse cx="0" cy="-420" rx="50" ry="40"/>
    <ellipse cx="-50" cy="-330" rx="35" ry="40"/>
    <ellipse cx="50" cy="-330" rx="35" ry="40"/>
  </g>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">brzoza</text>
''')

# 21. ŚWIERK
save('swierk', bg_forest() + f'''
{tree_pine(400, 480, 1.6)}
<!-- iglaki spadają -->
<g fill="{C["leaf"]}">
  <line x1="200" y1="450" x2="206" y2="465" stroke="{C["leaf"]}" stroke-width="3"/>
  <line x1="600" y1="430" x2="595" y2="445" stroke="{C["leaf"]}" stroke-width="3"/>
  <line x1="170" y1="500" x2="180" y2="510" stroke="{C["leaf"]}" stroke-width="3"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">świerk - drzewo iglaste</text>
''')

# 22. LIŚCIASTE jesienią
save('lisciaste', f'''
<rect width="800" height="600" fill="url(#sky)"/>
<rect y="430" width="800" height="170" fill="{C["soil"]}"/>
<g transform="translate(150,430)">
  <rect x="-25" y="-200" width="50" height="200" fill="{C["trunk"]}"/>
  <circle cx="0" cy="-220" r="100" fill="{C["maple"]}"/>
  <circle cx="-60" cy="-200" r="60" fill="{C["fox"]}"/>
  <circle cx="60" cy="-200" r="60" fill="{C["autumn"]}"/>
</g>
<g transform="translate(400,430)">
  <rect x="-30" y="-250" width="60" height="250" fill="{C["trunk"]}"/>
  <circle cx="0" cy="-260" r="120" fill="{C["autumn"]}"/>
  <circle cx="-70" cy="-250" r="70" fill="{C["maple"]}"/>
  <circle cx="70" cy="-250" r="70" fill="{C["sun"]}"/>
</g>
<g transform="translate(650,430)">
  <rect x="-25" y="-180" width="50" height="180" fill="{C["trunk"]}"/>
  <circle cx="0" cy="-200" r="90" fill="{C["sun"]}"/>
  <circle cx="-50" cy="-180" r="55" fill="{C["maple"]}"/>
  <circle cx="50" cy="-180" r="55" fill="{C["fox"]}"/>
</g>
<!-- liście opadające -->
<g>
  <ellipse cx="200" cy="350" rx="10" ry="6" fill="{C["maple"]}" transform="rotate(45 200 350)"/>
  <ellipse cx="500" cy="380" rx="10" ry="6" fill="{C["sun"]}" transform="rotate(-30 500 380)"/>
  <ellipse cx="350" cy="400" rx="10" ry="6" fill="{C["fox"]}" transform="rotate(60 350 400)"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">las liściasty jesienią</text>
''')

# 23. BUK z bukwiem
save('buk', bg_forest() + f'''
{tree_oak(400, 480, 1.5)}
<!-- bukwie - małe trójkątne orzeszki -->
<g transform="translate(330,420)">
  <polygon points="-8,0 8,0 0,15" fill="{C["trunk_dk"]}"/>
  <polygon points="-7,-1 7,-1 0,12" fill="{C["bear_dk"]}"/>
</g>
<g transform="translate(470,440)">
  <polygon points="-8,0 8,0 0,15" fill="{C["trunk_dk"]}"/>
  <polygon points="-7,-1 7,-1 0,12" fill="{C["bear_dk"]}"/>
</g>
<g transform="translate(380,460)">
  <polygon points="-8,0 8,0 0,15" fill="{C["trunk_dk"]}"/>
  <polygon points="-7,-1 7,-1 0,12" fill="{C["bear_dk"]}"/>
</g>
<g transform="translate(440,400)">
  <polygon points="-8,0 8,0 0,15" fill="{C["trunk_dk"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">buk z bukwiem</text>
''')

print("Wygenerowano 8 SVG (rosliny)")

# ===== GRZYBY =====

# 24. GRZYBY (borowik)
save('grzyby', bg_forest() + f'''
<g transform="translate(400,420)">
  <!-- borowik -->
  <ellipse cx="0" cy="-30" rx="120" ry="60" fill="{C["bear"]}"/>
  <ellipse cx="0" cy="-40" rx="100" ry="40" fill="{C["bear_dk"]}"/>
  <rect x="-30" y="-30" width="60" height="100" fill="{C["sun_lt"]}" rx="8"/>
  <ellipse cx="0" cy="70" rx="40" ry="10" fill="{C["sun"]}"/>
</g>
<!-- mech wokół -->
<g fill="{C["leaf_lt"]}">
  <ellipse cx="200" cy="500" rx="40" ry="8"/>
  <ellipse cx="600" cy="510" rx="50" ry="8"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">borowik szlachetny</text>
''')

# 25. MUCHOMOR
save('muchomor', bg_forest() + f'''
<g transform="translate(400,420)">
  <ellipse cx="0" cy="-30" rx="120" ry="65" fill="{C["red"]}"/>
  <ellipse cx="0" cy="-50" rx="100" ry="40" fill="{C["red"]}"/>
  <!-- białe kropki -->
  <circle cx="-50" cy="-50" r="12" fill="{C["white"]}"/>
  <circle cx="40" cy="-60" r="14" fill="{C["white"]}"/>
  <circle cx="-20" cy="-30" r="10" fill="{C["white"]}"/>
  <circle cx="60" cy="-30" r="11" fill="{C["white"]}"/>
  <circle cx="-80" cy="-25" r="9" fill="{C["white"]}"/>
  <circle cx="0" cy="-70" r="10" fill="{C["white"]}"/>
  <!-- nóżka -->
  <rect x="-25" y="-20" width="50" height="100" fill="{C["white"]}" rx="6"/>
  <ellipse cx="0" cy="-15" rx="35" ry="8" fill="{C["white"]}"/>
  <ellipse cx="0" cy="80" rx="40" ry="10" fill="{C["leaf"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">muchomor czerwony - TRUJĄCY</text>
''')

# 26. GRZYBOBRANIE - koszyk
save('grzybobranie', bg_forest() + f'''
<g transform="translate(400,420)">
  <!-- koszyk -->
  <path d="M-150,0 L-130,100 L130,100 L150,0 Z" fill="{C["bear"]}"/>
  <g stroke="{C["trunk_dk"]}" stroke-width="2" fill="none">
    <line x1="-140" y1="40" x2="140" y2="40"/>
    <line x1="-130" y1="80" x2="130" y2="80"/>
    <line x1="-100" y1="0" x2="-92" y2="100"/>
    <line x1="-50" y1="0" x2="-45" y2="100"/>
    <line x1="0" y1="0" x2="0" y2="100"/>
    <line x1="50" y1="0" x2="45" y2="100"/>
    <line x1="100" y1="0" x2="92" y2="100"/>
  </g>
  <!-- ucho koszyka -->
  <path d="M-100,-5 Q0,-90 100,-5" stroke="{C["trunk"]}" stroke-width="8" fill="none"/>
  <!-- grzyby w koszyku -->
  <g transform="translate(-80,-10)">
    <ellipse cx="0" cy="0" rx="30" ry="15" fill="{C["bear_dk"]}"/>
    <rect x="-7" y="0" width="14" height="20" fill="{C["sun_lt"]}"/>
  </g>
  <g transform="translate(-20,-15)">
    <ellipse cx="0" cy="0" rx="35" ry="18" fill="{C["red"]}"/>
    <circle cx="-10" cy="-5" r="5" fill="{C["white"]}"/>
    <circle cx="10" cy="-3" r="4" fill="{C["white"]}"/>
    <rect x="-7" y="0" width="14" height="18" fill="{C["white"]}"/>
  </g>
  <g transform="translate(60,-10)">
    <ellipse cx="0" cy="0" rx="32" ry="16" fill="{C["bear"]}"/>
    <rect x="-6" y="0" width="12" height="18" fill="{C["sun_lt"]}"/>
  </g>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">grzybobranie</text>
''')

# 27. ŚCIÓŁKA leśna
save('sciolka', f'''
<rect width="800" height="600" fill="url(#sky)"/>
<rect y="200" width="800" height="400" fill="{C["soil"]}"/>
<!-- pnie drzew -->
<rect x="60" y="0" width="40" height="600" fill="{C["trunk"]}"/>
<rect x="700" y="0" width="40" height="600" fill="{C["trunk"]}"/>
<rect x="350" y="0" width="50" height="600" fill="{C["trunk"]}"/>
<!-- igliwie i liscie na sciolce -->
<g>
  <ellipse cx="150" cy="350" rx="20" ry="8" fill="{C["maple"]}" transform="rotate(30 150 350)"/>
  <ellipse cx="250" cy="380" rx="20" ry="8" fill="{C["sun"]}" transform="rotate(-20 250 380)"/>
  <ellipse cx="180" cy="430" rx="22" ry="9" fill="{C["fox"]}" transform="rotate(60 180 430)"/>
  <ellipse cx="500" cy="350" rx="20" ry="8" fill="{C["sun"]}" transform="rotate(45 500 350)"/>
  <ellipse cx="600" cy="400" rx="22" ry="9" fill="{C["maple"]}" transform="rotate(-30 600 400)"/>
  <ellipse cx="450" cy="450" rx="20" ry="8" fill="{C["autumn"]}" transform="rotate(15 450 450)"/>
  <ellipse cx="290" cy="470" rx="22" ry="9" fill="{C["fox"]}" transform="rotate(-50 290 470)"/>
  <ellipse cx="550" cy="500" rx="20" ry="8" fill="{C["sun"]}" transform="rotate(40 550 500)"/>
  <!-- igły -->
  <line x1="100" y1="380" x2="120" y2="385" stroke="{C["leaf"]}" stroke-width="3"/>
  <line x1="350" y1="420" x2="370" y2="425" stroke="{C["leaf"]}" stroke-width="3"/>
  <line x1="630" y1="450" x2="650" y2="455" stroke="{C["leaf"]}" stroke-width="3"/>
  <!-- patyk -->
  <line x1="200" y1="500" x2="320" y2="520" stroke="{C["trunk_dk"]}" stroke-width="6"/>
  <!-- mech kępka -->
  <ellipse cx="500" cy="540" rx="40" ry="12" fill="{C["leaf_lt"]}"/>
</g>
<text x="400" y="170" text-anchor="middle" font-family="Comic Sans MS" font-size="32" font-weight="bold" fill="{C["trunk_dk"]}">ściółka leśna</text>
''')

print("Wygenerowano 3 SVG (grzyby) + 1 ściółka")

# ===== EKOLOGIA =====

# 28. EKOLOGIA - dziecko sprząta śmieci
save('ekologia', bg_forest() + tree_pine(120, 380, 0.6) + tree_oak(700, 380, 0.6) + f'''
<g transform="translate(400,400)">
  <!-- dziecko -->
  <circle cx="0" cy="-50" r="35" fill="{C["sun_lt"]}"/>
  <circle cx="-12" cy="-55" r="3" fill="{C["black"]}"/>
  <circle cx="12" cy="-55" r="3" fill="{C["black"]}"/>
  <path d="M-10,-40 Q0,-35 10,-40" stroke="{C["black"]}" stroke-width="2" fill="none"/>
  <!-- ciało (T-shirt) -->
  <rect x="-25" y="-15" width="50" height="60" fill="{C["leaf"]}" rx="6"/>
  <!-- ramiona -->
  <rect x="-50" y="-10" width="20" height="40" fill="{C["sun_lt"]}" rx="6"/>
  <rect x="30" y="-10" width="20" height="40" fill="{C["sun_lt"]}" rx="6"/>
  <!-- nogi -->
  <rect x="-22" y="40" width="18" height="40" fill="{C["blue"]}"/>
  <rect x="4" y="40" width="18" height="40" fill="{C["blue"]}"/>
  <!-- worek na śmieci -->
  <path d="M40,30 L60,30 L70,80 L30,80 Z" fill="{C["black"]}"/>
  <ellipse cx="50" cy="30" rx="12" ry="3" fill="{C["gray"]}"/>
</g>
<!-- znak Recycle obok -->
<g transform="translate(120,200)">
  <circle cx="0" cy="0" r="40" fill="{C["leaf"]}"/>
  <text x="0" y="10" text-anchor="middle" font-size="40" fill="{C["white"]}">♻</text>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">dbamy o las</text>
''')

# 29. PARK NARODOWY
save('park', bg_forest() + tree_pine(120, 380, 0.7) + tree_pine(680, 380, 0.7) + tree_oak(400, 380, 1.0) + f'''
<!-- znak parku -->
<g transform="translate(400,420)">
  <rect x="-110" y="-30" width="220" height="80" fill="{C["trunk"]}" stroke="{C["trunk_dk"]}" stroke-width="3" rx="5"/>
  <rect x="-100" y="-20" width="200" height="60" fill="{C["sun_lt"]}"/>
  <text x="0" y="-2" text-anchor="middle" font-family="Comic Sans MS" font-size="16" font-weight="bold" fill="{C["trunk_dk"]}">PARK</text>
  <text x="0" y="22" text-anchor="middle" font-family="Comic Sans MS" font-size="16" font-weight="bold" fill="{C["trunk_dk"]}">NARODOWY</text>
  <!-- słupek -->
  <rect x="-8" y="50" width="16" height="60" fill="{C["trunk"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">park narodowy</text>
''')

# 30. MAPA z kompasem
save('mapa', bg_meadow() + f'''
<g transform="translate(400,400) rotate(-5)">
  <!-- mapa -->
  <rect x="-180" y="-120" width="360" height="240" fill="{C["sun_lt"]}" stroke="{C["trunk"]}" stroke-width="4"/>
  <!-- linie/szlaki -->
  <path d="M-170,-100 Q-50,-50 50,0 T170,80" stroke="{C["red"]}" stroke-width="3" fill="none" stroke-dasharray="6,4"/>
  <path d="M-150,80 Q0,30 150,-80" stroke="{C["leaf"]}" stroke-width="3" fill="none"/>
  <!-- góry -->
  <polygon points="-100,-50 -70,-90 -40,-50" fill="{C["bear_dk"]}"/>
  <polygon points="-110,-30 -85,-60 -60,-30" fill="{C["bear"]}"/>
  <!-- drzewa na mapie -->
  <circle cx="60" cy="-50" r="15" fill="{C["leaf"]}"/>
  <circle cx="100" cy="-30" r="15" fill="{C["leaf"]}"/>
  <circle cx="-30" cy="60" r="15" fill="{C["leaf"]}"/>
  <!-- jezioro -->
  <ellipse cx="100" cy="60" rx="40" ry="15" fill="{C["blue"]}"/>
</g>
<!-- kompas -->
<g transform="translate(180,200)">
  <circle cx="0" cy="0" r="60" fill="{C["white"]}" stroke="{C["trunk_dk"]}" stroke-width="4"/>
  <circle cx="0" cy="0" r="50" fill="{C["sun_lt"]}"/>
  <text x="0" y="-30" text-anchor="middle" font-family="Comic Sans MS" font-size="16" font-weight="bold" fill="{C["red"]}">N</text>
  <text x="0" y="42" text-anchor="middle" font-family="Comic Sans MS" font-size="16" font-weight="bold" fill="{C["trunk_dk"]}">S</text>
  <text x="-35" y="6" text-anchor="middle" font-family="Comic Sans MS" font-size="16" font-weight="bold" fill="{C["trunk_dk"]}">W</text>
  <text x="35" y="6" text-anchor="middle" font-family="Comic Sans MS" font-size="16" font-weight="bold" fill="{C["trunk_dk"]}">E</text>
  <polygon points="0,-25 -8,5 0,0 8,5" fill="{C["red"]}"/>
  <polygon points="0,25 -8,-5 0,0 8,-5" fill="{C["white"]}" stroke="{C["trunk_dk"]}" stroke-width="2"/>
  <circle cx="0" cy="0" r="4" fill="{C["trunk_dk"]}"/>
</g>
<text x="400" y="565" text-anchor="middle" font-family="Comic Sans MS" font-size="24" font-weight="bold" fill="{C["trunk_dk"]}">mapa i kompas</text>
''')

print(f"Wygenerowano 3 SVG (ekologia)")

# Lista wszystkich plików
import glob
files = sorted(glob.glob(os.path.join(OUT, '*.svg')))
print(f"\n=== Razem plików SVG: {len(files)} ===")
for f in files:
    size = os.path.getsize(f) / 1024
    print(f"  {os.path.basename(f):<25} {size:5.1f} KB")
