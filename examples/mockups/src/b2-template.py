import math
FONTS = {
  # nama: (css, family, ukuran judul cover, ukuran huruf besar jawaban, letter-spacing)
  "lilita":    ("lilita-one/400.css", "Lilita One", 104, 600, "0px", "1.04"),
  "bagel":     ("bagel-fat-one/400.css", "Bagel Fat One", 96, 560, "0px", "1.08"),
  "unbounded": ("unbounded/900.css", "Unbounded", 72, 520, "-2px", "1.18"),
}
# irisan 38 menit pada stopwatch (dari jam 12 searah jarum jam)
def wedge(cx, cy, r, minutes):
    a = math.radians(minutes / 60 * 360)
    x, y = cx + r * math.sin(a), cy - r * math.cos(a)
    large = 1 if minutes > 30 else 0
    return f"M{cx} {cy}L{cx} {cy-r}A{r} {r} 0 {large} 1 {x:.1f} {y:.1f}Z"

for key, (css, fam, qsize, bigsize, ls, lh) in FONTS.items():
    html = f'''<!doctype html>
<html lang="id"><head><meta charset="utf-8">
<link rel="stylesheet" href="node_modules/@fontsource/{css}">
<link rel="stylesheet" href="node_modules/@fontsource/plus-jakarta-sans/500.css">
<link rel="stylesheet" href="node_modules/@fontsource/plus-jakarta-sans/700.css">
<link rel="stylesheet" href="node_modules/@fontsource/plus-jakarta-sans/800.css">
<style>
  :root {{ --sun: #ffc93c; --ink: #141414; --tomato: #ff5a36; --paper: #fffaf0; --mint: #3ddc97; --display: "{fam}"; }}
  body {{ margin: 0; background: #555; display: flex; gap: 40px; padding: 40px; }}
  .slide {{ width: 1080px; height: 1350px; position: relative; overflow: hidden; flex: none; font-family: "Plus Jakarta Sans", sans-serif; color: var(--ink); }}
  .s1 {{ background: var(--sun); }}
  .s2 {{ background: var(--tomato); }}
  .q-no {{ position: absolute; left: 80px; top: 80px; width: 150px; height: 150px; border-radius: 50%; background: var(--ink); color: var(--sun);
    display: grid; place-items: center; font: 400 60px/1 var(--display); transform: rotate(-8deg); letter-spacing: {ls}; }}
  .watch {{ position: absolute; right: 80px; top: 60px; width: 250px; height: 275px; transform: rotate(10deg); }}
  .q {{ position: absolute; left: 80px; right: 80px; top: 390px; font: 400 {qsize}px/{lh} var(--display); letter-spacing: {ls}; margin: 0; }}
  .opts {{ position: absolute; left: 80px; right: 80px; top: 765px; display: grid; gap: 26px; }}
  .opt {{ display: flex; align-items: center; gap: 28px; background: var(--paper); border: 6px solid var(--ink); border-radius: 26px; padding: 18px 30px;
    box-shadow: 10px 10px 0 var(--ink); font: 700 46px/1.1 "Plus Jakarta Sans"; }}
  .opt b {{ width: 78px; height: 78px; flex: none; border-radius: 50%; background: var(--ink); color: var(--paper); display: grid; place-items: center; font: 400 42px/1 var(--display); }}
  .hint {{ position: absolute; right: 80px; bottom: 80px; font: 800 32px/1 "Plus Jakarta Sans"; display: flex; align-items: center; gap: 16px; }}
  .hint svg {{ width: 70px; height: 40px; }}
  .brand {{ position: absolute; left: 80px; bottom: 80px; font: 400 36px/1 var(--display); letter-spacing: {ls}; }}
  .answer {{ position: absolute; left: 80px; top: 90px; font: 800 40px/1 "Plus Jakarta Sans"; color: var(--paper); }}
  .big {{ position: absolute; left: 60px; top: 130px; font: 400 {bigsize}px/1 var(--display); color: var(--paper); }}
  .check {{ position: absolute; left: 560px; top: 260px; width: 220px; height: 220px; border-radius: 50%; background: var(--mint); border: 8px solid var(--ink);
    display: grid; place-items: center; transform: rotate(10deg); box-shadow: 10px 10px 0 var(--ink); }}
  .reveal {{ position: absolute; left: 80px; right: 80px; top: 760px; background: var(--paper); border: 6px solid var(--ink); border-radius: 30px; box-shadow: 12px 12px 0 var(--ink); padding: 44px 50px; }}
  .reveal h2 {{ margin: 0 0 18px; font: 400 64px/1 var(--display); letter-spacing: {ls}; }}
  .reveal p {{ margin: 0; font: 500 36px/1.45 "Plus Jakarta Sans"; }}
  .src {{ position: absolute; left: 80px; bottom: 80px; font: 500 28px/1 "Plus Jakarta Sans"; color: var(--paper); }}
  .s2 .brand {{ left: auto; right: 80px; color: var(--paper); }}
</style></head><body>
<section class="slide s1">
  <div class="q-no">#01</div>
  <svg class="watch" viewBox="0 0 300 330">
    <g transform="translate(10 12)" fill="#141414"><rect x="118" y="0" width="64" height="36" rx="10"/><circle cx="150" cy="185" r="130"/>
      <rect x="236" y="54" width="44" height="30" rx="8" transform="rotate(40 258 69)"/></g>
    <rect x="118" y="0" width="64" height="36" rx="10" fill="#ff5a36" stroke="#141414" stroke-width="7"/>
    <rect x="138" y="30" width="24" height="30" fill="#141414"/>
    <rect x="236" y="54" width="44" height="30" rx="8" fill="#ff5a36" stroke="#141414" stroke-width="7" transform="rotate(40 258 69)"/>
    <circle cx="150" cy="185" r="130" fill="#fffaf0" stroke="#141414" stroke-width="10"/>
    <path d="{wedge(150, 185, 104, 38)}" fill="#ff5a36"/>
    <g stroke="#141414" stroke-width="7" stroke-linecap="round"><path d="M150 72v18M263 185h-18M150 298v-18M37 185h18"/></g>
    <path d="M150 185L{150 + 92*math.sin(math.radians(228)):.1f} {185 - 92*math.cos(math.radians(228)):.1f}" stroke="#141414" stroke-width="10" stroke-linecap="round"/>
    <circle cx="150" cy="185" r="13" fill="#141414"/>
  </svg>
  <h1 class="q">Perang tersingkat di dunia berlangsung berapa lama?</h1>
  <div class="opts">
    <div class="opt"><b>A</b>Kurang dari 1 jam</div>
    <div class="opt"><b>B</b>3 hari</div>
    <div class="opt"><b>C</b>2 minggu</div>
  </div>
  <span class="brand">Media Kita</span>
  <span class="hint">Tebak dulu, lalu geser
    <svg viewBox="0 0 70 40"><path d="M2 20h60M44 4l18 16-18 16" fill="none" stroke="#141414" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
</section>
<section class="slide s2">
  <span class="answer">Jawabannya</span>
  <div class="big">A</div>
  <div class="check"><svg width="120" height="120" viewBox="0 0 120 120"><path d="M22 64l26 26 52-58" fill="none" stroke="#141414" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="reveal">
    <h2>38–45 menit</h2>
    <p>Perang Anglo-Zanzibar, 27 Agustus 1896. Inggris menembaki istana Zanzibar dan pertempuran usai sebelum satu jam. Durasi persisnya beda-beda di tiap catatan.</p>
  </div>
  <span class="src">Sumber: Wikipedia, History Today</span>
  <span class="brand">Media Kita</span>
</section>
</body></html>'''
    open(f"b2-{key}.html", "w").write(html)
print("ok")
