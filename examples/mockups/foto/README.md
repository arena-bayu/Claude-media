# Demo: foto otomatis di desain kuis B

Foto sumber: potret resmi NASA astronaut Eileen Collins (karya pemerintah AS, domain publik),
diambil dari data contoh scikit-image. Diolah otomatis dengan `src/foto-pipeline.cjs`:

1. crop ke area paling menonjol (`sharp.strategy.attention`)
2. grayscale + kontras
3. duotone earth tone (cokelat tua ke krem)
4. titik halftone ala cetakan lama

Fakta di slide jawaban dicek ke Guinness World Records ("First female shuttle pilot",
"First woman to command a Space Shuttle mission").
