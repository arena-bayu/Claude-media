"use client";
import { useCallback, useEffect, useState } from "react";
import type { Platform, Post } from "@/lib/types";

type Props = { agents: { id: string; name: string; office: string }[] };
type Tab = "semua" | "review" | "terjadwal";
type Log = { at: string; agent: string; message: string };

const btn = { padding: "6px 12px", borderRadius: 6, border: "1px solid #2c3a33", background: "#16201b", color: "inherit", cursor: "pointer" } as const;
const on = (active: boolean) => ({ ...btn, borderColor: active ? "#7ee0a8" : "#2c3a33" });
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function Dashboard({ agents }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tab, setTab] = useState<Tab>("semua");
  const [platform, setPlatform] = useState<Platform>("threads");
  const [day, setDay] = useState<string | null>(null);
  const [niche, setNiche] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setPosts(await (await fetch("/api/posts")).json());
    setLogs(await (await fetch("/api/log")).json());
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  const forPlatform = posts.filter((p) => p.platform === platform);
  const visible = forPlatform
    .filter((p) => tab === "semua" || (tab === "review" ? p.status === "review" : p.status === "scheduled"))
    .filter((p) => !day || (p.scheduledAt && dayKey(new Date(p.scheduledAt)) === day));

  async function act(id: string, action: string, scheduledAt?: string) {
    const res = await fetch(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify({ action, scheduledAt }) });
    if (!res.ok) alert((await res.json()).error);
    load();
  }

  async function runOffice(count: number) {
    setBusy(true);
    await fetch("/api/office", { method: "POST", body: JSON.stringify({ niche: niche || "Umum", count, platform }) });
    setBusy(false); load();
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1>AI Media Office</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {agents.map((a) => <div key={a.id} style={{ ...btn, cursor: "default" }}><strong>{a.name}</strong> · {a.office}</div>)}
      </div>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Niche media (mis. finansial anak muda)" style={{ ...btn, flex: 1 }} />
        <button style={btn} disabled={busy} onClick={() => runOffice(3)}>{busy ? "Bekerja..." : "Jalankan kantor"}</button>
        <button style={btn} disabled={busy} onClick={() => runOffice(0)}>Ardi: jadwalkan</button>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
        {week.map((d) => {
          const k = dayKey(d);
          const n = forPlatform.filter((p) => p.scheduledAt && dayKey(new Date(p.scheduledAt)) === k).length;
          return (
            <button key={k} style={{ ...on(day === k), minWidth: 56 }} onClick={() => setDay(day === k ? null : k)}>
              <div style={{ fontSize: 11 }}>{DAYS[d.getDay()]}</div><strong>{d.getDate()}</strong><div style={{ fontSize: 11 }}>{n || "–"}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, margin: "16px 0 8px" }}>
        {(["instagram", "threads"] as Platform[]).map((p) => <button key={p} style={on(p === platform)} onClick={() => setPlatform(p)}>{p}</button>)}
        <span style={{ flex: 1 }} />
        {(["semua", "review", "terjadwal"] as Tab[]).map((t) => <button key={t} style={on(t === tab)} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {visible.length === 0 && <p style={{ opacity: 0.6 }}>Belum ada konten.</p>}
      {visible.map((p) => (
        <article key={p.id} style={{ border: "1px solid #2c3a33", borderRadius: 8, padding: 12, margin: "12px 0" }}>
          <small>{p.status} · oleh {p.createdBy}{p.scheduledAt ? ` · ${new Date(p.scheduledAt).toLocaleString("id-ID")}` : ""}</small>
          <p style={{ whiteSpace: "pre-wrap" }}>{p.caption}</p>
          {p.slides?.map((s, i) => <p key={i} style={{ opacity: 0.8 }}>Slide {i + 1}: {s}</p>)}
          {p.factCheckNotes && <p style={{ color: "#f0c36b" }}>Cek fakta: {p.factCheckNotes}</p>}
          {p.sources.length > 0 && <p>Sumber: {p.sources.join(", ")}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            {p.status === "review" && <>
              <button style={btn} onClick={() => act(p.id, "approve")}>Approve</button>
              <button style={btn} onClick={() => act(p.id, "reject")}>Reject</button>
            </>}
            {p.status === "approved" && <span style={{ opacity: 0.7 }}>Approved, menunggu Ardi menjadwalkan</span>}
          </div>
        </article>
      ))}

      <h3>Aktivitas agen</h3>
      <div style={{ fontFamily: "monospace", fontSize: 13, opacity: 0.85 }}>
        {logs.map((l, i) => <div key={i}>{new Date(l.at).toLocaleTimeString("id-ID")} [{l.agent}] {l.message}</div>)}
      </div>
    </div>
  );
}
