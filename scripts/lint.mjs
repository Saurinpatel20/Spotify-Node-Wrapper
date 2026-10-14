// Dependency-free lint: syntax-check every source file and flag leftover node-fetch imports.
import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const files = ['index.js', ...readdirSync('SpotifyWrapper').map((f) => `SpotifyWrapper/${f}`), ...readdirSync('test').map((f) => `test/${f}`)];
let bad = 0;
for (const f of files) {
    try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { bad++; console.error(String(e.stderr)); }
    if (/from ['"]node-fetch['"]/.test(readFileSync(f, 'utf8'))) { bad++; console.error(`${f}: imports node-fetch`); }
}
await import('../index.js');
if (bad) process.exit(1);
console.log(`lint ok (${files.length} files)`);
