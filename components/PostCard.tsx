"use client";
import { useState } from "react";
import type { Post } from "@/lib/types";
import { fmtDateTime } from "./zone";

export type ActionBody = { action: string; [k: string]: unknown };

type Props = { post: Post; tz: string; onAction: (id: string, body: ActionBody) => Promise<string | null> };

const STATUS_LABEL: Record<Post["status"], string> = {
  drafting: "Nico menulis",
  review: "Perlu review",
  revising: "Nico merevisi",
  approved: "Approved",
  scheduled: "Terjadwal",
  publishing: "Mempublikasikan",
  published: "Terbit",
  rejected: "Ditolak",
  failed: "Gagal",
};

const SLIDE_SEP = "\n---\n";

export default function PostCard({ post, tz, onAction }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<"view" | "edit" | "revise" | "schedule">("view");
  const [caption, setCaption] = useState(post.caption);
  const [slidesText, setSlidesText] = useState(post.slides.join(SLIDE_SEP));
  const [feedback, setFeedback] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const allChecked = post.claims.every((_, i) => checked.has(i));
  const toggle = (i: number) => setChecked((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  async function run(body: ActionBody) {
    setBusy(true);
    setError("");
    const err = await onAction(post.id, body);
    setBusy(false);
    if (err) setError(err);
    else setMode("view");
  }

  const isReview = post.status === "review";

  return (
    <article className="card">
      <div className="meta">
        <span className={`badge ${post.status}`}>{STATUS_LABEL[post.status]}</span>
        <span>{post.platform === "instagram" ? "Instagram · carousel" : "Threads"}</span>
        {post.revision > 0 && <span>revisi #{post.revision}</span>}
        {post.scheduledAt && <span>· {fmtDateTime(post.scheduledAt, tz)}</span>}
        {post.reviewedBy && <span>· {post.reviewedBy}</span>}
      </div>
      <h3>{post.title}</h3>
      {post.error && <p className="note error">{post.error}</p>}
      {post.status === "rejected" && post.reviewNote && <p className="note">Alasan: {post.reviewNote}</p>}

      {mode === "edit" ? (
        <>
          <label className="field">Caption ({caption.length} karakter)
            <textarea className="textarea" value={caption} onChange={(e) => setCaption(e.target.value)} rows={6} />
          </label>
          {post.platform === "instagram" && (
            <label className="field">Slide (maks 5; pisahkan dengan baris berisi ---; slide poin: &quot;1. Judul. Penjelasan&quot;)
              <textarea className="textarea" value={slidesText} onChange={(e) => setSlidesText(e.target.value)} rows={8} />
            </label>
          )}
        </>
      ) : (
        <>
          {post.caption && <p className="caption">{post.caption}</p>}
          {post.platform === "instagram" && post.slides.length > 0 && (
            <div className="slides">
              {post.slides.map((s, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={`/api/slides/${post.id}/${i}?v=${encodeURIComponent(post.updatedAt)}`} alt={`Slide ${i + 1}: ${s}`} loading="lazy" />
              ))}
            </div>
          )}
        </>
      )}

      {isReview && post.claims.length > 0 && mode === "view" && (
        <>
          <div className="eyebrow" style={{ marginTop: 8 }}>CEK FAKTA — centang setelah diverifikasi</div>
          <ul className="checks">
            {post.claims.map((c, i) => (
              <li key={i}><label><input type="checkbox" checked={checked.has(i)} onChange={() => toggle(i)} /><span>{c}</span></label></li>
            ))}
          </ul>
        </>
      )}

      {post.sources.length > 0 && (
        <details>
          <summary>Sumber ({post.sources.length})</summary>
          <ul>{post.sources.map((s) => <li key={s}><a href={s} target="_blank" rel="noreferrer">{s}</a></li>)}</ul>
        </details>
      )}
      {post.researchNotes && (
        <details>
          <summary>Catatan riset Nico</summary>
          <div className="research">{post.researchNotes}</div>
        </details>
      )}

      {mode === "revise" && (
        <label className="field" style={{ marginTop: 10 }}>Catatan untuk Nico
          <textarea className="textarea" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Mis. angka di slide 3 salah, pakai data BPS 2026; nada terlalu formal." />
        </label>
      )}
      {mode === "schedule" && (
        <label className="field" style={{ marginTop: 10 }}>Waktu tayang (zona waktu perangkatmu)
          <input className="input" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
      )}

      {error && <p className="note error">{error}</p>}

      <div className="actions">
        {isReview && mode === "view" && (
          <>
            <button className="btn primary" disabled={busy || !allChecked} title={allChecked ? "" : "Centang semua klaim dulu"} onClick={() => run({ action: "approve" })}>
              Approve & jadwalkan otomatis
            </button>
            <button className="btn" disabled={busy || !allChecked} onClick={() => setMode("schedule")}>Pilih jam</button>
            <button className="btn" disabled={busy} onClick={() => setMode("revise")}>Minta revisi</button>
            <button className="btn" disabled={busy} onClick={() => { setCaption(post.caption); setSlidesText(post.slides.join(SLIDE_SEP)); setMode("edit"); }}>Edit</button>
            <button className="btn danger" disabled={busy} onClick={() => run({ action: "reject", note: prompt("Alasan reject (opsional)") ?? "" })}>Reject</button>
          </>
        )}
        {mode === "edit" && (
          <>
            <button className="btn primary" disabled={busy} onClick={() => run({ action: "edit", caption, slides: slidesText.split(/\n-{3,}\n/).map((s) => s.trim()).filter(Boolean) })}>Simpan</button>
            <button className="btn" onClick={() => setMode("view")}>Batal</button>
          </>
        )}
        {mode === "revise" && (
          <>
            <button className="btn primary" disabled={busy || feedback.trim().length < 3} onClick={() => run({ action: "revise", feedback })}>Kirim ke Nico</button>
            <button className="btn" onClick={() => setMode("view")}>Batal</button>
          </>
        )}
        {mode === "schedule" && (
          <>
            <button className="btn primary" disabled={busy || !when} onClick={() => run({ action: "approve", scheduledAt: new Date(when).toISOString() })}>Approve & jadwalkan</button>
            <button className="btn" onClick={() => setMode("view")}>Batal</button>
          </>
        )}
        {post.status === "scheduled" && <button className="btn" disabled={busy} onClick={() => run({ action: "unschedule" })}>Tarik dari jadwal</button>}
        {post.status === "failed" && <button className="btn" disabled={busy} onClick={() => run({ action: "retry" })}>Coba lagi</button>}
        {(post.status === "approved" || post.status === "scheduled" || post.status === "failed") && (
          <button className="btn danger small" disabled={busy} onClick={() => run({ action: "reject", note: prompt("Alasan reject (opsional)") ?? "" })}>Reject</button>
        )}
      </div>
    </article>
  );
}
