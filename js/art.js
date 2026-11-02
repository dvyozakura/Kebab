// 絵はすべてこのファイルのSVGで生成しています（外部素材なし）。
const INK = '#1B1B2F';

export function doner(id = 'd') {
  const bands = Array.from({ length: 13 }, (_, i) => {
    const c = ['#7A3A17', '#A85A22', '#8E4719', '#C4772E'][i % 4];
    return `<rect x="-60" y="${6 + i * 12}" width="120" height="13" fill="${c}"/>`;
  }).join('');
  const ribs = Array.from({ length: 12 }, (_, i) =>
    `<path d="M${-96 + i * 20} 0 l14 170" stroke="#5B2A10" stroke-width="5" opacity=".45"/><path d="M${-88 + i * 20} 0 l14 170" stroke="#E6A24C" stroke-width="3" opacity=".5"/>`
  ).join('');
  return `<g>
    <clipPath id="${id}-clip"><path d="M-46 8 Q0 -2 46 8 L24 162 Q0 170 -24 162Z"/></clipPath>
    <rect x="-3" y="-20" width="6" height="214" rx="3" fill="#8D97A5" stroke="${INK}" stroke-width="2"/>
    <g clip-path="url(#${id}-clip)">${bands}<g class="spin">${ribs}</g></g>
    <path d="M-46 8 Q0 -2 46 8 L24 162 Q0 170 -24 162Z" fill="none" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="0" cy="182" rx="40" ry="9" fill="#AEB7C2" stroke="${INK}" stroke-width="3"/>
  </g>`;
}

function hair(l) {
  const c = l.hair;
  switch (l.style) {
    case 'cap':
      return `<path d="M-46 -24 Q0 -74 46 -24 L46 -14 L-46 -14Z" fill="${l.cap}" stroke="${INK}" stroke-width="3.5"/>
        <path d="M-46 -16 Q0 -30 66 -8 L60 2 Q0 -14 -46 -6Z" fill="${l.cap}" stroke="${INK}" stroke-width="3.5"/>`;
    case 'curly':
      return `<g fill="${c}" stroke="${INK}" stroke-width="3">
        <circle cx="-34" cy="-30" r="17"/><circle cx="-12" cy="-44" r="19"/><circle cx="14" cy="-44" r="19"/><circle cx="35" cy="-29" r="17"/><circle cx="0" cy="-34" r="20"/></g>`;
    case 'bun':
      return `<circle cx="0" cy="-60" r="17" fill="${c}" stroke="${INK}" stroke-width="3.5"/>
        <path d="M-46 -2 Q-48 -52 0 -50 Q48 -52 46 -2 Q30 -30 0 -30 Q-30 -30 -46 -2Z" fill="${c}" stroke="${INK}" stroke-width="3.5"/>`;
    case 'slick':
      return `<path d="M-45 -8 Q-50 -50 0 -50 Q50 -50 45 -8 Q40 -30 10 -34 Q-30 -36 -45 -8Z" fill="${c}" stroke="${INK}" stroke-width="3.5"/>`;
    case 'king':
      return `<path d="M-40 -28 L-46 -74 Q-20 -92 0 -78 Q20 -92 46 -74 L40 -28Z" fill="#FFF8E7" stroke="${INK}" stroke-width="3.5"/>
        <rect x="-41" y="-38" width="82" height="13" rx="3" fill="${l.cap}" stroke="${INK}" stroke-width="3"/>`;
  }
  return '';
}

function stache(type, c) {
  const m = `fill="${c}" stroke="${INK}" stroke-width="2.5"`;
  if (type === 1) return `<path d="M-26 12 Q-12 2 0 10 Q12 2 26 12 Q12 16 0 15 Q-12 16 -26 12Z" ${m}/>`;
  if (type === 2) return `<path d="M-18 11 Q0 5 18 11 Q0 13 -18 11Z" ${m}/>`;
  if (type === 3) return `<path d="M-42 16 Q-40 -2 -14 6 Q-4 8 0 12 Q4 8 14 6 Q40 -2 42 16 Q22 12 0 18 Q-22 12 -42 16Z" ${m}/>`;
  return '';
}

const FACES = {
  neutral: { lb: -8, rb: -8, tilt: 0, eye: 'dot', mouth: 'M-11 26 Q0 29 11 26' },
  happy: { lb: -12, rb: -12, tilt: -3, eye: 'arc', mouth: 'M-15 22 Q0 40 15 22Z' },
  smug: { lb: -14, rb: -7, tilt: 3, eye: 'dot', mouth: 'M-12 27 Q4 31 15 21' },
  annoyed: { lb: -6, rb: -6, tilt: 7, eye: 'half', mouth: 'M-11 30 Q0 25 11 30' },
  angry: { lb: -3, rb: -3, tilt: 16, eye: 'dot', mouth: 'M-15 33 Q0 19 15 33Z' },
  sweat: { lb: -12, rb: -12, tilt: -10, eye: 'wide', mouth: 'M-12 29 q6 -5 12 0 q6 5 12 0' },
  shock: { lb: -17, rb: -17, tilt: -6, eye: 'wide', mouth: 'M-8 24 a8 11 0 1 0 16 0 a8 11 0 1 0 -16 0Z' },
};

function eye(kind, x) {
  if (kind === 'arc') return `<path d="M${x - 8} -1 q8 -9 16 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  if (kind === 'wide') return `<circle cx="${x}" cy="-3" r="8" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="-3" r="3" fill="${INK}"/>`;
  if (kind === 'half') return `<path d="M${x - 8} -5 h16" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M${x - 5} -5 a5 5 0 0 0 10 0Z" fill="${INK}"/>`;
  return `<circle cx="${x}" cy="-3" r="5" fill="${INK}"/>`;
}

export function face(expr, l) {
  const f = FACES[expr] || FACES.neutral;
  const brow = l.style === 'king' ? '#E9E4DC' : l.hair;
  const browW = l.stache === 3 ? 7 : 5;
  const brows = `<path d="M-30 ${f.lb - f.tilt / 2} L-10 ${f.lb + f.tilt / 2}" stroke="${brow === '#E9E4DC' ? '#CFC8BD' : brow}" stroke-width="${browW}" stroke-linecap="round"/>
    <path d="M30 ${f.rb - f.tilt / 2} L10 ${f.rb + f.tilt / 2}" stroke="${brow === '#E9E4DC' ? '#CFC8BD' : brow}" stroke-width="${browW}" stroke-linecap="round"/>`;
  const glasses = l.glasses
    ? `<g fill="none" stroke="${INK}" stroke-width="3"><circle cx="-19" cy="-3" r="13"/><circle cx="19" cy="-3" r="13"/><path d="M-6 -3 h12"/></g>` : '';
  const fill = expr === 'happy' || expr === 'angry' || expr === 'shock' ? '#7A1020' : 'none';
  const mouth = `<g class="mouth"><path d="${f.mouth}" fill="${fill}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const beard = l.style === 'king'
    ? `<path d="M-30 20 Q-28 66 0 68 Q28 66 30 20 Q14 40 0 40 Q-14 40 -30 20Z" fill="#E9E4DC" stroke="${INK}" stroke-width="3"/>` : '';
  const extra = expr === 'sweat'
    ? `<path d="M48 -28 q10 14 0 20 q-10 -6 0 -20Z" fill="#6FD3E8" stroke="${INK}" stroke-width="2.5"/><path d="M-52 -14 q8 11 0 16 q-8 -5 0 -16Z" fill="#6FD3E8" stroke="${INK}" stroke-width="2.5"/>`
    : expr === 'angry' ? `<path d="M38 -44 l14 -6 m-10 14 l14 2 m-22 -22 l2 -12" stroke="#C8102E" stroke-width="4.5" stroke-linecap="round"/>` : '';
  return `${beard}${brows}${eye(f.eye, -19)}${eye(f.eye, 19)}${glasses}${mouth}${stache(l.stache, l.style === 'king' ? '#E9E4DC' : l.hair)}${extra}`;
}

export function keeper(l) {
  return `<g transform="translate(205 0)">
    <path d="M-74 232 Q-72 172 -24 168 L24 168 Q72 172 74 232Z" fill="#F4F0E6" stroke="${INK}" stroke-width="3.5"/>
    <path d="M-34 232 L-30 184 Q0 196 30 184 L34 232Z" fill="${l.apron}" stroke="${INK}" stroke-width="3.5"/>
    <rect x="-16" y="150" width="32" height="26" fill="${l.skin}" stroke="${INK}" stroke-width="3.5"/>
    <g transform="translate(0 116)">
      <circle cx="-46" cy="2" r="9" fill="${l.skin}" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="46" cy="2" r="9" fill="${l.skin}" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="0" cy="2" rx="46" ry="50" fill="${l.skin}" stroke="${INK}" stroke-width="3.5"/>
      <g id="face"></g>
      ${hair(l)}
    </g>
  </g>`;
}

export function scene(def) {
  const stripes = Array.from({ length: 10 }, (_, i) => {
    const x = i * 40;
    const c = i % 2 ? '#FFF8E7' : def.color;
    return `<path d="M${x} 0 h40 v42 q-20 22 -40 0Z" fill="${c}" stroke="${INK}" stroke-width="3"/>`;
  }).join('');
  const bulbs = [30, 118, 300, 372].map((x) => `<circle cx="${x}" cy="70" r="5.5" fill="#FFE27A" stroke="${INK}" stroke-width="2"/>`).join('');
  return `<svg viewBox="0 0 400 300" role="img" aria-label="${def.stall}の屋台" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#0B6E78"/>
    <rect width="400" height="300" fill="url(#tile)"/>
    <defs><pattern id="tile" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 4 L36 20 L20 36 L4 20Z" fill="none" stroke="#2BA6A6" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="#FFC21A"/>
    </pattern></defs>
    <path d="M0 66 Q100 80 200 68 T400 68" fill="none" stroke="${INK}" stroke-width="2"/>${bulbs}
    <rect x="12" y="88" width="38" height="138" rx="4" fill="#E2401B" stroke="${INK}" stroke-width="3"/>
    <path d="M22 100 v112 M31 100 v112 M40 100 v112" stroke="#FFC21A" stroke-width="3" opacity=".8"/>
    <g transform="translate(88 58)">${doner('stall')}</g>
    ${keeper(def.look)}
    <path id="string" d="M312 60 L346 88 L380 60" fill="none" stroke="${INK}" stroke-width="2"/>
    <g id="sign" transform="translate(294 86) rotate(2)"></g>
    <rect x="0" y="232" width="400" height="68" fill="${def.color}"/>
    <rect x="0" y="232" width="400" height="10" fill="#FFF8E7" stroke="${INK}" stroke-width="3"/>
    <g>${stripes}</g>
    <rect x="98" y="8" width="204" height="30" rx="4" fill="${INK}"/>
    <text x="200" y="30" text-anchor="middle" fill="#FFC21A" font-family="Dela Gothic One, sans-serif" font-size="17">${def.stall}</text>
  </svg>`;
}

const yen = (n) => '¥' + n.toLocaleString('ja-JP');

export function signBoard(prices, probe) {
  const old = prices.slice(0, -1).slice(-3);
  const now = prices[prices.length - 1];
  const rows = old.map((p, i) => {
    const y = 26 + i * 21;
    const fresh = i === old.length - 1 ? 'class="strike"' : '';
    return `<text x="52" y="${y}" text-anchor="middle" font-size="17" fill="#4B3A28">${yen(p)}</text>
      <path ${fresh} pathLength="1" d="M16 ${y - 5} q18 -5 38 0 t34 -2" fill="none" stroke="#C8102E" stroke-width="3" stroke-linecap="round"/>`;
  }).join('');
  const nowY = 26 + old.length * 21 + 16;
  const hint = probe ? `<text x="52" y="136" text-anchor="middle" font-size="11.5" fill="#123A4A">底値 ${yen(probe[0])}</text><text x="52" y="150" text-anchor="middle" font-size="11.5" fill="#123A4A">〜${yen(probe[1])}？</text>` : '';
  return `<path d="M2 3 L102 0 L104 156 L0 158Z" fill="#D2A566" stroke="${INK}" stroke-width="3"/>
    <g font-family="Yusei Magic, sans-serif">${rows}
    <text x="52" y="${nowY}" text-anchor="middle" font-size="28" fill="${INK}" font-weight="700">${yen(now)}</text>${hint}</g>`;
}

export function kebab(noNegi = false) {
  const onion = noNegi ? '' : `<path d="M34 26 q9 -13 18 0 M62 22 q9 -13 18 0 M46 16 q8 -10 16 0" fill="none" stroke="#E9F2D0" stroke-width="5" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 116 150" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 44 Q6 12 34 16 Q58 -4 84 16 Q112 14 104 44Z" fill="#6DBB3C" stroke="${INK}" stroke-width="3"/>
    <path d="M20 44 Q24 24 44 30 Q60 18 76 30 Q94 26 96 44Z" fill="#8E4719" stroke="${INK}" stroke-width="3"/>
    <path d="M34 42 q10 -14 20 -2 q12 -12 22 2" fill="none" stroke="#B0186E" stroke-width="6" stroke-linecap="round"/>${onion}
    <path d="M10 42 Q58 54 106 42 L72 142 Q58 150 44 142Z" fill="#F0C982" stroke="${INK}" stroke-width="3.5"/>
    <path d="M26 88 L90 88 L72 142 Q58 150 44 142Z" fill="#FFF8E7" stroke="${INK}" stroke-width="3"/>
    <path d="M36 104 h44 M43 120 h30" stroke="#C8102E" stroke-width="5"/>
  </svg>`;
}
