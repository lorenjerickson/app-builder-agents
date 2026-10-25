import { createApp } from './app.js';
import { loadConfig } from './config.js';
try {
  const config = loadConfig();
  const port = Number(process.env.API_PORT ?? 3101);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
  const app = await createApp(config);
  await app.listen(port, process.env.API_HOST ?? '127.0.0.1');
  process.stdout.write(JSON.stringify({ event: 'api_started', port }) + '\n');
} catch {
  process.stderr.write('{"event":"api_start_failed"}\n');
  process.exitCode = 1;
}
