import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { Ledger } from './ledger.mjs';
const [flag, database, operation, file, ...extra] = process.argv.slice(2);
if (flag !== '--db' || !database || !['apply','snapshot'].includes(operation) || extra.length || (operation==='apply' ? !file : file)) {
  console.error('Usage: node runner/cli.mjs --db <ledger.sqlite> apply <command.json> | snapshot');
  process.exit(2);
}
let ledger;
try {
  mkdirSync(path.dirname(path.resolve(database)),{recursive:true,mode:0o700});
  ledger = new Ledger(database);
  const result=operation==='snapshot' ? ledger.snapshot() : ledger.apply(JSON.parse(readFileSync(file,'utf8')));
  console.log(JSON.stringify(result,null,2));
} catch(error) {
  console.error(JSON.stringify({error:error.message}));process.exitCode=1;
} finally {ledger?.close();}
