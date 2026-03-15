const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = path.resolve(__dirname, '../public/assets/quackythebird/bird.png');
const outputPath = path.resolve(__dirname, '../public/assets/quackythebird/lyingdown.png');

if (!fs.existsSync(inputPath)) {
  console.error('Input PNG not found at', inputPath);
  process.exit(2);
}

fs.createReadStream(inputPath)
  .pipe(new PNG())
  .on('parsed', function () {
    const png = this;
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        const a = png.data[idx + 3];

        if (a === 0) {
          // fully transparent, keep as-is
          png.data[idx] = 0;
          png.data[idx + 1] = 0;
          png.data[idx + 2] = 0;
          continue;
        }

        const alpha = a / 255;
        // Assume white matte was used when premultiplying: observed = alpha*fg + (1-alpha)*1
        // Solve for fg: fg = (observed - (1-alpha)*1) / alpha
        // observed is in 0..1, white is 1.
        const unpremultiply = (chan) => {
          const obs = chan / 255;
          const fg = (obs + alpha - 1) / alpha;
          const clamped = Math.min(1, Math.max(0, isFinite(fg) ? fg : 0));
          return Math.round(clamped * 255);
        };

        png.data[idx] = unpremultiply(r);
        png.data[idx + 1] = unpremultiply(g);
        png.data[idx + 2] = unpremultiply(b);
        // leave alpha as-is
      }
    }

    const out = fs.createWriteStream(outputPath);
    png.pack().pipe(out);
    out.on('finish', () => console.log('Wrote cleaned PNG to', outputPath));
  })
  .on('error', (err) => {
    console.error('Error processing PNG:', err);
    process.exit(1);
  });
