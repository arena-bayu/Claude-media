"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Platform, Settings } from "@/lib/types";

type Props = { open: boolean; settings: Settings; onClose: () => void; onSaved: () => void };

export default function SettingsDialog({ open, settings, onClose, onSaved }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      brand: f.get("brand"),
      niche: f.get("niche"),
      audience: f.get("audience"),
      voice: f.get("voice"),
      pillars: String(f.get("pillars")).split(",").map((s) => s.trim()).filter(Boolean),
      postsPerRun: Number(f.get("postsPerRun")),
      platforms: f.getAll("platforms") as Platform[],
      slots: String(f.get("slots")).split(",").map((s) => s.trim()).filter(Boolean),
    };
    const res = await fetch("/api/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return setError((await res.json()).error ?? "Gagal menyimpan");
    setError("");
    onSaved();
    onClose();
  }

  return (
    <dialog ref={ref} onClose={onClose}>
      <form onSubmit={submit} key={JSON.stringify(settings)}>
        <div className="panel-head"><h2>Brief brand</h2></div>
        <label className="field">Nama brand<input className="input" name="brand" defaultValue={settings.brand} required /></label>
        <label className="field">Niche<input className="input" name="niche" defaultValue={settings.niche} required /></label>
        <label className="field">Audiens<input className="input" name="audience" defaultValue={settings.audience} required /></label>
        <label className="field">Gaya bahasa<input className="input" name="voice" defaultValue={settings.voice} required /></label>
        <label className="field">Pilar konten (pisahkan koma; Lucy menggilirnya)<input className="input" name="pillars" defaultValue={settings.pillars.join(", ")} required /></label>
        <label className="field">Post per putaran<input className="input" name="postsPerRun" type="number" min={1} max={10} defaultValue={settings.postsPerRun} /></label>
        <label className="field">Jam tayang (pisahkan koma, zona waktu media)<input className="input" name="slots" defaultValue={settings.slots.join(", ")} /></label>
        <div className="field">Platform
          <div style={{ display: "flex", gap: 16 }}>
            {(["instagram", "threads"] as Platform[]).map((p) => (
              <label key={p} style={{ display: "flex", gap: 6, color: "var(--text)" }}>
                <input type="checkbox" name="platforms" value={p} defaultChecked={settings.platforms.includes(p)} /> {p}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="note error">{error}</p>}
        <div className="actions">
          <button className="btn primary">Simpan</button>
          <button className="btn" type="button" onClick={onClose}>Batal</button>
        </div>
      </form>
    </dialog>
  );
}
