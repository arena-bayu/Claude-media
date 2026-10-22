"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AgentState, LogEntry, Platform, Post, Settings } from "@/lib/types";
import Calendar from "./Calendar";
import Office from "./Office";
import PostCard, { type ActionBody } from "./PostCard";
import SettingsDialog from "./SettingsDialog";
import { dayKeyIn } from "./zone";

type State = {
  user: string | null;
  posts: Post[];
  agents: AgentState[];
  logs: LogEntry[];
  settings: Settings;
  officeRunning: boolean;
  demo: boolean;
  model: string;
  timezone: string;
};

type Tab = "semua" | "review" | "terjadwal";

const NEEDS_ACTION = new Set<Post["status"]>(["review", "failed", "drafting", "revising"]);

export default function Dashboard() {
  const [state, setState] = useState<State | null>(null);
  const [tab, setTab] = useState<Tab>("review");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [day, setDay] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (res.status === 401) return void (window.location.href = "/login");
    if (res.ok) setState(await res.json());
  }, []);

  const busy = Boolean(state?.officeRunning || state?.agents.some((a) => a.busy));
  useEffect(() => {
    void load();
    const t = setInterval(load, busy ? 3000 : 15000);
    return () => clearInterval(t);
  }, [load, busy]);

  const tz = state?.timezone ?? "Asia/Jakarta";
  const today = dayKeyIn(new Date(), tz);
  const selected = day ?? today;

  const byPlatform = useMemo(
    () => (state?.posts ?? []).filter((p) => platform === "all" || p.platform === platform),
    [state, platform],
  );
  const postDay = (p: Post) => dayKeyIn(new Date(p.publishedAt ?? p.scheduledAt ?? p.createdAt), tz);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of byPlatform) if (p.scheduledAt && p.status !== "rejected") c[postDay(p)] = (c[postDay(p)] ?? 0) + 1;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byPlatform, tz]);

  const reviewCount = byPlatform.filter((p) => NEEDS_ACTION.has(p.status)).length;
  const visible = byPlatform
    .filter((p) => {
      if (tab === "review") return NEEDS_ACTION.has(p.status);
      if (tab === "terjadwal") return (p.status === "scheduled" || p.status === "published" || p.status === "publishing") && postDay(p) === selected;
      return postDay(p) === selected;
    })
    .sort((a, b) => (a.scheduledAt ?? a.createdAt).localeCompare(b.scheduledAt ?? b.createdAt));

  async function onAction(id: string, body: ActionBody): Promise<string | null> {
    const res = await fetch(`/api/posts/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    await load();
    return res.ok ? null : ((await res.json()).error ?? "Gagal");
  }

  async function runOffice() {
    setError("");
    const res = await fetch("/api/office", { method: "POST" });
    if (!res.ok) setError((await res.json()).error ?? "Gagal memulai");
    await load();
  }

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    window.location.href = "/login";
  }

  if (!state) return <main className="shell"><p className="empty">Memuat kantor…</p></main>;

  return (
    <main className="shell">
      <header className="topbar">
        <h1>{state.settings.brand} <span className="eyebrow">office</span></h1>
        <span className="eyebrow">{tz.replace("_", " ")} · {state.model}</span>
        <span className="spacer" />
        <button className="btn" onClick={() => setSettingsOpen(true)}>Brief brand</button>
        <button className="btn primary" onClick={runOffice} disabled={state.officeRunning}>
          {state.officeRunning ? "Kantor bekerja…" : "Jalankan kantor"}
        </button>
        {state.user && <span className="eyebrow">{state.user}</span>}
        {state.user && <button className="btn small" onClick={logout}>Keluar</button>}
      </header>

      {state.demo && (
        <div className="banner">
          Mode demo: <code>ANTHROPIC_API_KEY</code> belum diisi, jadi Lucy & Nico menghasilkan konten placeholder. Alur review, jadwal, dan publikasi tetap bisa dicoba.
        </div>
      )}
      {error && <div className="banner">{error}</div>}

      <div className="grid">
        <section>
          <div className="panel">
            <div className="panel-head">
              <h2>Kantor</h2>
              <span className="spacer" style={{ flex: 1 }} />
              <span className="eyebrow">{busy ? "● Bekerja" : "○ Siaga"}</span>
            </div>
            <Office agents={state.agents} />
          </div>
          <div className="panel">
            <div className="panel-head"><h2>Aktivitas</h2></div>
            <div className="log">
              {state.logs.length === 0 && <p className="empty">Belum ada aktivitas. Klik “Jalankan kantor”.</p>}
              {state.logs.map((l) => (
                <div key={l.id}>
                  {new Date(l.at).toLocaleTimeString("id-ID", { timeZone: tz, hour: "2-digit", minute: "2-digit" })} <b>{l.agent}</b> {l.message}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <Calendar selected={selected} today={today} counts={counts} onSelect={setDay} />
          <div className="seg" style={{ marginTop: 12 }}>
            {(["semua", "review", "terjadwal"] as Tab[]).map((t) => (
              <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
                {t === "semua" ? "Semua" : t === "review" ? "Review" : "Terjadwal"}
                {t === "review" && reviewCount > 0 && <span className="count">{reviewCount}</span>}
              </button>
            ))}
          </div>
          <div className="seg" style={{ marginTop: 8 }}>
            {(["all", "instagram", "threads"] as const).map((p) => (
              <button key={p} aria-pressed={platform === p} onClick={() => setPlatform(p)}>
                {p === "all" ? "Semua platform" : p === "instagram" ? "Instagram" : "Threads"}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            {visible.length === 0 && (
              <p className="empty">{tab === "review" ? "Tidak ada yang menunggu review." : "Tidak ada konten di hari ini."}</p>
            )}
            {visible.map((p) => <PostCard key={`${p.id}:${p.updatedAt}`} post={p} tz={tz} onAction={onAction} />)}
          </div>
        </section>
      </div>

      <SettingsDialog open={settingsOpen} settings={state.settings} onClose={() => setSettingsOpen(false)} onSaved={load} />
    </main>
  );
}
