import { addDays, fromKey, weekStart } from "./zone";

const DOW = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type Props = {
  selected: string;
  today: string;
  counts: Record<string, number>;
  onSelect: (key: string) => void;
};

/** Navigasi minggu dengan jumlah post terjadwal per hari. */
export default function Calendar({ selected, today, counts, onSelect }: Props) {
  const start = weekStart(selected);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const month = fromKey(selected).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
  const label = fromKey(selected).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <div>
      <div className="monthbar">
        <button className="btn icon-btn" aria-label="Minggu sebelumnya" onClick={() => onSelect(addDays(selected, -7))}>‹</button>
        <span>{month}</span>
        <button className="btn icon-btn" aria-label="Minggu berikutnya" onClick={() => onSelect(addDays(selected, 7))}>›</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div className="btn" style={{ flex: 1, textAlign: "center", cursor: "default" }}>{label}</div>
        <button className="btn" onClick={() => onSelect(today)} disabled={selected === today}>Hari ini</button>
      </div>
      <div className="days">
        {days.map((k, i) => (
          <button key={k} className={`day${k === today ? " today" : ""}`} aria-pressed={k === selected} onClick={() => onSelect(k)}>
            <span className="dow">{DOW[i]}</span>
            <span className="num">{fromKey(k).getUTCDate()}</span>
            <span className="n">{counts[k] || "–"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
