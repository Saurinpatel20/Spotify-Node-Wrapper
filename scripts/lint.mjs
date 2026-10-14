// Dependency-free lint: syntax-check every source file and flag leftover node-fetch imports.
import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const files = ['index.js', ...readdirSync('SpotifyWrapper').map((f) => `SpotifyWrapper/${f}`), ...readdirSync('test').map((f) => `test/${f}`), ...readdirSync('scripts').map((f) => `scripts/${f}`)];
let bad = 0;
for (const f of files) {
    try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { bad++; console.error(String(e.stderr)); }
    if (/from ['"]node-fetch['"]/.test(readFileSync(f, 'utf8'))) { bad++; console.error(`${f}: imports node-fetch`); }
}
await import('../index.js');
// Every README js example must parse; no placeholder text anywhere in docs or source.
const readme = readFileSync('README.md', 'utf8');
for (const [, code] of readme.matchAll(/```js\n([\s\S]*?)```/g)) {
    try { new Function(`return (async () => {${code.replace(/^import .*$/gm, '')}\n})`); } catch (e) { bad++; console.error(`README example: ${e.message}\n${code}`); }
}
for (const f of [...files, 'README.md', 'index.d.ts']) {
    const placeholder = new RegExp(['yet to ' + 'provide', '\\bTO' + 'DO\\b', '\\bT' + 'BD\\b', 'documentation in ' + 'progress'].join('|'), 'i');
    if (placeholder.test(readFileSync(f, 'utf8'))) { bad++; console.error(`${f}: contains placeholder text`); }
}
if (bad) process.exit(1);
console.log(`lint ok (${files.length} files)`);
