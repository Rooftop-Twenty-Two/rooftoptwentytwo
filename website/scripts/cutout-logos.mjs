// One-off: knock out white backgrounds from award logos so they can be tinted
// white over the dark hero. Produces *-cutout.png next to each source.
import sharp from 'sharp';
const files = [
  'public/images/Spiders-Logos-Isolated3-blog.png',
  'public/images/DMA-Generic-Pink-Blue-270x270-1.png',
  'public/images/European-Search-Awards-Logo_full_colour.png',
];
for (const f of files) {
  const out = f.replace(/\.png$/, '-cutout.png');
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r > 236 && g > 236 && b > 236) data[i+3] = 0;
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
    .trim().png().toFile(out);
  console.log('wrote', out);
}
