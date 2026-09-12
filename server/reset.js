import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(__dirname, 'data', 'swollen-teams.db');

// Node's filesystem API is Windows-safe and avoids requiring a shell rm command.
for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${databasePath}${suffix}`, { force: true });
await import('./seed.js');
console.log('Reset complete. The seeded Swollen Teams demo database is ready.');
