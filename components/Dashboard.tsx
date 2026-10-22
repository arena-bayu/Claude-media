"use client";
import { useCallback, useEffect, useState } from "react";
import type { Platform, Post } from "@/lib/types";

type Props = { agents: { id: string; name: string; office: string }[] };
type Tab = "semua" | "review" | "terjadwal";

const btn = { padding: "6px 12px", borderRadius: 6, border: "1px solid #2c3a33", background: "#16201b", color: "inherit", cursor: "pointer" } as const;

export default function Dashboard({ agents }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<Tab>("semua");
  const [platform, setPlatform] = useState<Platform>("threads");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => setPosts(await (await fetch("/api/posts")).json()), []);
  useEffect(() => { load(); }, [load]);

  const visible = posts
    .filter((p) => p.platform === platform)
    .filter((p) => tab === "semua" || (tab === "review" ? p.status === "review" : p.status === "scheduled"));

  async function act(id: string, action: string, scheduledAt?: string) {
    const res = await fetch(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify({ action, scheduledAt }) });
    if (!res.ok) alert((await res.json()).error);
    load();
  }

  async function ask() {
    if (!topic) return;
    setBusy(true);
    await fetch("/api/agents/run", { method: "POST", body: JSON.stringify({ topic, platform }) });
    setTopic(""); setBusy(false); load();
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1>AI Media Office</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {agents.map((a) => (
          <div key={a.id} style={{ ...btn, cursor: "default" }}><strong>{a.name}</strong> · {a.office}</div>
        ))}
      </div>

      <h3>Minta Nico membuat draft</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topik..." style={{ ...btn, flex: 1 }} />
        <button style={btn} onClick={ask} disabled={busy}>{busy ? "Menulis..." : "Buat draft"}</button>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "24px 0 8px" }}>
        {(["instagram", "threads"] as Platform[]).map((p) => (
          <button key={p} style={{ ...btn, borderColor: p === platform ? "#7ee0a8" : "#2c3a33" }} onClick={() => setPlatform(p)}>{p}</button>
        ))}
        <span style={{ flex: 1 }} />
        {(["semua", "review", "terjadwal"] as Tab[]).map((t) => (
          <button key={t} style={{ ...btn, borderColor: t === tab ? "#7ee0a8" : "#2c3a33" }} onClick={() => setTab(t)}>{t}</button>
        ))}
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
            {p.status === "approved" && (
              <input type="datetime-local" style={btn} onChange={(e) => e.target.value && act(p.id, "schedule", new Date(e.target.value).toISOString())} />
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
