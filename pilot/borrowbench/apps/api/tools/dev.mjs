import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const compiler = spawn(process.execPath, [require.resolve('typescript/bin/tsc'), '--watch', '--preserveWatchOutput'], { stdio: 'inherit' });
let server;
const timer = setInterval(() => {
  if (!existsSync('dist/src/main.js')) return;
  clearInterval(timer);
  server = spawn(process.execPath, ['--watch', ...(process.env.API_INSPECT ? [`--inspect=${process.env.API_INSPECT}`] : []), 'dist/src/main.js'], { stdio: 'inherit' });
  server.on('exit', code => { compiler.kill(); process.exitCode = code ?? 1; });
}, 200);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  clearInterval(timer); compiler.kill(signal); server?.kill(signal);
});
compiler.on('exit', code => { clearInterval(timer); server?.kill(); process.exitCode = code ?? 1; });
