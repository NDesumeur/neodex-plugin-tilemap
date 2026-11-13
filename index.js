// Tilemap : dessine des cartes en tuiles 16x16 pour tes jeux 2D, puis exporte-les en PNG ou au format Tiled (.tmj + planche de tuiles).
// Les tuiles sont dessinées en code, pixel par pixel. Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Tilemap</span><span class="hint">Cartes en tuiles 16×16 pour tes jeux 2D · clic droit : gomme · Ctrl+Z / Ctrl+Y : annuler / refaire</span></div>
  <div class="row tmBar"><select class="f" id="tmMaps" aria-label="Carte"></select><button class="btn main" id="tmNew">NOUVELLE</button>
    <select class="f" id="tmSize" aria-label="Taille"><option value="16x12">16 × 12</option><option value="32x20" selected>32 × 20</option><option value="48x30">48 × 30</option><option value="64x40">64 × 40</option></select>
    <button class="btn" id="tmRen">RENOMMER</button><button class="btn" id="tmDel">SUPPRIMER</button><span class="tmSp"></span><button class="btn" id="tmPng">EXPORT PNG</button><button class="btn" id="tmJson">EXPORT TILED</button></div>
  <div class="tmMain">
    <div class="tmSide">
      <div class="sysCard"><b>OUTILS</b><div class="tmTools" id="tmTools"></div></div>
      <div class="sysCard"><b>CALQUE</b><div class="tmTools" id="tmLayers"></div></div>
      <div class="sysCard"><b>TUILES</b><canvas id="tmPal" aria-label="Tuiles"></canvas><span class="hint" id="tmTile"></span></div>
    </div>
    <div class="tmBox"><canvas id="tmCanvas" role="img" aria-label="Carte en tuiles"></canvas></div>
  </div>
  <div class="hint tmHelp">Touches : P crayon · F remplir · R rectangle · E gomme · I pipette · G grille · 1 et 2 : calque. Le calque Objets se pose par-dessus le sol (arbres, coffres, portes…). EXPORT TILED donne la carte (.tmj) et sa planche de tuiles (.png), à ouvrir dans Tiled, Godot, Phaser ou LDtk.</div>
</div>`;
const CSS = `.tmBar{flex-wrap:wrap;gap:8px;margin-bottom:14px}.tmBar select{width:auto;flex:0 1 auto;min-width:0}.tmBar .tmSp{flex:1}
.tmMain{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
.tmSide{display:flex;flex-direction:column;gap:12px;width:236px;flex:0 0 auto}
.tmSide .sysCard{display:flex;flex-direction:column;gap:8px}
.tmTools{display:flex;flex-wrap:wrap;gap:6px}
#tmPal{width:100%;height:auto;image-rendering:pixelated;cursor:pointer}
.tmBox{padding:8px;background:#05010b;flex:1;min-width:300px;display:grid;place-items:center}
.tmBox canvas{max-width:100%;image-rendering:pixelated;cursor:crosshair;touch-action:none}
.tmHelp{margin-top:14px}`;
const TM_T = 16;
// la planche de tuiles : le sol (opaque) puis les objets (fond transparent, contour sombre ajouté tout seul)
function tmTiles() {
  const P = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const disc = (g, c, cx, cy, r) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * .8) P(g, c, cx + x, cy + y); };
  const base = (c, cs, n) => (g, r) => { P(g, c, 0, 0, 16, 16); for (let i = 0; i < n; i++) P(g, cs[i % cs.length], r() * 16 | 0, r() * 16 | 0); };
  const grass = base('#3f8a3a', ['#4fa045', '#357a32', '#5ab04e'], 40);
  const waves = (bg, fg) => g => { P(g, bg, 0, 0, 16, 16); for (const [x, y] of [[1, 3], [9, 6], [3, 11], [10, 13]]) { P(g, fg, x, y, 3, 1); P(g, fg, x + 3, y - 1, 2, 1); } };
  const GROUND = [
    ['Herbe', grass],
    ['Herbe fleurie', (g, r) => { grass(g, r); for (const [x, y, c] of [[3, 4, '#ffe14a'], [11, 3, '#ff7ab0'], [7, 10, '#ffffff'], [13, 12, '#ffe14a'], [2, 13, '#ff7ab0']]) { P(g, c, x, y); P(g, '#2a6a2a', x, y + 1); } }],
    ['Terre', base('#7a5232', ['#6a4428', '#8a6040', '#5a3a20'], 34)],
    ['Chemin', (g, r) => { base('#b08a5a', ['#a07a4a', '#c09a6a'], 30)(g, r); for (let i = 0; i < 4; i++) { const x = r() * 13 | 0, y = r() * 13 | 0; P(g, '#8a8a90', x, y, 2, 2); P(g, '#b0b0b8', x, y); } }],
    ['Sable', base('#e0c878', ['#d0b468', '#ecd890', '#c8a858'], 36)],
    ['Eau', waves('#2a6ac0', '#5a9ae8')],
    ['Eau profonde', waves('#1a3a80', '#2a5aa8')],
    ['Glace', g => { P(g, '#a8e0f0', 0, 0, 16, 16); for (let i = 0; i < 6; i++) P(g, '#e0f8ff', 9 + i, 6 - i); for (let i = 0; i < 4; i++) P(g, '#e0f8ff', 2 + i, 14 - i); P(g, '#80c0d8', 0, 15, 16, 1); }],
    ['Neige', base('#e8f0f8', ['#cad8e8', '#ffffff', '#d8e4f0'], 30)],
    ['Lave', (g, r) => { P(g, '#a8240a', 0, 0, 16, 16); for (let i = 0; i < 5; i++) disc(g, '#ff6a1a', r() * 16 | 0, r() * 16 | 0, 1 + (r() * 2 | 0)); for (let i = 0; i < 6; i++) P(g, '#ffd04a', r() * 16 | 0, r() * 16 | 0); }],
    ['Pierre', (g, r) => { base('#7a7a84', ['#6a6a74', '#8a8a94'], 30)(g, r); for (const [x, y] of [[3, 4], [4, 5], [5, 5], [6, 6], [11, 10], [12, 11], [12, 12]]) P(g, '#4e4e58', x, y); }],
    ['Pavés', g => { P(g, '#4a4a52', 0, 0, 16, 16); for (let y = 0; y < 16; y += 8) for (let x = y % 16 ? -4 : 0; x < 16; x += 8) { P(g, '#8a8a94', x + 1, y + 1, 6, 6); P(g, '#a4a4ae', x + 1, y + 1, 6, 1); P(g, '#6a6a74', x + 1, y + 6, 6, 1); } }],
    ['Planches', g => { P(g, '#9a6a3a', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) { P(g, '#b07a48', 0, y, 16, 1); P(g, '#6a4422', 0, y + 3, 16, 1); P(g, '#6a4422', (y * 5 + 3) % 16, y, 1, 3); } }],
    ['Briques', g => { P(g, '#5a2a20', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) for (let x = y % 8 ? -4 : 0; x < 16; x += 8) { P(g, '#a03a2a', x, y, 7, 3); P(g, '#c05a40', x, y, 7, 1); } }],
    ['Mur de pierre', g => { P(g, '#2e2e36', 0, 0, 16, 16); for (const [x, y, w, h] of [[0, 0, 9, 7], [10, 0, 6, 7], [0, 8, 5, 8], [6, 8, 10, 8]]) { P(g, '#5a5a66', x, y, w, h); P(g, '#76767f', x, y, w, 1); P(g, '#46464f', x, y + h - 1, w, 1); } }],
    ['Toit', g => { P(g, '#1e2638', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) for (let x = y % 8 ? -2 : 0; x < 16; x += 4) { P(g, '#46567a', x, y, 3, 3); P(g, '#6a7ca0', x, y, 3, 1); } }],
  ];
  const OBJ = [
    ['Arbre', g => { P(g, '#6a4422', 7, 10, 3, 5); P(g, '#4a2e16', 9, 10, 1, 5); disc(g, '#2f7a2a', 8, 7, 6); disc(g, '#4a9a3a', 7, 6, 4); P(g, '#6ac050', 5, 3, 2, 1); P(g, '#6ac050', 4, 4); }],
    ['Sapin', g => { P(g, '#5a3a1e', 7, 13, 2, 3); for (let y = 1; y < 14; y++) { const w = 1 + (y - 1) % 4 + (y - 1) / 4 | 0; P(g, '#2a7a40', 8 - w, y, w, 1); P(g, '#1a5a30', 8, y, w, 1); } P(g, '#4aa060', 7, 2); }],
    ['Buisson', g => { disc(g, '#2f7a2a', 5, 11, 4); disc(g, '#2f7a2a', 10, 10, 5); disc(g, '#4a9a3a', 9, 9, 3); for (const [x, y] of [[4, 10], [11, 12], [8, 7]]) P(g, '#e03a4a', x, y); }],
    ['Fleurs', g => { for (const [x, y, c] of [[3, 7, '#ffe14a'], [8, 4, '#ff7ab0'], [12, 8, '#8ab0ff']]) { P(g, '#2a7a2a', x, y + 2, 1, 13 - y); P(g, '#4aa040', x + 1, y + 6, 2, 1); P(g, c, x - 1, y, 3, 3); P(g, '#fff4c0', x, y + 1); } }],
    ['Herbes hautes', g => { for (let i = 0; i < 6; i++) { const x = 2 + i * 2.3 | 0, h = 6 + (i * 7) % 5; P(g, i % 2 ? '#4aa040' : '#3a8a32', x, 15 - h, 1, h); P(g, '#6ac050', x + (i % 2 ? 1 : -1), 14 - h); } }],
    ['Rocher', g => { disc(g, '#6a6a74', 8, 10, 5); P(g, '#6a6a74', 3, 10, 11, 5); disc(g, '#8a8a94', 7, 9, 3); P(g, '#b0b0ba', 5, 7, 2, 1); P(g, '#4e4e58', 4, 14, 9, 1); }],
    ['Souche', g => { P(g, '#7a4a24', 4, 8, 8, 7); P(g, '#5a3418', 10, 8, 2, 7); P(g, '#d0a060', 4, 7, 8, 2); P(g, '#a07040', 6, 7, 4, 1); P(g, '#7a4a24', 3, 14, 2, 1); P(g, '#7a4a24', 11, 14, 2, 1); }],
    ['Champignon', g => { P(g, '#f0e6d0', 7, 9, 3, 6); disc(g, '#d0302a', 8, 7, 4); P(g, '#d0302a', 4, 8, 9, 1); for (const [x, y] of [[6, 5], [10, 6], [8, 8]]) P(g, '#ffffff', x, y); }],
    ['Coffre', g => { P(g, '#8a5a2a', 2, 6, 12, 9); P(g, '#a8743a', 2, 6, 12, 2); P(g, '#5a3a18', 2, 9, 12, 1); P(g, '#d8b040', 2, 6, 1, 9); P(g, '#d8b040', 13, 6, 1, 9); P(g, '#ffe070', 7, 8, 2, 3); }],
    ['Tonneau', g => { P(g, '#8a5a2a', 4, 3, 8, 12); P(g, '#a8743a', 5, 3, 3, 12); P(g, '#5a5a66', 4, 5, 8, 1); P(g, '#5a5a66', 4, 12, 8, 1); P(g, '#6a4422', 5, 2, 6, 1); }],
    ['Clôture', g => { for (const x of [2, 7, 12]) { P(g, '#c8a070', x, 4, 2, 11); P(g, '#c8a070', x, 3); } P(g, '#a8804a', 0, 6, 16, 2); P(g, '#a8804a', 0, 11, 16, 2); }],
    ['Panneau', g => { P(g, '#6a4422', 7, 9, 2, 6); P(g, '#b08050', 2, 3, 12, 7); P(g, '#d0a070', 2, 3, 12, 1); for (const y of [5, 7]) P(g, '#6a4422', 4, y, 8, 1); }],
    ['Torche', g => { P(g, '#6a4422', 7, 7, 2, 8); disc(g, '#ff8a1a', 8, 4, 2); P(g, '#ffe070', 7, 3, 2, 2); P(g, '#ff8a1a', 8, 0, 1, 2); }],
    ['Cristal', g => { for (let y = 0; y < 12; y++) { const w = y < 4 ? y + 1 : y > 8 ? 12 - y : 4; P(g, '#5ae0ff', 8 - w, 2 + y, w, 1); P(g, '#2a90c0', 8, 2 + y, w, 1); } P(g, '#e0ffff', 6, 5, 1, 3); }],
    ['Porte', g => { P(g, '#6a4422', 3, 1, 10, 15); P(g, '#8a5a2a', 4, 2, 8, 14); for (const x of [6, 9]) P(g, '#6a4422', x, 2, 1, 14); P(g, '#ffe070', 10, 9); }],
    ['Fenêtre', g => { P(g, '#5a3a18', 2, 3, 12, 11); P(g, '#8ad0ff', 3, 4, 10, 9); P(g, '#5a3a18', 7, 4, 2, 9); P(g, '#5a3a18', 3, 8, 10, 1); P(g, '#e0f6ff', 4, 5, 2, 1); }],
  ];
  return [...GROUND.map(t => [...t, false]), ...OBJ.map(t => [...t, true])].map(([name, draw, obj], i) => {
    const c = document.createElement('canvas'); c.width = c.height = TM_T; const g = c.getContext('2d');
    let s = 977 + i * 131; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    draw(g, r);
    if (obj) {  // le contour : chaque pixel vide qui touche la tuile devient sombre
      const im = g.getImageData(0, 0, 16, 16), d = im.data, a = i => d[i * 4 + 3] > 0, out = [];
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (!a(y * 16 + x) && ((x > 0 && a(y * 16 + x - 1)) || (x < 15 && a(y * 16 + x + 1)) || (y > 0 && a(y * 16 + x - 16)) || (y < 15 && a(y * 16 + x + 16)))) out.push([x, y]);
      for (const [x, y] of out) P(g, '#1a1020', x, y);
    }
    return { name, c, obj };
  });
}
// remplit la zone de même tuile autour de la case i ; rend le nombre de cases changées
function tmFlood(a, w, h, i, v) {
  const old = a[i]; if (old === v) return 0;
  const q = [i]; let n = 0; a[i] = v;
  while (q.length) { const j = q.pop(); n++; const x = j % w, y = j / w | 0;
    for (const k of [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, y > 0 ? j - w : -1, y < h - 1 ? j + w : -1]) if (k >= 0 && a[k] === old) { a[k] = v; q.push(k); } }
  return n;
}
const tmRect = (a, w, x0, y0, x1, y1, v) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) a[y * w + x] = v; };
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}



export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const sprite = (g, rows, x, y, pal) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } });
  const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };
  const gameText = (g, w, lines, y0) => {  // lignes centrées en police pixel, sur une bande sombre
    g.fillStyle = 'rgba(11,3,28,.78)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
    lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
  };
  const theme = (acc, accL, accS, accD, acc2, base = ['#0c0a12', '#16121e', '#221c2c', '#2e263a', '#3a3046', '#62566e']) => {
    const [k, k2, fill, fillOn, hl, line] = base;
    return { k, k2, fill, fillOn, hl, line, acc, accL, accS, accD, rivet: '#f0f0f8', btn: hl, btnHi: line, btnLo: k2, btnHov: '#443852', btnHovHi: '#82768e', text: '#f4f0f8', muted: '#c0b8cc',
      acc2, gold: '#ffd84a', orange: '#ff8a3a', red: '#ff4a3a', green: '#7ee07a', green2: '#2f8a3a', bg: '#100c16', bgDot: fill, bgDot2: k2, spark: accD, spark2: acc,
      tile: ['................', '...:............', '................', '..........+.....', '................', '................', '.....:..........', '................', '................', '.............:..', '................', '..+.............', '................', '.........:......', '................', '................'] };
  };
  let ac = null, mute = false;
  const beep = (f, d, type = 'square', slide = 0, vol = .03, at = 0) => { if (mute) return; try { ac ??= new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + at; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d); } catch {} };
  const on = () => view.classList.contains('on');
  // la manette : croix et stick gauche = flèches, A = Entrée, B = Échap, X = Retour arrière, Y = H, Start = P ; envoyées comme des touches du clavier
  const padKeys = (map = {}) => {
    const KEY = { 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight', 0: 'Enter', 1: 'Escape', 2: 'Backspace', 3: 'h', 9: 'p', ...map };
    const held = new Map(), send = (k, type) => document.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true }));
    const loop = () => {
      requestAnimationFrame(loop);
      if (!on() || !navigator.getGamepads) return;
      const p = [...navigator.getGamepads()].find(Boolean); if (!p) return;
      const now = performance.now(), down = new Set();
      for (const [i, k] of Object.entries(KEY)) if (p.buttons[i]?.pressed) down.add(k);
      const [ax = 0, ay = 0] = p.axes;
      if (ax < -.5) down.add('ArrowLeft'); if (ax > .5) down.add('ArrowRight'); if (ay < -.5) down.add('ArrowUp'); if (ay > .5) down.add('ArrowDown');
      for (const k of down) { const t = held.get(k); if (t === undefined) { held.set(k, now + 260); send(k, 'keydown'); } else if (/^Arrow/.test(k) && now > t) { held.set(k, now + 110); send(k, 'keydown'); } }
      for (const k of [...held.keys()]) if (!down.has(k)) { held.delete(k); send(k, 'keyup'); }
    };
    requestAnimationFrame(loop);
  };
  pxSkin(view.querySelector('.appWrap'), { title: 'TILEMAP', T: theme('#5ae07a', '#d0ffd8', '#2a9a4a', '#08200e', '#ffd84a'),
    emblem: ['kkkkkkkkkkkk', 'kaaakwwwkaak', 'kaaakwwwkaak', 'kaaakwwwkaak', 'kkkkkkkkkkkk', 'kwwwkaaakbbk', 'kwwwkaaakbbk', 'kwwwkaaakbbk', 'kkkkkkkkkkkk', 'kaaakbbbkwwk', 'kaaakbbbkwwk', 'kkkkkkkkkkkk'],
    icons: [[/^NOUVELLE/, 'plus']] });
  const TILES = tmTiles(), TS = TM_T;
  const blank = (name, w, h) => ({ name, w, h, l: [Array(w * h).fill(1), Array(w * h).fill(0)] });
  const data = { maps: [], cur: 0, ...(await doc('cartes')) };
  if (!data.maps.length) data.maps.push(blank('Ma carte', 32, 20));
  let timer; const keep = () => { clearTimeout(timer); timer = setTimeout(() => folder.write('cartes', data).catch(e => toast('Pas enregistré : ' + e.message, true)), 400); };
  const st = { tool: 'pen', layer: 0, tile: 1, grid: true, undo: [], redo: [], hover: null, drag: null, btn: 0, last: null };
  const map = () => data.maps[data.cur] || data.maps[0];
  const cv = $('tmCanvas'), g = cv.getContext('2d'), pal = $('tmPal'), PC = 6, PS = 18;

  function fit() {  // la carte au plus grand qui tient (facteur entier dès 2)
    const m = map(), aw = Math.max(240, cv.parentElement.clientWidth - 16), ah = Math.max(240, innerHeight * .7);
    let s = Math.min(aw / (m.w * TS), ah / (m.h * TS)); if (s >= 2) s = Math.floor(s);  // entre 1 et 2 : grossi quand même, au prix de pixels un peu inégaux
    cv.style.width = Math.round(m.w * TS * s) + 'px';
  }
  function draw() {
    const m = map(), W = m.w * TS, H = m.h * TS;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; fit(); }
    g.fillStyle = '#05010b'; g.fillRect(0, 0, W, H);
    const R = Array.isArray(st.drag) ? st.drag : null, inR = R && ((x, y) => x >= Math.min(R[0][0], R[1][0]) && x <= Math.max(R[0][0], R[1][0]) && y >= Math.min(R[0][1], R[1][1]) && y <= Math.max(R[0][1], R[1][1]));
    for (let L = 0; L < 2; L++) {
      g.globalAlpha = L > st.layer ? .45 : 1;  // le calque du dessus pâlit quand tu peins le sol
      for (let i = 0; i < m.w * m.h; i++) { const x = i % m.w, y = i / m.w | 0; let v = m.l[L][i]; if (inR && L === st.layer && inR(x, y)) v = st.btn === 2 ? 0 : st.tile; if (v) g.drawImage(TILES[v - 1].c, x * TS, y * TS); }
    }
    g.globalAlpha = 1;
    if (st.grid) { g.fillStyle = 'rgba(255,255,255,.09)'; for (let x = 1; x < m.w; x++) g.fillRect(x * TS, 0, 1, H); for (let y = 1; y < m.h; y++) g.fillRect(0, y * TS, W, 1); }
    if (st.hover) { const [x, y] = st.hover; g.fillStyle = '#ffffff'; for (const [a, b, w, h] of [[0, 0, TS, 1], [0, TS - 1, TS, 1], [0, 0, 1, TS], [TS - 1, 0, 1, TS]]) g.fillRect(x * TS + a, y * TS + b, w, h); }
  }
  function drawPal() {
    pal.width = PC * PS; pal.height = Math.ceil(TILES.length / PC) * PS; const p = pal.getContext('2d');
    p.fillStyle = '#0c0a12'; p.fillRect(0, 0, pal.width, pal.height);
    TILES.forEach((t, i) => { const x = i % PC * PS + 1, y = (i / PC | 0) * PS + 1;
      if (i + 1 === st.tile) { p.fillStyle = '#5ae07a'; p.fillRect(x - 1, y - 1, PS, PS); }
      p.fillStyle = '#2a2234'; p.fillRect(x, y, 16, 16); p.drawImage(t.c, x, y); });
    $('tmTile').textContent = TILES[st.tile - 1].name + (TILES[st.tile - 1].obj ? ' (objet)' : ' (sol)');
  }
  const TOOLS = [['pen', 'CRAYON', 'p'], ['fill', 'REMPLIR', 'f'], ['rect', 'RECTANGLE', 'r'], ['erase', 'GOMME', 'e'], ['pick', 'PIPETTE', 'i']];
  function bar() {
    const b = (label, on, key, f) => { const x = el('button', 'btn' + (on ? ' main' : ''), label); x.title = 'Touche ' + key; x.onclick = f; return x; };
    $('tmTools').replaceChildren(...TOOLS.map(([id, n, k]) => b(n, st.tool === id, k.toUpperCase(), () => setTool(id))), b('GRILLE', st.grid, 'G', () => { st.grid = !st.grid; bar(); draw(); }));
    $('tmLayers').replaceChildren(...['SOL', 'OBJETS'].map((n, i) => b(n, st.layer === i, i + 1, () => { st.layer = i; bar(); draw(); })));
  }
  const setTool = t => { st.tool = t; bar(); };
  function select(t) { st.tile = t; st.layer = TILES[t - 1].obj ? 1 : 0; if (st.tool === 'erase' || st.tool === 'pick') st.tool = 'pen'; bar(); drawPal(); draw(); }
  function maps() { $('tmMaps').replaceChildren(...data.maps.map((m, i) => { const o = el('option', '', m.name + ' (' + m.w + ' × ' + m.h + ')'); o.value = i; o.selected = i === data.cur; return o; })); }
  const switchTo = i => { data.cur = i; st.undo = []; st.redo = []; maps(); keep(); fit(); draw(); };

  // dessin à la souris (et au stylet / doigt)
  const cell = e => { const b = cv.getBoundingClientRect(), m = map(), x = Math.floor((e.clientX - b.left) / b.width * m.w), y = Math.floor((e.clientY - b.top) / b.height * m.h); return x >= 0 && y >= 0 && x < m.w && y < m.h ? [x, y] : null; };
  const snap = () => { const m = map(); st.undo.push([m.l[0].slice(), m.l[1].slice()]); if (st.undo.length > 80) st.undo.shift(); st.redo = []; };
  const paint = ([x, y]) => { const m = map(); m.l[st.layer][y * m.w + x] = st.btn === 2 || st.tool === 'erase' ? 0 : st.tile; };
  const line = (a, b) => { const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) || 1; for (let k = 0; k <= n; k++) paint([Math.round(a[0] + (b[0] - a[0]) * k / n), Math.round(a[1] + (b[1] - a[1]) * k / n)]); };
  cv.oncontextmenu = e => e.preventDefault();
  cv.onpointerdown = e => {
    e.preventDefault(); const c = cell(e); if (!c) return; try { cv.setPointerCapture(e.pointerId); } catch {}
    st.btn = e.button; const m = map(), i = c[1] * m.w + c[0];
    if (st.tool === 'pick') { const t = m.l[st.layer][i] || m.l[1 - st.layer][i]; if (t) select(t); return; }
    snap();
    if (st.tool === 'fill' && st.btn !== 2) { tmFlood(m.l[st.layer], m.w, m.h, i, st.tile); keep(); draw(); return; }
    if (st.tool === 'rect') { st.drag = [c, c]; draw(); return; }
    st.drag = true; st.last = c; paint(c); draw();
  };
  cv.onpointermove = e => {
    const c = cell(e); st.hover = c;
    if (c && Array.isArray(st.drag)) st.drag[1] = c; else if (c && st.drag) { line(st.last, c); st.last = c; }
    draw();
  };
  cv.onpointerup = () => {
    if (Array.isArray(st.drag)) { const [[ax, ay], [bx, by]] = st.drag, m = map(); tmRect(m.l[st.layer], m.w, ax, ay, bx, by, st.btn === 2 ? 0 : st.tile); }
    if (st.drag) keep(); st.drag = null; draw();
  };
  cv.onpointerleave = () => { st.hover = null; draw(); };
  pal.onclick = e => { const b = pal.getBoundingClientRect(), i = Math.floor((e.clientX - b.left) / b.width * PC) + Math.floor((e.clientY - b.top) / b.height * pal.height / PS) * PC; if (TILES[i]) select(i + 1); };
  function undo(redo) { const from = redo ? st.redo : st.undo, to = redo ? st.undo : st.redo, s = from.pop(); if (!s) return; const m = map(); to.push(m.l); m.l = s; keep(); draw(); }
  document.addEventListener('keydown', e => {
    if (!on() || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target?.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.ctrlKey && (k === 'z' || k === 'y')) { e.preventDefault(); undo(k === 'y' || e.shiftKey); return; }
    if (e.ctrlKey || e.altKey) return;
    const t = TOOLS.find(x => x[2] === k); if (t) setTool(t[0]);
    else if (k === 'g') { st.grid = !st.grid; bar(); draw(); }
    else if (k === '1' || k === '2') { st.layer = +k - 1; bar(); draw(); }
  });

  // cartes
  $('tmMaps').onchange = e => switchTo(+e.target.value);
  $('tmNew').onclick = async () => { const name = await host.ask('Nom de la nouvelle carte :', 'Carte ' + (data.maps.length + 1)); if (!name) return; const [w, h] = $('tmSize').value.split('x').map(Number); data.maps.push(blank(String(name).slice(0, 40), w, h)); switchTo(data.maps.length - 1); };
  $('tmRen').onclick = async () => { const name = await host.ask('Nouveau nom :', map().name); if (!name) return; map().name = String(name).slice(0, 40); maps(); keep(); };
  $('tmDel').onclick = async () => { if (!await host.confirm('Supprimer la carte « ' + map().name + ' » ? Elle sera perdue.')) return; data.maps.splice(data.cur, 1); if (!data.maps.length) data.maps.push(blank('Ma carte', 32, 20)); switchTo(0); };

  // exports
  const download = (href, name) => { const a = el('a'); a.href = href; a.download = name; document.body.append(a); a.click(); a.remove(); };
  const fname = () => map().name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_') || 'carte';
  function picture() { const m = map(), c = document.createElement('canvas'); c.width = m.w * TS; c.height = m.h * TS; const x = c.getContext('2d'); for (const L of m.l) L.forEach((v, i) => v && x.drawImage(TILES[v - 1].c, i % m.w * TS, (i / m.w | 0) * TS)); return c; }
  function sheet() { const c = document.createElement('canvas'), cols = 8; c.width = cols * TS; c.height = Math.ceil(TILES.length / cols) * TS; const x = c.getContext('2d'); TILES.forEach((t, i) => x.drawImage(t.c, i % cols * TS, (i / cols | 0) * TS)); return c; }
  const tiled = (m, s) => ({ type: 'map', version: '1.10', tiledversion: '1.10.2', orientation: 'orthogonal', renderorder: 'right-down', width: m.w, height: m.h, tilewidth: TS, tileheight: TS, infinite: false, nextlayerid: 3, nextobjectid: 1,
    layers: ['Sol', 'Objets'].map((name, i) => ({ id: i + 1, name, type: 'tilelayer', width: m.w, height: m.h, x: 0, y: 0, opacity: 1, visible: true, data: m.l[i].slice() })),
    tilesets: [{ firstgid: 1, name: 'neodex', image: 'tuiles-neodex.png', imagewidth: s.width, imageheight: s.height, tilewidth: TS, tileheight: TS, tilecount: TILES.length, columns: s.width / TS, margin: 0, spacing: 0 }] });
  $('tmPng').onclick = () => { download(picture().toDataURL('image/png'), fname() + '.png'); toast('Image de la carte enregistrée dans tes téléchargements.'); };
  $('tmJson').onclick = () => { const s = sheet(); download(URL.createObjectURL(new Blob([JSON.stringify(tiled(map(), s))], { type: 'application/json' })), fname() + '.tmj');
    setTimeout(() => download(s.toDataURL('image/png'), 'tuiles-neodex.png'), 400); toast('Carte (.tmj) et planche de tuiles enregistrées dans tes téléchargements : garde-les dans le même dossier.'); };

  {  // vérification : remplissage, rectangle, tuiles nettes (sol opaque, objets détourés), export au format Tiled
    const bad = [];
    const a = [1, 1, 2, 1, 2, 2, 1, 1, 1]; if (tmFlood(a, 3, 3, 0, 5) !== 6 || a.join() !== '5,5,2,5,2,2,5,5,5') bad.push('remplissage');
    const b = Array(12).fill(0); tmRect(b, 4, 3, 2, 1, 0, 7); if (b.filter(v => v === 7).length !== 9 || b[0] !== 0) bad.push('rectangle');
    for (const t of TILES) { const d = t.c.getContext('2d').getImageData(0, 0, 16, 16).data; let n = 0, soft = 0; for (let i = 3; i < d.length; i += 4) { n += d[i] === 255; soft += d[i] > 0 && d[i] < 255; }
      if (soft || (t.obj ? n < 20 || n === 256 : n !== 256)) bad.push('tuile ' + t.name); }
    const s = tiled(blank('t', 2, 2), { width: 128, height: 64 }); if (s.layers[1].data.length !== 4 || s.tilesets[0].tilecount !== TILES.length || s.tilesets[0].columns !== 8) bad.push('export');
    console.assert(!bad.length, 'tilemap', bad); view.dataset.selfcheck = bad.join(' | ') || 'ok';
  }
  maps(); bar(); drawPal(); draw();
  addEventListener('resize', fit);
  ctx.onOpen(() => { fit(); draw(); });
  cv.__t = { map, st, tiles: TILES.length, firstObj: TILES.findIndex(t => t.obj) };
}
