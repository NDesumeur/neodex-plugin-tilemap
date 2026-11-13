// lancé par le test « local » de NeoDex : vérification interne, remplit le sol de terre à la souris, annule (Ctrl+Z), puis pose un rectangle d'arbres sur le calque Objets
module.exports = async ({ pj, sleep }) => {
  const sc = await pj(`document.querySelector('[data-selfcheck]')?.dataset.selfcheck`); if (sc !== 'ok') throw new Error('vérification interne : ' + sc);
  const r = await pj(`(() => {
    const cv = document.getElementById('tmCanvas'), pal = document.getElementById('tmPal'), T = cv.__t, map = T.map;
    const at = (type, fx, fy) => { const b = cv.getBoundingClientRect(); cv.dispatchEvent(new PointerEvent(type, { clientX: b.left + b.width * fx, clientY: b.top + b.height * fy, button: 0, buttons: type === 'pointerup' ? 0 : 1, pointerId: 1, bubbles: true })); };
    const tile = i => { const b = pal.getBoundingClientRect(), rows = pal.height / 18; pal.onclick({ clientX: b.left + b.width * ((i % 6) + .5) / 6, clientY: b.top + b.height * (Math.floor(i / 6) + .5) / rows }); };
    const tool = n => [...document.querySelectorAll('#tmTools button')].find(b => b.textContent.includes(n)).click();
    tile(2); tool('REMPLIR'); at('pointerdown', .5, .5); at('pointerup', .5, .5);
    const filled = map().l[0].every(v => v === 3);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    const undone = map().l[0].every(v => v === 1);
    tile(T.firstObj); tool('RECTANGLE'); at('pointerdown', .1, .1); at('pointermove', .3, .3); at('pointerup', .3, .3);
    const m = map(), trees = m.l[1].filter(v => v === T.firstObj + 1).length, want = (Math.floor(.3 * m.w) - Math.floor(.1 * m.w) + 1) * (Math.floor(.3 * m.h) - Math.floor(.1 * m.h) + 1);
    return { filled, undone, trees, want, layer: T.st.layer, sol: m.l[0].every(v => v === 1) };
  })()`);
  if (!r.filled) throw new Error('le remplissage n’a pas couvert la carte');
  if (!r.undone) throw new Error('Ctrl+Z n’a pas annulé');
  if (r.trees !== r.want || r.layer !== 1 || !r.sol) throw new Error('rectangle d’arbres : ' + JSON.stringify(r));
  // un petit village pour la capture du NeoStore (herbe 1, fleurie 2, chemin 4, sable 5, eau 6-7, pavés 12, briques 14, toit 16 ; objets 17 et plus)
  await pj(`(() => {
    const cv = document.getElementById('tmCanvas'), m = cv.__t.map(), W = m.w, S = m.l[0], O = m.l[1], set = (a, x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < m.h) a[y * W + x] = v; };
    S.fill(1); O.fill(0); for (let i = 0; i < S.length; i++) if ((i * 7919) % 13 === 0) S[i] = 2;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < W; x++) { const d = ((x - 24) / 6.5) ** 2 + ((y - 13) / 4.5) ** 2; if (d < 1.45) set(S, x, y, d < .45 ? 7 : d < 1 ? 6 : 5); }
    for (let x = 0; x < 18; x++) set(S, x, 10, 4); for (let y = 10; y < m.h; y++) set(S, 11, y, 4); set(S, 5, 9, 4);
    for (let y = 2; y < 5; y++) for (let x = 2; x < 9; x++) set(S, x, y, 16); for (let y = 5; y < 9; y++) for (let x = 2; x < 9; x++) set(S, x, y, 14);
    set(O, 5, 8, 31); set(O, 3, 6, 32); set(O, 7, 6, 32); set(O, 9, 8, 26); set(O, 9, 7, 26);
    for (let y = 3; y < 8; y++) for (let x = 12; x < 17; x++) set(S, x, y, 12); set(O, 14, 5, 25); set(O, 12, 3, 29); set(O, 16, 3, 29); set(O, 13, 9, 28);
    for (const [x, y] of [[1, 13], [3, 16], [6, 14], [2, 18], [8, 17], [14, 15], [16, 18]]) set(O, x, y, 17);
    for (const [x, y] of [[20, 1], [23, 2], [26, 1], [29, 3], [21, 4], [30, 6]]) set(O, x, y, 18);
    for (let x = 0; x < 9; x++) set(O, x, 12, 27); for (const [x, y, v] of [[19, 9, 19], [5, 18, 20], [9, 14, 20], [15, 13, 21], [18, 13, 22], [29, 17, 22], [27, 9, 24], [13, 17, 23], [30, 12, 30], [17, 10, 20]]) set(O, x, y, v);
    cv.__t.st.hover = null; document.querySelectorAll('#tmLayers button')[1].click(); 0; })()`);
  await sleep(500);
  return 'remplissage, annulation, ' + r.trees + ' arbres sur le calque Objets';
};
