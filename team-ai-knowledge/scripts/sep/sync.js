/**
 * sync.js — Synchronizes latest changes from Git remotes across workspace repos,
 * refreshes rules, and checks design consistency.
 */

import fs from 'fs';
import path from 'path';
import { KB_ROOT, IDE, buildMcp, info, isGitWorkTree, ok, tryOutput, warn } from './lib.js';
import { initProject } from './project.js';
import { dbSync } from './db-sync.js';
import { readInstallConfig } from './install.js';
import { readSkills } from './render.js';

/**
 * Runs git pull with rebase and autostash on a given directory.
 * @param {string} dir
 * @param {string} label
 */
function pullRepo(dir, label) {
  if (!fs.existsSync(dir) || !isGitWorkTree(dir)) {
    return;
  }
  info(`Đang kéo cập nhật mới nhất cho ${label}...`);
  const res = tryOutput('git', ['pull', '--rebase', '--autostash'], dir);
  if (res) {
    ok(`${label}: ${res.split('\n')[0]}`);
  } else {
    warn(`${label}: Không thể kéo (hoặc chưa cấu hình remote)`);
  }
}

/**
 * Main sync execution function.
 * @param {Record<string, any>} flags
 */
export async function syncWorkspace(flags = {}) {
  info('Bắt đầu đồng bộ không gian làm việc (Workspace Sync)...');

  // 1. Pull team-ai-knowledge
  pullRepo(KB_ROOT, 'team-ai-knowledge');

  // 2. Discover neighboring repos in workspace
  const workspaceRoot = path.resolve(KB_ROOT, '..', '..');
  const neighborRepos = [
    { name: 'DOCS_MT_GRMS', dir: path.join(workspaceRoot, 'DOCS_MT_GRMS') },
    { name: 'MT_GRMS_BACKEND', dir: path.join(workspaceRoot, 'MT_GRMS_BACKEND') },
    { name: 'MT_GRMS_FRONTEND', dir: path.join(workspaceRoot, 'MT_GRMS_FRONTEND') },
  ];

  for (const repo of neighborRepos) {
    if (fs.existsSync(repo.dir)) {
      pullRepo(repo.dir, repo.name);
    }
  }

  // 3. Rebuild MCP server and refresh IDE skills if installed
  const cfg = readInstallConfig();
  if (cfg?.user) {
    info('Cập nhật bản build MCP và skills cho IDE...');
    try {
      buildMcp();
      const skills = readSkills();
      for (const ide of cfg.ides || ['cursor']) {
        const t = IDE[ide];
        if (t?.skills && fs.existsSync(t.skills)) {
          for (const s of skills) {
            fs.cpSync(s.dir, path.join(t.skills, s.name), { recursive: true });
          }
        }
      }
      ok('Đã cập nhật MCP server & skills mới nhất cho IDE.');
    } catch (err) {
      warn(`Cập nhật build MCP: ${err.message}`);
    }
  }

  // 4. Refresh SEP rules in team-ai-knowledge
  info('Làm mới quy chuẩn SEP rules...');
  initProject(KB_ROOT, flags);

  // 5. Check database schema consistency
  try {
    await dbSync({ check: true });
  } catch (err) {
    warn(`Kiểm tra DB schema: ${err.message}`);
  }

  ok('Đồng bộ hoàn tất! Môi trường đã sẵn sàng cho phiên làm việc mới.');
}
