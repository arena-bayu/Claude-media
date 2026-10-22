import type { AgentState, AgentId } from "@/lib/types";

const PEOPLE: { id: AgentId; name: string; office: string; color: string; x: number; y: number }[] = [
  { id: "lucy", name: "Lucy", office: "CEO", color: "#e7a9c4", x: 238, y: 150 },
  { id: "nico", name: "Nico", office: "CMO", color: "#f2c94c", x: 118, y: 176 },
  { id: "ardi", name: "Ardi", office: "COO", color: "#7cc4f2", x: 300, y: 112 },
];

/** Ruang kantor isometric sederhana; agen yang sedang bekerja diberi gelembung tugas. */
export default function Office({ agents }: { agents: AgentState[] }) {
  const state = (id: AgentId) => agents.find((a) => a.id === id);
  return (
    <div>
      <svg viewBox="0 0 400 260" role="img" aria-label="Kantor virtual" style={{ width: "100%", display: "block" }}>
        {/* lantai dan dinding */}
        <polygon points="200,60 380,150 200,240 20,150" fill="#d9d4cb" />
        <polygon points="20,150 200,60 200,10 20,100" fill="#2b3530" />
        <polygon points="200,60 380,150 380,100 200,10" fill="#222b27" />
        {/* jendela kota */}
        <polygon points="60,112 170,57 170,25 60,80" fill="#6d8fa8" opacity="0.85" />
        <polygon points="90,103 100,98 100,66 90,71" fill="#3d5568" />
        <polygon points="125,86 138,79 138,40 125,47" fill="#3d5568" />
        {/* rak & tanaman */}
        <polygon points="250,70 300,95 300,75 250,50" fill="#3f4a44" />
        <circle cx="345" cy="140" r="12" fill="#3f8f5a" />
        <circle cx="45" cy="160" r="10" fill="#3f8f5a" />
        {/* meja */}
        {[{ x: 118, y: 176 }, { x: 238, y: 150 }, { x: 300, y: 112 }].map((d, i) => (
          <g key={i} transform={`translate(${d.x - 28}, ${d.y - 2})`}>
            <polygon points="0,12 28,0 56,12 28,24" fill="#2d2d2d" />
            <polygon points="0,12 28,24 28,30 0,18" fill="#1d1d1d" />
            <polygon points="28,24 56,12 56,18 28,30" fill="#151515" />
            <rect x="22" y="-10" width="14" height="10" fill="#0f1714" stroke="#5fd39a" strokeWidth="0.6" />
          </g>
        ))}
        {/* agen */}
        {PEOPLE.map((p) => {
          const s = state(p.id);
          return (
            <g key={p.id}>
              <ellipse cx={p.x - 14} cy={p.y + 22} rx="10" ry="4" fill="rgba(0,0,0,0.25)" />
              <circle cx={p.x - 14} cy={p.y + 4} r="10" fill={p.color} stroke="#0b100e" strokeWidth="1.5" />
              <text x={p.x - 14} y={p.y + 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0b100e">{p.name[0]}</text>
              <rect x={p.x - 34} y={p.y + 30} width="40" height="14" rx="7" fill="#0b100e" opacity="0.8" />
              <text x={p.x - 14} y={p.y + 40} textAnchor="middle" fontSize="8.5" fill="#e8eeeb">{p.name}</text>
              {s?.busy && (
                <g>
                  <rect x={p.x - 26} y={p.y - 26} width="24" height="14" rx="7" fill="#5fd39a" />
                  <text x={p.x - 14} y={p.y - 16} textAnchor="middle" fontSize="9" fill="#062014">•••</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="agents">
        {PEOPLE.map((p) => {
          const s = state(p.id);
          return (
            <div className="agent" key={p.id}>
              <div className="name"><span className={`dot${s?.busy ? " on" : ""}`} />{p.name}</div>
              <div className="eyebrow">{p.office} Office</div>
              <div className="task" title={s?.task}>{s?.busy ? s.task : "Menunggu tugas"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
