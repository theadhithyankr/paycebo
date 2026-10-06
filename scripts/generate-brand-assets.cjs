const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { Resvg } = require('@resvg/resvg-js');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'docs/images/paycebo-mark.svg'), 'utf8');
const foreground = source.replace(/<rect[^>]*\/>/, '');
function render(svg, name, width) {
  const renderer = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false, fontFiles: [
    require.resolve('@expo-google-fonts/manrope/400Regular/Manrope_400Regular.ttf'), require.resolve('@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf'),
  ] } });
  fs.writeFileSync(path.join(root, 'assets', name), renderer.render().asPng());
}
render(source.replace('rx="26"', 'rx="0"'), 'icon.png', 1024);
render(source, 'favicon.png', 64);
render(foreground, 'adaptive-icon.png', 1024);
render(foreground.replaceAll('#86DB6E', '#FFFFFF'), 'monochrome-icon.png', 1024);
fs.writeFileSync(path.join(root, 'assets/paycebo-mark.svg'), source);
const markBody = foreground.replace(/<svg[^>]*>|<\/svg>|<title[^>]*>.*?<\/title>/g, '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).join('');
for (const [name, ink, muted] of [['splash.png','#17221A','#5D675F'], ['splash-dark.png','#F6F8F3','#BBCDBB']]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300"><g transform="translate(26 6) scale(3)">${markBody}</g><text x="302" y="140" font-family="Manrope" font-weight="700" font-size="64" fill="${ink}">Paycebo</text><text x="304" y="194" font-family="Manrope" font-size="25" fill="${muted}">Pay your future self.</text></svg>`;
  render(svg, name, 900);
  if (name === 'splash.png') fs.writeFileSync(path.join(root, 'assets/paycebo-splash-lockup.svg'), svg);
}
// iOS launcher images must be opaque; preserve the exact rendered pixels.
execFileSync('python', ['-c', 'from PIL import Image; import sys; p=sys.argv[1]; Image.open(p).convert("RGB").save(p,optimize=True)', path.join(root, 'assets/icon.png')]);
console.log('Generated launcher, adaptive, monochrome, favicon, and splash assets from the approved SVG.');
