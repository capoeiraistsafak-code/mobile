// Konu anlatımı videoları · ortak yardımcılar (sahne çizimi). İçerik dosyaları bunları kullanır.
const $ = id => document.getElementById(id);
const cl = v => Math.max(0, Math.min(1, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const prog = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const at = (id, k, v) => $(id).setAttribute(k, v);
const st = (id, o) => Object.assign($(id).style, o);
const pulse = (s, a, b) => Math.sin(Math.PI * prog(s, a, b));

// kurşun kalem notu (el yazısı), ✓ işareti
const H = (o, t, x, y, w = '') => `<div class="h" data-o="${o}"${w ? ` data-w="${w}"` : ''} style="left:${x}px;top:${y}px">${t}</div>`;
const CK = '<span class="ck">✓</span>';
// kalemle çekilen düz çizgi (kalem ucu çizginin üzerinden gider, sesi düz sürtünme)
const PL = (o, x1, y1, x2, y2, extra = '') => `<line class="pl" data-o="${o}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" ${extra}/>`;
const EM = (id, ch, x, y, size, extra = '') => `<span class="em" id="${id}" style="left:${x}px;top:${y}px;font-size:${size}px;${extra}">${ch}</span>`;
// vektör oku
const VEC = (id, col, lab) => `<g id="${id}" opacity="0"><line id="${id}l" stroke="${col}" stroke-width="4" stroke-linecap="round"/><polygon id="${id}p" fill="${col}"/><text id="${id}t" class="vlab" fill="${col}">${lab}</text></g>`;
function vec(id, x1, y1, x2, y2, k = 1, o = 1, lx = 0, ly = 0) {
  const X = lerp(x1, x2, k), Y = lerp(y1, y2, k), a = Math.atan2(Y - y1, X - x1), L = Math.hypot(X - x1, Y - y1), h = Math.min(12, L);
  const bx = X - h * Math.cos(a), by = Y - h * Math.sin(a);
  at(id, 'opacity', L < 1 ? 0 : o);
  at(id + 'l', 'x1', x1); at(id + 'l', 'y1', y1); at(id + 'l', 'x2', bx); at(id + 'l', 'y2', by);
  at(id + 'p', 'points', `${X},${Y} ${bx - 6 * Math.sin(a)},${by + 6 * Math.cos(a)} ${bx + 6 * Math.sin(a)},${by - 6 * Math.cos(a)}`);
  at(id + 't', 'x', (x1 + X) / 2 + lx); at(id + 't', 'y', (y1 + Y) / 2 + ly);
}
const GRID = (w, h, c = 20) => `<g class="grid">${Array.from({length: Math.floor(w / c) + 1}, (_, i) => `<line x1="${i * c}" y1="0" x2="${i * c}" y2="${h}"/>`).join('')}${Array.from({length: Math.floor(h / c) + 1}, (_, i) => `<line x1="0" y1="${i * c}" x2="${w}" y2="${i * c}"/>`).join('')}</g>`;
const SCENE = (top, h, inner, grid = true, extra = '') => `<div class="sc" style="top:${top}px;height:${h}px;width:441px"><svg width="441" height="${h}" style="position:absolute;left:0;top:0">${grid ? GRID(441, h) : ''}${inner}</svg>${extra}</div>`;
const RHEAD = id => `<polygon id="${id}" fill="#D62828" opacity="0"/>`;
function rhead(id, x1, y1, x2, y2, o) { const a = Math.atan2(y2 - y1, x2 - x1), bx = x2 - 12 * Math.cos(a), by = y2 - 12 * Math.sin(a);
  at(id, 'points', `${x2},${y2} ${bx - 6 * Math.sin(a)},${by + 6 * Math.cos(a)} ${bx + 6 * Math.sin(a)},${by - 6 * Math.cos(a)}`); at(id, 'opacity', o); }
const drawnK = id => 1 - (+$(id).getAttribute('stroke-dashoffset')) / 100;
// zemin + kutu sahnesi (kuvvet okları ile)
const ARR = (id, col) => `<g id="${id}" opacity="0"><line id="${id}l" stroke="${col}" stroke-width="5" stroke-linecap="round"/><polygon id="${id}p" fill="${col}"/><text id="${id}t" font-family="Inter" font-weight="800" font-size="16" fill="${col}"></text></g>`;
function arr(id, x1, y1, x2, y2, o, label = '', lx = 0, ly = -10) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), h = Math.min(14, L), bx = x2 - h * Math.cos(a), by = y2 - h * Math.sin(a);
  at(id, 'opacity', L < 2 ? 0 : o);
  at(id + 'l', 'x1', x1); at(id + 'l', 'y1', y1); at(id + 'l', 'x2', bx); at(id + 'l', 'y2', by);
  at(id + 'p', 'points', `${x2},${y2} ${bx - 8 * Math.sin(a)},${by + 8 * Math.cos(a)} ${bx + 8 * Math.sin(a)},${by - 8 * Math.cos(a)}`);
  const T = $(id + 't'); T.textContent = label; at(id + 't', 'x', (x1 + x2) / 2 - label.length * 4.4 + lx); at(id + 't', 'y', (y1 + y2) / 2 + ly);
}

const normW = s => s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşüâîû0-9]/g, '');
