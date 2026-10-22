"use client";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), password: form.get("password") }),
    });
    setBusy(false);
    if (res.ok) window.location.href = "/";
    else setError((await res.json()).error ?? "Gagal login");
  }

  return (
    <main className="login">
      <form className="panel" onSubmit={submit}>
        <div className="panel-head"><h2>Masuk ke kantor</h2></div>
        <p className="eyebrow">Hanya tim review yang bisa approve konten.</p>
        <label className="field">Nama reviewer<input className="input" name="name" autoComplete="name" required /></label>
        <label className="field">Password<input className="input" name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p className="note error">{error}</p>}
        <button className="btn primary" disabled={busy} style={{ width: "100%" }}>{busy ? "Masuk..." : "Masuk"}</button>
      </form>
    </main>
  );
}
