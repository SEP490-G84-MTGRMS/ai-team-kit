/**
 * sync.js — Synchronizes latest changes from Git remotes across workspace repos,
 * refreshes rules, and checks design consistency.
 */

import fs from 'fs';
import path from 'path';
import { KB_ROOT, IDE, buildMcp, info, isGitWorkTree, ok, tryOutput, upsertBlock, warn, writeText } from './lib.js';
import { initProject } from './project.js';
import { dbSync } from './db-sync.js';
import { readInstallConfig } from './install.js';
import { agentFile, antigravityRule, copySkillForIde, readPersonas, readRules, readSkills, rulesBlock } from './render.js';

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

  // 3. Rebuild MCP server and refresh IDE skills, global rules & personas if installed
  const cfg = readInstallConfig();
  if (cfg?.user) {
    info('Cập nhật bản build MCP, skills, rules và personas cho IDE...');
    try {
      buildMcp();
      const skills = readSkills();
      const rules = readRules();
      const personas = readPersonas();
      for (const ide of cfg.ides || ['cursor']) {
        const t = IDE[ide];
        if (!t) continue;
        if (t.skills) {
          for (const s of skills) copySkillForIde(s, path.join(t.skills, s.name), ide);
        }
        if (t.agents && (ide === 'cursor' || ide === 'claude')) {
          for (const p of personas) writeText(path.join(t.agents, `${p.name}.md`), agentFile(p, ide));
        }
        if (ide === 'antigravity' && t.rules) {
          for (const r of rules) writeText(path.join(t.rules, `sep-kit-${r.name}.md`), antigravityRule(r));
        }
        if (ide === 'claude' && t.memory && fs.existsSync(t.root)) {
          upsertBlock(t.memory, rulesBlock(rules));
        }
      }
      ok('Đã cập nhật MCP server, skills, global rules & personas mới nhất cho IDE.');
    } catch (err) {
      warn(`Cập nhật build MCP: ${err.message}`);
    }
  }

  // 4. Refresh SEP rules in team-ai-knowledge & any initialized workspace repos
  info('Làm mới quy chuẩn SEP rules...');
  initProject(KB_ROOT, flags);
  const candidateDirs = [workspaceRoot, ...neighborRepos.map(r => r.dir)];
  for (const dir of candidateDirs) {
    if (fs.existsSync(path.join(dir, '.agents', 'rules')) || fs.existsSync(path.join(dir, '.cursor', 'rules'))) {
      initProject(dir, flags);
    }
  }

  // 5. Check database schema consistency
  try {
    await dbSync({ check: true });
  } catch (err) {
    warn(`Kiểm tra DB schema: ${err.message}`);
  }

  ok('Đồng bộ hoàn tất! Môi trường đã sẵn sàng cho phiên làm việc mới.');
}
