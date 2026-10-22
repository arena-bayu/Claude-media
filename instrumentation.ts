// Menjalankan "kantor 24 jam" di dalam proses server Next.js (butuh server yang selalu hidup, bukan serverless).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.SCHEDULER === "off") return;
  const { startScheduler } = await import("./lib/scheduler");
  startScheduler();
}
