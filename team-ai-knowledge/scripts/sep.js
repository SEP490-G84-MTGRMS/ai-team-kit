#!/usr/bin/env node
/**
 * sep — CLI của SEP Kit (Cursor · Claude Code · Antigravity).
 * Chạy trong team-ai-knowledge:  npm run sep -- <lệnh>   (hoặc `sep <lệnh>` sau khi install --link)
 */

import fs from 'fs';
import path from 'path';
import { KB_ROOT, parseArgs } from './sep/lib.js';

const HELP = `
SEP Kit CLI

Cài đặt
  install [--user=<github>] [--ide=cursor,claude,antigravity] [--push] [--no-commit] [--project=MT-GRMS] [--link] [--yes]
                      Cài skills /sep-*, persona sub-agent, MCP "sep", hooks, rules cho các IDE (tự phát hiện IDE nếu bỏ --ide)
  uninstall [--ide=...]
  init <repo> [--remove]
                      Sinh rules (.cursor/rules, .agents/rules), workflows Antigravity và khối AGENTS.md cho một repo code
  sync                Tự động kéo (git pull) các repo trong workspace, cập nhật rules và kiểm tra schema
  db-sync [--check] [--backend=<path>]
                      Quét C# Domain Entities từ MT_GRMS_BACKEND và cập nhật database-schema.md
  doctor              Kiểm tra cài đặt + chạy thử MCP server

Theo dõi
  list [--all | --user=<github>]   Danh sách change (mặc định: của bạn)
  status [change]                  Trạng thái 6 bước + việc tiếp theo (bỏ trống = change đang làm)
  validate [--strict]              Kiểm tra openspec/ + sep-kit (dùng trong CI; exit 1 nếu lỗi; --strict: change BLOCKED cũng là lỗi)
  stats [--days=7]                 Thống kê telemetry: lệnh /sep-* và tool sep_* đã dùng
`;

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { positional, flags } = parseArgs(rest);

  switch (cmd) {
    case 'install':
      return (await import('./sep/install.js')).install(flags);
    case 'uninstall':
      return (await import('./sep/install.js')).uninstall(flags);
    case 'init':
      return (await import('./sep/project.js')).initProject(positional[0], flags);
    case 'sync':
    case 'pull':
      return (await import('./sep/sync.js')).syncWorkspace(flags);
    case 'db-sync':
      return (await import('./sep/db-sync.js')).dbSync(flags);
    case 'doctor':
      return (await import('./sep/report.js')).doctor();
    case 'list':
    case 'ls':
      return (await import('./sep/report.js')).list(flags);
    case 'status':
      return (await import('./sep/report.js')).status(positional[0]);
    case 'validate':
      return (await import('./sep/report.js')).validate(flags);
    case 'stats':
      return (await import('./sep/report.js')).stats(flags);
    case '--version':
    case '-v':
      return console.log(JSON.parse(fs.readFileSync(path.join(KB_ROOT, 'package.json'), 'utf8')).version);
    default:
      console.log(HELP);
      if (cmd && cmd !== 'help' && cmd !== '--help') process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
