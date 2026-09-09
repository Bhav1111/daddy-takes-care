// Flatten the cover scene into static SVGs (share card 1200x630 and app icon 512x512), then rasterize with QuickLook.
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const Art = eval(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8') + ';Art');
const css = fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8');
const tokens = css.match(/\.book, \.leaf, \.tone-dawn \{([\s\S]*?)\}/)[1];
const style = `<style>:root{${tokens}} .fb,.coo,.whisper,.splat,.sparkle,.sing,.confetti,.sleepy,.zz,.breeze,.snow,.dream,.shh{opacity:0} text{font-family:'Arial Rounded MT Bold','Avenir Next',sans-serif}</style>`;
const layers = Art.SCENES.cover().layers.map(l => l.svg).join('');
const scene = (x, y, w, h, vb) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice">${layers}</svg>`;
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 -285 1200 1200">${style}
<rect x="0" y="-285" width="1200" height="1200" fill="#FFF1D9"/>
<clipPath id="pl"><rect x="0" y="0" width="630" height="630"/></clipPath><g clip-path="url(#pl)">${scene(0, 0, 630, 630, '0 80 1000 1000')}</g>
<text x="690" y="228" font-size="74" font-weight="bold" fill="#B5461A">Daddy</text>
<text x="690" y="306" font-size="74" font-weight="bold" fill="#B5461A">Takes Care.</text>
<text x="692" y="372" font-size="40" font-weight="bold" fill="#4A2E2A">No shhh’s needed.</text>
<text x="692" y="424" font-size="25" font-style="italic" font-family="Georgia, serif" fill="#8A675A">“Your baby is talking to you”</text>
<text x="692" y="520" font-size="21" fill="#8A675A">An interactive picture book</text>
<text x="692" y="552" font-size="21" fill="#8A675A">Reads aloud · every word dances</text>
<text x="692" y="584" font-size="21" fill="#8A675A">Words by Baruch Havia</text>
</svg>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${style}
<clipPath id="ic"><rect width="512" height="512" rx="110"/></clipPath><g clip-path="url(#ic)"><rect width="512" height="512" fill="#FBE3C0"/>${scene(0, 0, 512, 512, '170 150 660 660')}</g></svg>`;
fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true }); fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'build/cover.svg'), card); fs.writeFileSync(path.join(ROOT, 'build/icon.svg'), icon);
for (const [name, size] of [['cover', 1200], ['icon', 512]]) {
  execSync(`qlmanage -t -s ${size} -o "${path.join(ROOT, 'build')}" "${path.join(ROOT, 'build', name + '.svg')}" >/dev/null 2>&1`);
  fs.renameSync(path.join(ROOT, 'build', name + '.svg.png'), path.join(ROOT, 'docs', name + '.png'));
}
execSync(`sips --cropToHeightWidth 630 1200 "${path.join(ROOT, 'docs', 'cover.png')}" >/dev/null 2>&1`);
console.log('cover.png and icon.png written to site/');
