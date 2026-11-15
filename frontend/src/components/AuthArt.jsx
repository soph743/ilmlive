// The illustration on the sign-in screen: a fig tree growing under rings of light.
const LEAF =
  'M71 119C57 96 34 92 14 91c13-8 16-18 12-35 14 7 25 4 33-17 4 11 9 15 14 16 6-10 12-24 14-38 12 14 15 27 12 39 8 0 19-5 28-16 1 18-4 31-17 39 9 4 15 12 17 25-20-8-38-4-56 15Z'

function Leaf({ x, y, size, rotate = 0, tone = '#a9b97a' }) {
  const scale = size / 140
  return (
    <path
      d={LEAF}
      fill={tone}
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-70 -119)`}
    />
  )
}

function Fig({ x, y, rx = 30, ry = 38, rotate = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M0 ${-ry} L0 ${-ry - 22}`} stroke="#5d6b3c" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill="#7a2c3f" />
      <ellipse cx={-rx * 0.35} cy={-ry * 0.3} rx={rx * 0.25} ry={ry * 0.4} fill="#933a4f" opacity=".7" />
    </g>
  )
}

export function AuthArt() {
  return (
    <svg
      className="auth__art"
      viewBox="0 0 900 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <circle cx="480" cy="470" r="330" fill="none" stroke="#f2d373" strokeOpacity=".16" />
      <circle cx="480" cy="470" r="470" fill="none" stroke="#f2d373" strokeOpacity=".08" />

      {/* branches */}
      <g fill="none" stroke="#6a4a2e" strokeWidth="30" strokeLinecap="round">
        <path d="M455 905C448 800 462 735 450 650" />
        <path d="M455 760C395 700 320 690 235 640" strokeWidth="24" />
        <path d="M452 700C520 650 585 640 650 560" strokeWidth="24" />
        <path d="M470 830C550 800 640 805 720 755" strokeWidth="18" />
        <path d="M400 715C380 660 400 620 430 585" strokeWidth="16" />
      </g>

      {/* leaves */}
      <Leaf x={235} y={640} size={100} rotate={-35} tone="#b8c88a" />
      <Leaf x={300} y={560} size={110} rotate={-70} tone="#a0b073" />
      <Leaf x={650} y={560} size={140} rotate={40} tone="#b0c081" />
      <Leaf x={560} y={600} size={100} rotate={75} tone="#7f9559" />
      <Leaf x={430} y={600} size={85} rotate={-12} tone="#c2d194" />
      <Leaf x={720} y={755} size={105} rotate={95} tone="#98ab6c" />

      {/* figs */}
      <Fig x={252} y={700} rx={26} ry={34} rotate={8} />
      <Fig x={610} y={655} rx={30} ry={40} rotate={-6} />
      <Fig x={520} y={705} rx={24} ry={32} rotate={10} />
      <Fig x={740} y={800} rx={22} ry={30} rotate={-8} />
    </svg>
  )
}