// ゲームの中身（屋台・カード・台詞）。バランス調整はだいたいここだけで済みます。

export const WALLET = 4000; // 5人分の予算

// 札の効きやすさ: aff 1=弱点 / 0=ふつう / -1=効かない
export const CHANCE = { 1: 0.95, 0: 0.6, '-1': 0.15 };

export const CARDS = {
  flatter: {
    name: '褒めちぎる', desc: '当たると機嫌回復＋少し値下げ',
    say: 'こんないい匂い、人生で初めてです！',
  },
  rival: {
    name: '隣は安かった', desc: '当たると大きく値下げ／外すと怒る',
    say: 'そういえば、隣の店はもっと安かったなあ……',
  },
  bulk: {
    name: '常連になる宣言', desc: '当たると値下げ＋機嫌少し回復',
    say: '毎週来ます。友達も連れてきます。たぶん。',
  },
  tears: {
    name: '泣き落とし', desc: '当たると値下げ',
    say: '公園で友達が空腹で待ってるんです……！',
  },
  empty: {
    name: '財布を裏返す', desc: '予算が少ないほど効く',
    say: '見てください、この財布。もう風しか入ってません。',
  },
  chat: {
    name: '世間話', desc: '必ず機嫌回復。弱点のヒントも聞ける',
    say: '最近どうですか、景気は。',
  },
  probe: {
    name: '原価を探る', desc: '底値のだいたいの範囲がわかる',
    say: '今、お肉の仕入れって大変じゃないですか？',
  },
  negi: {
    name: 'ネギ抜きで', desc: '必ず¥50下がる。友達は少し悲しむ',
    say: 'ネギ抜きなら、そのぶん安くなりますよね？',
  },
};
export const SAFE_CARDS = ['chat', 'probe', 'negi'];

export const FRIENDS = ['ハルト', 'サキ', 'ケン', 'ミオ', '自分'];

export const SHOPS = [
  {
    id: 'minato', name: 'ミナト', title: 'バイト初日の大学生', stall: '駅前チキンケバブ',
    item: 'チキンケバブ', list: 800, floor: 0.56, temper: 0.7, give: 0.5, want: 0.95, bluff: 0,
    aff: { flatter: 1, rival: 1, bulk: 0, tears: 1, empty: 0 },
    look: { skin: '#F2C39B', hair: '#2B2233', style: 'cap', stache: 0, glasses: 0, apron: '#FFC21A', cap: '#C8102E' },
    color: '#C8102E',
    lines: {
      greet: 'い、いらっしゃいませ！今日バイト初日で……店長、夜まで戻らないんです。',
      insult: 'えっ、そ、それはさすがに店長に怒られます！', low: 'うーん、まだかなり安いです……たぶん。',
      near: 'あ、だんだん現実的な金額に……', close: 'うっ……それ、もうちょっとで押し切られそうです……',
      lowered: 'さっきより下がってませんか！？', warn: 'すみません、ちょっと泣きそうです……',
      tight: 'わ、わかりました！店長には内緒ですよ……！', easy: 'はいっ！ありがとうございます！（あっさり）',
      kick: 'もう無理です！店長ーーー！！', call: '待ってください！まだ下げられます、たぶん！',
      back: 'あ、戻ってきた……。あの、さっき値段を上げろって店長から電話が……',
      hit: 'そ、そうですよね……じゃあ少しだけ……', miss: 'え、えっと……それは困ります……',
      hints: ['店長が「お客さんに押されたら負け」って言ってました。僕、押されるとすぐ負けます。', '褒められるのも、隣の店の話も、泣かれるのも全部苦手です。'],
    },
  },
  {
    id: 'hasan', name: 'ハサン', title: 'しゃべり出したら止まらない店主', stall: 'ハサンのビーフケバブ',
    item: 'ビーフケバブ', list: 900, floor: 0.6, temper: 0.9, give: 0.4, want: 0.7, bluff: 0,
    aff: { flatter: 1, rival: -1, bulk: 0, tears: 0, empty: 0 },
    look: { skin: '#D9A06F', hair: '#1E1A1F', style: 'curly', stache: 1, glasses: 0, apron: '#FFF8E7', cap: null },
    color: '#0E7C86',
    lines: {
      greet: 'よく来たね！うちの肉の話、30分聞く？値段の話は、そのあとでもいいよ。',
      insult: 'はっはっは！いい冗談だ。で、本当はいくら？', low: 'その値段だと、肉じゃなくてパンの端だね。',
      near: 'お、話が通じてきたね。', close: 'むむっ……君、なかなかやるじゃないか……',
      lowered: '話が逆戻りしてるよ！', warn: 'そろそろ冗談の時間はおしまいにしようか。',
      tight: '負けた！その度胸も一緒に包んであげよう！', easy: 'はい毎度！君はいいお客さんだねえ！',
      kick: '今日の話はここまで！また来世でおいで！', call: 'おーい！話の途中だよ、戻っておいで！',
      back: 'お帰り。話の続き、ちょっと値上がりしてるけどね。',
      hit: 'わかるかい！？うちの肉をわかってくれるかい！', miss: '隣？ああ、あれは僕の弟の店だよ。同じ値段さ。',
      hints: ['20年この肉を焼いてる。褒められるのが何よりの燃料なんだ。', '隣の店？ああ、弟がやってる。値段の話はぜんぶ筒抜けだよ。'],
    },
  },
  {
    id: 'yoshiko', name: 'ヨシコ', title: '商店街の肝っ玉おばちゃん', stall: 'よしこのラムケバブ',
    item: 'ラムケバブ', list: 1000, floor: 0.62, temper: 1, give: 0.35, want: 0.6, bluff: 0,
    aff: { flatter: -1, rival: 0, bulk: 0, tears: 1, empty: 1 },
    look: { skin: '#EDB98A', hair: '#7A6A73', style: 'bun', stache: 0, glasses: 1, apron: '#B0186E', cap: null },
    color: '#B0186E',
    lines: {
      greet: 'あら、細いわねえ。ちゃんと食べてるの？で、何本？',
      insult: 'あんた、うちの孫でもそんな値段言わないよ！', low: 'それじゃ肉代にもなりゃしないよ。',
      near: 'ふうん、少しはわかってきたじゃない。', close: 'あらやだ、痛いとこ突くわねえ……',
      lowered: '今なんて言った？耳が遠くなったかしら？', warn: 'あたしの顔も、もうそう何度もないよ。',
      tight: 'しょうがないねえ！ちゃんと食べるんだよ！', easy: 'はいよ！持ってきな！',
      kick: 'もう帰んな！二度と来るんじゃないよ！', call: 'ちょっと待ちな！まだ話は終わってないよ！',
      back: '戻ってくるなら最初から帰らないの。値段、上げといたからね。',
      hit: 'もう、そんな顔されたらねえ……', miss: '口がうまいねえ。そういう子が一番あぶないのよ。',
      hints: ['おべんちゃらはダメよ。死んだ旦那で慣れてるからね。', '腹ペコの子と、お金のない子には、どうにも弱くてねえ。'],
    },
  },
  {
    id: 'kemal', name: 'ケマル', title: '電卓が手放せない元銀行員', stall: 'ケマル・ケバブ資産運用',
    item: 'ミックスケバブ', list: 1100, floor: 0.64, temper: 1.15, give: 0.3, want: 0.5, bluff: 0,
    aff: { flatter: -1, rival: 1, bulk: 1, tears: -1, empty: 0 },
    look: { skin: '#C98E5F', hair: '#3A3A44', style: 'slick', stache: 2, glasses: 1, apron: '#123A4A', cap: null },
    color: '#123A4A',
    lines: {
      greet: 'いらっしゃいませ。当店の粗利率についてご説明しましょうか。',
      insult: 'その価格ですと、当店は破綻します。', low: '採算ラインを大きく下回っています。',
      near: 'ふむ。検討の余地はあります。', close: '……損益分岐点の近くですね。計算し直します。',
      lowered: '提示額が下方修正されました。信用を失いましたよ。', warn: 'これ以上は機会損失と判断します。',
      tight: '……承認します。利益率は見なかったことにします。', easy: 'ご成約ありがとうございます。（電卓を叩く音）',
      kick: '与信枠はゼロです。お引き取りください。', call: 'お待ちください。顧客生涯価値を再計算しました。',
      back: '再来店ありがとうございます。価格は改定されました。',
      hit: '継続率と競合価格は重要な指標です。応じましょう。', miss: '感情は帳簿に載りません。',
      hints: ['数字の話なら聞きましょう。競合価格と、継続購入の見込みです。', '涙と賛辞は計上できません。'],
    },
  },
  {
    id: 'mustafa', name: 'ムスタファ', title: '屋台通りの生ける伝説', stall: 'ドネル王ムスタファ',
    item: '王様盛りケバブ', list: 1300, floor: 0.66, temper: 1.2, give: 0.25, want: 0.8, bluff: 1,
    aff: { flatter: -1, rival: -1, bulk: -1, tears: -1, empty: 0 },
    look: { skin: '#B97F52', hair: '#E9E4DC', style: 'king', stache: 3, glasses: 0, apron: '#FFC21A', cap: '#FFC21A' },
    color: '#3A1B5E',
    lines: {
      greet: '40年、この肉を回してきた。お前はいくらで来た？',
      insult: '笑わせるな。', low: '話にならん。', near: '……まだ遠い。', close: 'ほう。',
      lowered: '男が一度出した値段を下げるか。', warn: 'わしの火は、そう長く待たんぞ。',
      tight: '……ふっ。久しぶりに、いい客を見た。', easy: 'うむ。まいどあり。（ニヤリ）',
      kick: '帰れ。肉が冷める。', call: '……待て、小僧。その背中、気に入った。',
      back: '戻ったか。背中の値段は、前より高いぞ。',
      hit: '……まあ、悪くない。', miss: 'その手は、40年前に見飽きた。',
      hints: ['口は聞き飽きた。わしの顔色も信じるな。わしの顔は商売道具だ。', 'わしを動かしたければ、背中を見せてみろ。本気で帰る奴の背中をな。'],
    },
  },
];

// 反応の段階。名前は吹き出しの札にそのまま出ます。
export const TIERS = {
  insult: { label: 'かなり遠い', dmg: 36, step: 0.3, face: 'angry' },
  low: { label: '遠い', dmg: 21, step: 0.7, face: 'annoyed' },
  near: { label: '近い', dmg: 12, step: 1, face: 'neutral' },
  close: { label: 'あと少し', dmg: 7, step: 1.3, face: 'sweat' },
};
export const TIER_ORDER = ['close', 'near', 'low', 'insult'];

export const RANKS = [
  { min: 0.42, slug: 'nightmare', name: '商店街の悪夢', note: '翌日、屋台通りに君の似顔絵が貼られた。' },
  { min: 0.37, slug: 'artisan', name: '値切り職人', note: 'ケマルの電卓に、君の名前が登録された。' },
  { min: 0.32, slug: 'regular', name: '腕利きの常連', note: 'ヨシコにおかずを1品もらえる顔になった。' },
  { min: 0.26, slug: 'customer', name: 'ふつうのお客さん', note: 'いい買い物だった。たぶん。' },
  { min: 0, slug: 'tourist', name: '観光客価格', note: 'ハサンが弟に君の話をしている。' },
];
