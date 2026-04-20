// 継続日数に応じて木が育つビジュアルコンポーネント。
// データとの接続は後フェーズで行う。今はpropsで制御。

type Season = "spring" | "summer" | "autumn" | "winter";

interface Palette {
  skyTop: string;
  skyBot: string;
  ground: string;
  groundDark: string;
  trunk: string;
  leaf1: string;
  leaf2: string;
  leaf3: string;
}

const PALETTES: Record<Season, Palette> = {
  spring: {
    skyTop: "#a8d8f0",
    skyBot: "#fce8f0",
    ground: "#7dbf6e",
    groundDark: "#5a9950",
    trunk: "#7b5230",
    leaf1: "#f4a7bb",
    leaf2: "#fcd5e0",
    leaf3: "#e8799a",
  },
  summer: {
    skyTop: "#2980b9",
    skyBot: "#7ec8e3",
    ground: "#4caf50",
    groundDark: "#2e7d32",
    trunk: "#5d4037",
    leaf1: "#388e3c",
    leaf2: "#66bb6a",
    leaf3: "#2e7d32",
  },
  autumn: {
    skyTop: "#c0622a",
    skyBot: "#f5c98a",
    ground: "#8d6e63",
    groundDark: "#5d4037",
    trunk: "#4e342e",
    leaf1: "#e65100",
    leaf2: "#ffa000",
    leaf3: "#d84315",
  },
  winter: {
    skyTop: "#546e7a",
    skyBot: "#b0c4d8",
    ground: "#cfd8e0",
    groundDark: "#90a4ae",
    trunk: "#37474f",
    leaf1: "#cfd8dc",
    leaf2: "#eceff1",
    leaf3: "#b0bec5",
  },
};

function getSeason(): Season {
  const m = new Date().getMonth(); // 0=Jan
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

// 再現可能な疑似乱数（Math.randomはレンダーごとに値が変わるのでNG）
function pr(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// 継続日数 → 成長度 0~1（指数的に成長し、時間が経つほど緩やかになる）
function toGrowth(streakDays: number): number {
  return Math.min(1, 1 - Math.exp(-streakDays / 25));
}

const W = 800;
const H = 480;
const CX = 400; // 木の中心X
const GY = 390; // 地面Y

// 地面より上に固定される草の位置（描画のたびに変わらないよう外で定義）
const GRASS = Array.from({ length: 22 }, (_, i) => ({
  x: 10 + i * 37,
  h: 7 + pr(i * 3) * 11,
  spread: 4 + pr(i * 3 + 1) * 5,
}));

interface Props {
  streakDays: number;
}

export function GardenView({ streakDays }: Props) {
  const season = getSeason();
  const pal = PALETTES[season];
  const g = toGrowth(streakDays);

  // 幹のサイズ（成長度で変化）
  const trunkH = 15 + g * 205;
  const trunkW = 3 + g * 15; // 根元の半幅
  const trunkTopY = GY - trunkH;

  // 幹パス（テーパーが自然に見えるようベジェ曲線で描く）
  const trunkPath = [
    `M ${CX - trunkW} ${GY}`,
    `C ${CX - trunkW * 0.9} ${GY - trunkH * 0.35}`,
    `  ${CX - trunkW * 0.45} ${GY - trunkH * 0.75}`,
    `  ${CX - trunkW * 0.15} ${trunkTopY}`,
    `L ${CX + trunkW * 0.15} ${trunkTopY}`,
    `C ${CX + trunkW * 0.45} ${GY - trunkH * 0.75}`,
    `  ${CX + trunkW * 0.9} ${GY - trunkH * 0.35}`,
    `  ${CX + trunkW} ${GY}`,
    `Z`,
  ].join(" ");

  // 枝（成長度の閾値を超えると順番に現れる）
  const branches: Array<{
    from: [number, number];
    cp: [number, number];
    to: [number, number];
    w: number;
    minG: number;
  }> = [
    {
      from: [CX + trunkW * 0.5, trunkTopY + trunkH * 0.08],
      cp: [CX + 85, trunkTopY + 18],
      to: [CX + 135, trunkTopY - 25],
      w: 4 + g * 3,
      minG: 0.22,
    },
    {
      from: [CX - trunkW * 0.5, trunkTopY + trunkH * 0.08],
      cp: [CX - 90, trunkTopY + 12],
      to: [CX - 145, trunkTopY - 18],
      w: 4 + g * 3,
      minG: 0.22,
    },
    {
      from: [CX + trunkW * 0.3, trunkTopY + trunkH * 0.03],
      cp: [CX + 62, trunkTopY - 22],
      to: [CX + 105, trunkTopY - 72],
      w: 3 + g * 2,
      minG: 0.38,
    },
    {
      from: [CX - trunkW * 0.3, trunkTopY + trunkH * 0.03],
      cp: [CX - 68, trunkTopY - 18],
      to: [CX - 110, trunkTopY - 68],
      w: 3 + g * 2,
      minG: 0.38,
    },
    {
      from: [CX, trunkTopY],
      cp: [CX + 12, trunkTopY - 52],
      to: [CX + 8, trunkTopY - 100],
      w: 2.5 + g,
      minG: 0.44,
    },
    {
      from: [CX + trunkW * 0.4, trunkTopY + trunkH * 0.12],
      cp: [CX + 112, trunkTopY + 42],
      to: [CX + 168, trunkTopY + 38],
      w: 2 + g,
      minG: 0.6,
    },
    {
      from: [CX - trunkW * 0.4, trunkTopY + trunkH * 0.12],
      cp: [CX - 118, trunkTopY + 38],
      to: [CX - 172, trunkTopY + 32],
      w: 2 + g,
      minG: 0.6,
    },
  ];

  // 葉のかたまり（楕円を重ねて有機的な樹冠を作る）
  const leafClusters: Array<{
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    color: string;
    minG: number;
  }> = [
    { cx: CX, cy: trunkTopY - 52, rx: 72, ry: 62, color: pal.leaf2, minG: 0.12 },
    { cx: CX + 128, cy: trunkTopY - 32, rx: 65, ry: 57, color: pal.leaf1, minG: 0.22 },
    { cx: CX - 135, cy: trunkTopY - 28, rx: 68, ry: 59, color: pal.leaf3, minG: 0.22 },
    { cx: CX + 98, cy: trunkTopY - 82, rx: 57, ry: 50, color: pal.leaf2, minG: 0.38 },
    { cx: CX - 103, cy: trunkTopY - 78, rx: 60, ry: 53, color: pal.leaf1, minG: 0.38 },
    { cx: CX + 18, cy: trunkTopY - 108, rx: 54, ry: 47, color: pal.leaf3, minG: 0.44 },
    { cx: CX + 58, cy: trunkTopY - 52, rx: 44, ry: 39, color: pal.leaf1, minG: 0.52 },
    { cx: CX - 60, cy: trunkTopY - 56, rx: 46, ry: 41, color: pal.leaf2, minG: 0.52 },
    { cx: CX + 162, cy: trunkTopY + 30, rx: 50, ry: 44, color: pal.leaf3, minG: 0.62 },
    { cx: CX - 168, cy: trunkTopY + 26, rx: 52, ry: 45, color: pal.leaf1, minG: 0.62 },
    { cx: CX - 22, cy: trunkTopY - 88, rx: 42, ry: 36, color: pal.leaf2, minG: 0.7 },
    { cx: CX + 142, cy: trunkTopY - 52, rx: 38, ry: 33, color: pal.leaf3, minG: 0.75 },
    { cx: CX - 148, cy: trunkTopY - 48, rx: 40, ry: 35, color: pal.leaf1, minG: 0.75 },
    { cx: CX + 5, cy: trunkTopY - 130, rx: 36, ry: 30, color: pal.leaf2, minG: 0.82 },
  ];

  const groundPath = `M 0 ${GY} Q 400 ${GY - 14} 800 ${GY + 6} L 800 ${H} L 0 ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      aria-label="学習の庭"
    >
      <defs>
        <linearGradient id="gv-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.skyTop} />
          <stop offset="100%" stopColor={pal.skyBot} />
        </linearGradient>
        <linearGradient id="gv-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={pal.trunk} stopOpacity="0.55" />
          <stop offset="38%" stopColor={pal.trunk} />
          <stop offset="100%" stopColor={pal.trunk} stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="gv-ground" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor={pal.ground} />
          <stop offset="100%" stopColor={pal.groundDark} />
        </radialGradient>
      </defs>

      {/* 空 */}
      <rect width={W} height={H} fill="url(#gv-sky)" />

      {/* 遠景の丘 */}
      <ellipse cx="130" cy={GY + 28} rx="220" ry="68" fill={pal.groundDark} opacity="0.18" />
      <ellipse cx="675" cy={GY + 22} rx="200" ry="62" fill={pal.groundDark} opacity="0.15" />

      {/* 地面 */}
      <path d={groundPath} fill="url(#gv-ground)" />

      {/* 草 */}
      {GRASS.map((gr, i) => (
        <g key={i} opacity="0.65">
          <line
            x1={gr.x - gr.spread} y1={GY + 8}
            x2={gr.x - gr.spread * 1.6} y2={GY + 8 - gr.h}
            stroke={pal.groundDark} strokeWidth="1.5" strokeLinecap="round"
          />
          <line
            x1={gr.x} y1={GY + 5}
            x2={gr.x} y2={GY + 5 - gr.h - 4}
            stroke={pal.ground} strokeWidth="1.5" strokeLinecap="round"
          />
          <line
            x1={gr.x + gr.spread} y1={GY + 8}
            x2={gr.x + gr.spread * 1.6} y2={GY + 8 - gr.h}
            stroke={pal.groundDark} strokeWidth="1.5" strokeLinecap="round"
          />
        </g>
      ))}

      {/* 芽（初期のみ） */}
      {g < 0.08 && (
        <g opacity={Math.max(0, 1 - g * 15)}>
          <line x1={CX - 5} y1={GY} x2={CX - 8} y2={GY - 14} stroke={pal.leaf2} strokeWidth="2" strokeLinecap="round" />
          <line x1={CX} y1={GY} x2={CX} y2={GY - 20} stroke={pal.leaf1} strokeWidth="2.5" strokeLinecap="round" />
          <line x1={CX + 5} y1={GY} x2={CX + 8} y2={GY - 14} stroke={pal.leaf2} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* 幹 */}
      {g >= 0.05 && <path d={trunkPath} fill="url(#gv-trunk)" />}

      {/* 枝 */}
      {branches.map((b, i) => {
        if (g < b.minG) return null;
        const opacity = Math.min(1, (g - b.minG) / 0.14);
        return (
          <path
            key={i}
            d={`M ${b.from[0]} ${b.from[1]} Q ${b.cp[0]} ${b.cp[1]} ${b.to[0]} ${b.to[1]}`}
            stroke={pal.trunk}
            strokeWidth={b.w * opacity}
            fill="none"
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}

      {/* 葉のかたまり */}
      {leafClusters.map((lc, i) => {
        if (g < lc.minG) return null;
        const fadeIn = Math.min(1, (g - lc.minG) / 0.11);
        return (
          <ellipse
            key={i}
            cx={lc.cx}
            cy={lc.cy}
            rx={lc.rx * fadeIn}
            ry={lc.ry * fadeIn}
            fill={lc.color}
            opacity={0.78 * fadeIn}
          />
        );
      })}

      {/* 春：地面の花 */}
      {season === "spring" && g > 0.1 &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const fx = CX - 220 + pr(i * 17) * 440;
          const fy = GY + 4 + pr(i * 17 + 1) * 12;
          const opacity = Math.min(1, (g - 0.1) / 0.15);
          return (
            <g key={i} opacity={opacity * 0.9}>
              <circle cx={fx} cy={fy} r="5.5" fill={pal.leaf1} />
              <circle cx={fx} cy={fy} r="2.5" fill="white" opacity="0.85" />
            </g>
          );
        })}

      {/* 春：花びら（空中） */}
      {season === "spring" && g > 0.25 &&
        [0, 1, 2, 3, 4, 5, 6].map((i) => {
          const px = 120 + pr(i * 19) * 560;
          const py = 80 + pr(i * 19 + 1) * 280;
          const rot = pr(i * 19 + 2) * 60 - 30;
          return (
            <ellipse
              key={i}
              cx={px} cy={py}
              rx="5" ry="3"
              fill={pal.leaf1}
              opacity={0.45 + pr(i * 19 + 3) * 0.35}
              transform={`rotate(${rot} ${px} ${py})`}
            />
          );
        })}

      {/* 秋：落ち葉 */}
      {season === "autumn" && g > 0.25 &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const lx = 100 + pr(i * 23) * 600;
          const ly = 150 + pr(i * 23 + 1) * 230;
          const rot = pr(i * 23 + 2) * 90 - 45;
          const colors = [pal.leaf1, pal.leaf2, pal.leaf3];
          return (
            <ellipse
              key={i}
              cx={lx} cy={ly}
              rx="7" ry="4.5"
              fill={colors[i % 3]}
              opacity={0.5 + pr(i * 23 + 3) * 0.35}
              transform={`rotate(${rot} ${lx} ${ly})`}
            />
          );
        })}

      {/* 冬：雪 */}
      {season === "winter" &&
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <circle
            key={i}
            cx={80 + pr(i * 29) * 640}
            cy={60 + pr(i * 29 + 1) * 320}
            r={1.5 + pr(i * 29 + 2) * 3}
            fill="white"
            opacity={0.4 + pr(i * 29 + 3) * 0.45}
          />
        ))}
    </svg>
  );
}