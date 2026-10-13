/**
 * SEP Workflow — 6 bước, mỗi bước = 1 lệnh skill:
 *
 *   /sep-spec         spec         .session.md, proposal.md
 *   /sep-brainstorm   brainstorm   exploration.md, design-brief.md*, specs.md      (* chỉ schema feature)
 *   /sep-verify-spec  verify-spec  review/skeptic.md, tasks.md
 *   /sep-apply        apply        (mọi task trong tasks.md đã tick + .status >= apply)
 *   /sep-test         test         test-report.md (frontmatter verdict: PASS)
 *   /sep-archive      archived     (.status = archived) → merge specs.md vào openspec/specs/<capability>/spec.md
 *
 * Folder: openspec/changes/<change>/ — .status giữ key của bước hiện tại.
 * Gate (change tạo mới có `gate: true`): mỗi bước phải được user Approve (sep_duyet_buoc) trước khi sang bước sau.
 * Step order, schema artifacts + pass rules MUST match WORKFLOW_STAGES in sep490-frontend (TeamSpec compliance engine).
 */

import matter from 'gray-matter';
import type { DataProvider } from '../providers/dataProvider.js';
import { mergeDeltaSpec, SPECS_DIR } from './specMerge.js';

export const CHANGES_DIR = 'openspec/changes';
export const SCHEMAS_DIR = 'openspec/schemas';
export const PERSONAS_DIR = 'sep-kit/agents';

export type SepMode = 'full' | 'fast' | 'minimal';
export type StepKey = 'spec' | 'brainstorm' | 'verify-spec' | 'apply' | 'test' | 'archived';
export type SchemaKey = 'feature' | 'bug-fix' | 'refactor';
export type Decision = 'approve' | 'reject';

interface StepDef {
  key: StepKey;
  label: string;
  command: string;
  /** Required artifacts for the feature schema — see SCHEMAS for overrides */
  artifacts: string[];
  /** Extra files the step may save (not required for passing) */
  optional?: string[];
  /** .opsx/instructions files shown as team rules for this step */
  instructions?: string[];
  guide: string;
}

export const SEP_STEPS: StepDef[] = [
  {
    key: 'spec',
    label: 'Spec',
    command: '/sep-spec',
    artifacts: ['.session.md', 'proposal.md'],
    guide: 'proposal.md: Vấn đề · Mục tiêu · Phạm vi (in/out of scope) · Người dùng liên quan · Tiêu chí thành công. Không đi vào kỹ thuật chi tiết.',
  },
  {
    key: 'brainstorm',
    label: 'Brainstorm',
    command: '/sep-brainstorm',
    artifacts: ['exploration.md', 'design-brief.md', 'specs.md'],
    optional: ['research.md'],
    instructions: ['instructions-exploration.md', 'instructions-specs.md'],
    guide: [
      'exploration.md: hiện trạng code, Assumptions, Non-Goals, ≥2 phương án (ưu/nhược), phương án chọn + lý do, rủi ro.',
      'design-brief.md: luồng UI/API, component/endpoint chính, trạng thái loading/empty/error, dữ liệu, quy tắc nghiệp vụ.',
      'specs.md (định dạng delta): "## ADDED|MODIFIED|REMOVED Requirements" → "### Requirement: REQ-xx <tên>" (MUST/SHALL) → "#### Scenario:" GIVEN/WHEN/THEN.',
      'research.md (tuỳ chọn): tra cứu thư viện/tài liệu ngoài nếu cần.',
    ].join('\n'),
  },
  {
    key: 'verify-spec',
    label: 'Verify Spec',
    command: '/sep-verify-spec',
    artifacts: ['review/skeptic.md', 'tasks.md'],
    optional: ['review/guardian.md', 'review/advocate.md', 'review/codebase.md'],
    instructions: ['instructions-review.md'],
    guide: [
      'Review bằng persona (sep_xem_persona): skeptic (bắt buộc) + guardian/advocate/codebase (khuyến nghị, chạy song song bằng sub-agent nếu IDE hỗ trợ).',
      'review/skeptic.md: chấm D1–D5, vấn đề HIGH/MEDIUM/LOW, kết luận Chấp nhận / Cần sửa. Lặp: sửa specs.md → review lại đến khi hết HIGH.',
      'tasks.md: checklist "- [ ] Tn — ..." theo thứ tự làm (DB → backend → frontend → test), mỗi task ≤ nửa ngày, tham chiếu REQ-xx.',
    ].join('\n'),
  },
  {
    key: 'apply',
    label: 'Apply',
    command: '/sep-apply',
    artifacts: [],
    guide: 'Code theo tasks.md. Mỗi task xong → tick "- [x]" và lưu lại tasks.md bằng sep_luu_artifact. Đủ tick hết mới sang /sep-test.',
  },
  {
    key: 'test',
    label: 'Test',
    command: '/sep-test',
    artifacts: ['test-report.md'],
    guide: 'test-report.md: frontmatter `verdict: PASS|FAIL`; bảng mỗi Scenario/REQ trong specs.md → test case → kết quả; lệnh test đã chạy + output tóm tắt; lỗi còn tồn đọng.',
  },
  {
    key: 'archived',
    label: 'Archive',
    command: '/sep-archive',
    artifacts: [],
    guide: 'Test PASS → sep_chuyen_trang_thai archived (tự merge specs.md vào openspec/specs/<capability>/spec.md), lưu bài học (luu_bai_hoc) nếu có.',
  },
];

interface SchemaDef {
  label: string;
  description: string;
  /** Per-step required artifacts overriding SEP_STEPS[].artifacts */
  artifacts: Partial<Record<StepKey, string[]>>;
}

export const SCHEMAS: Record<SchemaKey, SchemaDef> = {
  feature: {
    label: 'Feature',
    description: 'Chức năng mới / thay đổi hành vi có UI hoặc API mới.',
    artifacts: {},
  },
  'bug-fix': {
    label: 'Bug fix',
    description: 'Sửa lỗi: exploration = tái hiện + root cause; specs = hành vi đúng + regression scenario. Không cần design-brief.',
    artifacts: { brainstorm: ['exploration.md', 'specs.md'] },
  },
  refactor: {
    label: 'Refactor',
    description: 'Cải tổ code không đổi hành vi: specs = các bất biến (invariant) phải giữ nguyên. Không cần design-brief.',
    artifacts: { brainstorm: ['exploration.md', 'specs.md'] },
  },
};
export const SCHEMA_KEYS = Object.keys(SCHEMAS) as SchemaKey[];

export const LIFECYCLE_STATUSES = ['apply', 'archived'] as const;
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];

/** Steps that need an explicit Approve before the next step (archive is final) */
const APPROVABLE: StepKey[] = ['spec', 'brainstorm', 'verify-spec', 'apply', 'test'];

export const SEP_ARTIFACTS = [
  ...new Set(SEP_STEPS.flatMap(s => [...s.artifacts, ...(s.optional ?? [])]).filter(f => f !== '.session.md')),
];
const ALL_FILES = [...new Set(SEP_STEPS.flatMap(s => [...s.artifacts, ...(s.optional ?? [])]))];
const STEP_ORDER: StepKey[] = SEP_STEPS.map(s => s.key);

const LEGACY_STATUS: Record<string, StepKey> = {
  route: 'spec',
  design: 'brainstorm',
  review: 'verify-spec',
  tasks: 'verify-spec',
};

export function normalizeStatus(raw: string | null | undefined): StepKey {
  const s = (raw ?? '').trim();
  if ((STEP_ORDER as string[]).includes(s)) return s as StepKey;
  return LEGACY_STATUS[s] ?? 'spec';
}

export function normalizeSchema(raw: unknown): SchemaKey {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'bugfix' || s === 'bug') return 'bug-fix';
  return (SCHEMA_KEYS as string[]).includes(s) ? (s as SchemaKey) : 'feature';
}

export function artifactsFor(step: StepDef, schema: SchemaKey): string[] {
  return SCHEMAS[schema].artifacts[step.key] ?? step.artifacts;
}

export function parseTaskProgress(md: string | null): { done: number; total: number } | null {
  if (md === null) return null;
  const items = md.split('\n').filter(l => /^\s*[-*]\s+\[[ xX]\]/.test(l));
  return { done: items.filter(l => /^\s*[-*]\s+\[[xX]\]/.test(l)).length, total: items.length };
}

export function parseTestVerdict(md: string | null): 'PASS' | 'FAIL' | null {
  const fm = md?.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  const v = fm?.match(/^verdict:\s*["']?(pass|fail)["']?\s*$/im)?.[1];
  return v ? (v.toUpperCase() as 'PASS' | 'FAIL') : null;
}

interface Approval {
  by: string;
  at: string;
}

export interface ChangeState {
  status: StepKey;
  schema: SchemaKey;
  gate: boolean;
  approvals: Partial<Record<StepKey, Approval>>;
  files: Record<string, boolean>;
  tasks: { done: number; total: number } | null;
  verdict: 'PASS' | 'FAIL' | null;
}

function stepIndex(key: StepKey): number {
  return STEP_ORDER.indexOf(key);
}

export function stepByKey(key: StepKey): StepDef {
  return SEP_STEPS[stepIndex(key)];
}

/** null = passed, otherwise the reason it is not */
export function stepGap(step: StepDef, st: Pick<ChangeState, 'status' | 'schema' | 'files' | 'tasks' | 'verdict'>): string | null {
  const missing = artifactsFor(step, st.schema).filter(f => !st.files[f]);
  if (missing.length > 0) return `thiếu ${missing.join(', ')}`;
  switch (step.key) {
    case 'apply':
      if (!st.tasks || st.tasks.total === 0) return 'tasks.md chưa có task nào';
      if (st.tasks.done < st.tasks.total) return `còn ${st.tasks.total - st.tasks.done}/${st.tasks.total} task chưa tick`;
      if (stepIndex(st.status) < stepIndex('apply')) return 'chưa chuyển sang apply';
      return null;
    case 'test':
      return st.verdict === 'PASS' ? null : `test-report.md verdict = ${st.verdict ?? 'chưa có'} (cần PASS)`;
    case 'archived':
      return st.status === 'archived' ? null : 'chưa archive';
    default:
      return null;
  }
}

function needsApproval(step: StepDef, st: ChangeState): boolean {
  return st.gate && APPROVABLE.includes(step.key) && !st.approvals[step.key];
}

export type NextAction = { kind: 'work'; step: StepDef; gap: string } | { kind: 'approve'; step: StepDef } | null;

export function nextAction(st: ChangeState): NextAction {
  for (const step of SEP_STEPS) {
    const gap = stepGap(step, st);
    if (gap) return { kind: 'work', step, gap };
    if (needsApproval(step, st)) return { kind: 'approve', step };
  }
  return null;
}

export interface ActiveChangeStore {
  get(): Promise<string | null>;
  set(name: string): Promise<void>;
}

export interface SepWorkflowOptions {
  /** Default assignee (GitHub username) when the caller does not pass one */
  defaultAssignee?: string;
  defaultProject?: string;
  /** Remembers the change the user is working on so tools can omit tenChange */
  activeStore?: ActiveChangeStore;
  /** Called after files are written (e.g. git commit in local mode). Paths are KB-relative. forcePush is true at key checkpoints. */
  afterWrite?: (files: string[], message: string, forcePush?: boolean) => Promise<string | null>;
  /** Optional callback to trigger schema sync when apply step is approved */
  onApplyApprove?: () => Promise<{ files: string[]; note: string } | null>;
}

export function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function stamp(): string {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function stepOf(file: string): StepDef | undefined {
  return SEP_STEPS.find(s => s.artifacts.includes(file) || s.optional?.includes(file));
}

/** Parse a YAML document with gray-matter's bundled js-yaml */
function parseYaml(raw: string | null): Record<string, any> {
  if (!raw) return {};
  try {
    return matter(`---\n${raw.replace(/^---\r?\n/, '')}\n---\n`).data;
  } catch {
    return {};
  }
}

export interface ChangeInfo {
  name: string;
  assignee: string;
  project: string;
  capability: string;
  state: ChangeState;
  steps: Array<{ key: StepKey; label: string; command: string; gap: string | null; approved: boolean | null }>;
  passed: number;
  pct: number;
  next: NextAction;
}

export function createSepWorkflow(provider: DataProvider, options: SepWorkflowOptions = {}) {
  const base = (name: string) => `${CHANGES_DIR}/${name}`;
  const rel = (name: string, files: string[]) => files.map(f => `${base(name)}/${f}`);
  /** Providers that commit per write (GitHub) get a sep(<change>) message */
  const write = (p: string, content: string) => {
    const m = p.match(/^openspec\/changes\/([^/]+)\/(.+)$/);
    return provider.writeFile(p, content, { message: m ? `sep(${m[1]}): update ${m[2]}` : `sep: update ${p}` });
  };

  function assertChangeName(name: string): string {
    const slug = toSlug(name);
    if (!slug) throw new Error('Tên change không hợp lệ.');
    return slug;
  }

  async function changeExists(name: string): Promise<boolean> {
    return provider.fileExists(`${base(name)}/.session.md`);
  }

  async function resolveName(input?: string): Promise<string> {
    if (input?.trim()) return assertChangeName(input);
    const active = await options.activeStore?.get();
    if (active && (await changeExists(active))) return active;
    throw new Error('Chưa chỉ định change. Truyền tenChange, hoặc chọn change đang làm bằng sep_chon_change (xem danh sách: sep_danh_sach_change).');
  }

  async function readSession(name: string): Promise<{ data: Record<string, any>; content: string } | null> {
    const raw = await provider.readFile(`${base(name)}/.session.md`);
    if (!raw) return null;
    const parsed = matter(raw);
    return { data: parsed.data, content: parsed.content };
  }

  async function writeSession(name: string, data: Record<string, any>, content: string): Promise<void> {
    await write(`${base(name)}/.session.md`, matter.stringify(content, data));
  }

  async function loadState(name: string): Promise<ChangeState> {
    const [status, tasksMd, reportMd, session, ...exists] = await Promise.all([
      provider.readFile(`${base(name)}/.status`),
      provider.readFile(`${base(name)}/tasks.md`),
      provider.readFile(`${base(name)}/test-report.md`),
      readSession(name),
      ...ALL_FILES.map(f => provider.fileExists(`${base(name)}/${f}`)),
    ]);
    const fm = session?.data ?? {};
    return {
      status: normalizeStatus(status),
      schema: normalizeSchema(fm.schema),
      gate: fm.gate === true,
      approvals: (fm.approvals && typeof fm.approvals === 'object' ? fm.approvals : {}) as ChangeState['approvals'],
      files: Object.fromEntries(ALL_FILES.map((f, i) => [f, exists[i]])),
      tasks: parseTaskProgress(tasksMd),
      verdict: parseTestVerdict(reportMd),
    };
  }

  async function inspectChange(name: string): Promise<ChangeInfo> {
    const [st, session] = await Promise.all([loadState(name), readSession(name)]);
    const fm = session?.data ?? {};
    const steps = SEP_STEPS.map(s => ({
      key: s.key,
      label: s.label,
      command: s.command,
      gap: stepGap(s, st),
      approved: st.gate && APPROVABLE.includes(s.key) ? Boolean(st.approvals[s.key]) : null,
    }));
    const passed = steps.filter(s => s.gap === null).length;
    return {
      name,
      assignee: String(fm.assignee ?? 'unassigned'),
      project: String(fm.project ?? '-'),
      capability: toSlug(String(fm.capability ?? '')) || name,
      state: st,
      steps,
      passed,
      pct: Math.round((passed / SEP_STEPS.length) * 100),
      next: nextAction(st),
    };
  }

  async function listChangeNames(): Promise<string[]> {
    const files = await provider.listFiles(CHANGES_DIR, '.session.md');
    return [...new Set(
      files
        .map(f => f.replace(/\\/g, '/'))
        .filter(f => /^openspec\/changes\/[^/]+\/\.session\.md$/.test(f))
        .map(f => f.split('/')[2]),
    )].sort();
  }

  /** Throws unless every step before `target` has passed (and, with gate, been approved) */
  function requireStepsBefore(target: StepKey, st: ChangeState, action: string): void {
    for (const step of SEP_STEPS.slice(0, stepIndex(target))) {
      const gap = stepGap(step, st);
      if (gap) {
        throw new Error(
          `⛔ Không thể ${action}: bước ${step.label} chưa xong (${gap}). ` +
          `Chạy ${step.command} trước — TeamSpec đánh dấu BLOCKED nếu skip bước.`,
        );
      }
      if (needsApproval(step, st)) {
        throw new Error(
          `⛔ Không thể ${action}: bước ${step.label} chưa được duyệt. ` +
          `Tóm tắt kết quả bước ${step.label} cho user, hỏi Approve/Reject rồi gọi sep_duyet_buoc.`,
        );
      }
    }
  }

  async function writeStatus(name: string, st: ChangeState, key: StepKey): Promise<boolean> {
    if (stepIndex(key) <= stepIndex(st.status)) return false;
    await write(`${base(name)}/.status`, `${key}\n`);
    return true;
  }

  async function appendLog(name: string, line: string): Promise<void> {
    const session = await readSession(name);
    if (!session) return;
    const body = session.content.includes('\n## Nhật ký') ? session.content.trimEnd() : `${session.content.trimEnd()}\n\n## Nhật ký`;
    await writeSession(name, session.data, `${body}\n- ${stamp()} · ${line}\n`);
  }

  async function appendSection(path: string, title: string, heading: string, body: string): Promise<void> {
    const existing = (await provider.readFile(path))?.trimEnd() || `# ${title}`;
    await write(path, `${existing}\n\n## ${heading}\n\n${body.trim()}\n`);
  }

  async function schemaInstructions(schema: SchemaKey, files: string[]): Promise<string[]> {
    const doc = parseYaml(await provider.readFile(`${SCHEMAS_DIR}/${schema}/schema.yaml`));
    const artifacts = (doc.artifacts ?? {}) as Record<string, unknown>;
    return files.filter(f => typeof artifacts[f] === 'string').map(f => `- **${f}**: ${String(artifacts[f]).trim()}`);
  }

  async function projectContext(): Promise<string | null> {
    const cfg = parseYaml(await provider.readFile('openspec/config.yaml'));
    const parts: string[] = [];
    if (typeof cfg.context === 'string') parts.push(cfg.context.trim());
    if (cfg.rules && typeof cfg.rules === 'object') {
      for (const [k, v] of Object.entries(cfg.rules as Record<string, unknown>)) {
        const items = Array.isArray(v) ? v : [v];
        parts.push(`${k}:\n${items.map(i => `- ${String(i)}`).join('\n')}`);
      }
    }
    return parts.length ? parts.join('\n\n') : null;
  }

  async function stepGuide(action: Exclude<NextAction, null>, name: string, st: ChangeState): Promise<string> {
    const { step } = action;
    if (action.kind === 'approve') {
      return [
        `## Chờ duyệt: bước ${step.label}`,
        `Bước ${step.label} đã đủ artifact. Tóm tắt kết quả cho user và hỏi **Approve / Reject**, rồi gọi:`,
        `\`sep_duyet_buoc({ tenChange: "${name}", buoc: "${step.key}", quyetDinh: "approve" | "reject", tomTat: "...", caiTien: "..." })\``,
      ].join('\n');
    }

    const files = [...artifactsFor(step, st.schema), ...(step.optional ?? [])].filter(f => f !== '.session.md');
    const lines = [
      `## Bước tiếp theo: ${step.label} — chạy \`${step.command} ${name}\``,
      `Còn thiếu: ${action.gap}`,
      `Schema: **${st.schema}** — ${SCHEMAS[st.schema].description}`,
      '',
      step.guide,
    ];
    const schemaRules = await schemaInstructions(st.schema, files);
    if (schemaRules.length) lines.push('', `Hướng dẫn artifact (openspec/schemas/${st.schema}):`, ...schemaRules);
    if (step.key === 'brainstorm' || step.key === 'verify-spec') {
      const ctx = await projectContext();
      if (ctx) lines.push('', 'Bối cảnh dự án (openspec/config.yaml):', ctx);
    }
    for (const file of step.instructions ?? []) {
      const instr = await provider.readFile(`.opsx/instructions/${file}`);
      if (instr) lines.push('', `Quy tắc của team (${file}):`, instr.trim());
    }
    if (files.length > 0) {
      lines.push('', `Lưu bằng: \`sep_luu_artifact({ tenChange: "${name}", file: "<tên file>", noiDung: "..." })\``);
    }
    return lines.join('\n');
  }

  async function summarize(name: string): Promise<string> {
    const info = await inspectChange(name);
    const st = info.state;
    const rows = SEP_STEPS.map((s, i) => {
      const { gap, approved } = info.steps[i];
      const required = artifactsFor(s, st.schema);
      const optional = (s.optional ?? []).filter(f => st.files[f]);
      const files = [
        ...required.map(f => `${st.files[f] ? '✅' : '⬜'} ${f}`),
        ...optional.map(f => `➕ ${f}`),
      ].join('  ') || '—';
      const approval = approved === null ? '' : approved ? ' · 👍 duyệt' : gap ? '' : ' · ⏳ chờ duyệt';
      return `| ${gap ? '⬜' : '✅'} ${s.label} | \`${s.command}\` | ${files} | ${gap ?? 'xong'}${approval} |`;
    });

    const lines = [
      `# Change: ${name}`,
      `- Assignee: @${info.assignee} · Schema: ${st.schema} · Project: ${info.project} · Capability: ${info.capability}${st.gate ? ' · Gate: bật' : ''}`,
      `- Bước hiện tại (.status): **${st.status}** · Compliance: **${info.pct}%** (${info.passed}/${SEP_STEPS.length} bước)`,
      '',
      '| Bước | Lệnh | Artifacts | Tình trạng |',
      '|------|------|-----------|------------|',
      ...rows,
      '',
      info.next ? await stepGuide(info.next, name, st) : '🎉 Change đã hoàn tất cả 6 bước.',
    ];
    return lines.join('\n');
  }

  async function commit(files: string[], message: string, forcePush = false): Promise<string | null> {
    return (await options.afterWrite?.(files, message, forcePush)) ?? null;
  }

  function reply(head: string, git: string | null, body: string): string {
    return [head, git ? `Git: ${git}` : '', '', body].filter((l, i) => l || i === 2).join('\n');
  }

  // ── Tool handlers ───────────────────────────────────────────────────────────

  async function handleTaoChange(params: {
    moTa: string;
    tenChange?: string;
    assignee?: string;
    mode?: SepMode;
    schema?: SchemaKey;
    capability?: string;
    project?: string;
  }): Promise<string> {
    const name = assertChangeName(params.tenChange || params.moTa);
    const assignee = (params.assignee || options.defaultAssignee || '').trim();
    if (!assignee) {
      throw new Error('Thiếu assignee. Truyền assignee (GitHub username) hoặc đặt SEP_ASSIGNEE trong cấu hình MCP (chạy lại npm run sep:install).');
    }
    if (await changeExists(name)) {
      await options.activeStore?.set(name);
      return `⚠️ Change \`${name}\` đã tồn tại — không tạo mới (đã chọn làm change đang làm).\n\n${await summarize(name)}`;
    }

    const schema = normalizeSchema(params.schema);
    const session = matter.stringify(
      `\n# Session: ${name}\n\n${params.moTa.trim()}\n\n## Nhật ký\n- ${stamp()} · tạo change (${schema}) · @${assignee}\n`,
      {
        assignee,
        mode: params.mode ?? 'full',
        schema,
        capability: toSlug(params.capability || '') || name,
        project: params.project || options.defaultProject || 'MT-GRMS',
        gate: true,
        started_at: nowIso(),
      },
    );

    await write(`${base(name)}/.session.md`, session);
    await write(`${base(name)}/.status`, 'spec\n');
    await options.activeStore?.set(name);
    const git = await commit(rel(name, ['.session.md', '.status']), `sep(${name}): tạo change`);
    return reply(`✅ Đã tạo change \`${name}\` tại \`${base(name)}/\` (đang làm)`, git, await summarize(name));
  }

  async function handleLuuArtifact(params: { tenChange?: string; file: string; noiDung: string }): Promise<string> {
    const name = await resolveName(params.tenChange);
    const file = params.file.replace(/\\/g, '/').replace(/^\.\//, '');
    if (!(await changeExists(name))) {
      throw new Error(`Không tìm thấy change \`${name}\`. Tạo bằng /sep-spec trước.`);
    }
    const step = stepOf(file);
    if (!step || file === '.session.md') {
      throw new Error(`File không hợp lệ: ${file}. Chỉ nhận: ${SEP_ARTIFACTS.join(', ')}`);
    }
    const content = params.noiDung.trimEnd() + '\n';
    if (!content.trim()) throw new Error('noiDung đang trống.');

    const st = await loadState(name);
    if (st.status === 'archived') throw new Error(`⛔ Change \`${name}\` đã archive — không sửa artifact nữa.`);
    const required = artifactsFor(step, st.schema);
    if (!required.includes(file) && !step.optional?.includes(file)) {
      throw new Error(`⛔ Schema ${st.schema} không dùng ${file}. Bước ${step.label} cần: ${required.join(', ')}`);
    }
    requireStepsBefore(step.key, st, `lưu ${file}`);
    if (file === 'test-report.md' && !parseTestVerdict(content)) {
      throw new Error('⛔ test-report.md phải có frontmatter `verdict: PASS` hoặc `verdict: FAIL` ở đầu file.');
    }
    if (file === 'tasks.md' && !parseTaskProgress(content)?.total) {
      throw new Error('⛔ tasks.md phải có ít nhất một task dạng checklist `- [ ] ...`.');
    }

    const isUpdate = st.files[file];
    await write(`${base(name)}/${file}`, content);

    const written = [file];
    if (required.includes(file) && (await writeStatus(name, st, step.key))) written.push('.status');
    await appendLog(name, `${isUpdate ? 'cập nhật' : 'tạo'} ${file}`);
    written.push('.session.md');
    await options.activeStore?.set(name);

    const git = await commit(rel(name, written), `sep(${name}): ${isUpdate ? 'update' : 'add'} ${file}`);
    return reply(`✅ Đã ${isUpdate ? 'cập nhật' : 'lưu'} \`${file}\``, git, await summarize(name));
  }

  async function handleXemChange(params: { tenChange?: string }): Promise<string> {
    let name: string;
    try {
      name = await resolveName(params.tenChange);
    } catch (err: any) {
      return `${err.message}\n\n${await handleDanhSachChange({})}`;
    }
    if (!(await changeExists(name))) {
      return `Không tìm thấy change \`${name}\`.\n\n${await handleDanhSachChange({})}`;
    }
    return summarize(name);
  }

  async function handleChonChange(params: { tenChange: string }): Promise<string> {
    const name = assertChangeName(params.tenChange);
    if (!(await changeExists(name))) throw new Error(`Không tìm thấy change \`${name}\`.`);
    await options.activeStore?.set(name);
    return `📌 Change đang làm: \`${name}\` — các tool sep_* có thể bỏ trống tenChange.\n\n${await summarize(name)}`;
  }

  async function handleDanhSachChange(input: { assignee?: string }): Promise<string> {
    const requested = input.assignee?.trim() || options.defaultAssignee?.trim() || '';
    const filter = requested === '*' ? undefined : requested || undefined;
    const active = await options.activeStore?.get();

    const rows: string[] = [];
    for (const name of await listChangeNames()) {
      const info = await inspectChange(name);
      if (filter && info.assignee.toLowerCase() !== filter.toLowerCase()) continue;
      const next = info.next
        ? info.next.kind === 'work' ? `\`${info.next.step.command} ${name}\`` : `duyệt bước ${info.next.step.label}`
        : '—';
      rows.push(`| ${name === active ? '📌 ' : ''}${name} | @${info.assignee} | ${info.state.schema} | ${info.state.status} | ${info.pct}% | ${next} |`);
    }

    if (rows.length === 0) {
      return filter
        ? `@${filter} chưa có change nào. Bắt đầu bằng /sep-spec <mô tả chức năng>.`
        : 'Chưa có change nào trong openspec/changes/.';
    }
    return ['| Change | Assignee | Schema | Bước | Compliance | Việc tiếp theo |', '|---|---|---|---|---|---|', ...rows].join('\n');
  }

  async function handleDuyetBuoc(params: {
    tenChange?: string;
    buoc?: StepKey;
    quyetDinh: Decision;
    tomTat: string;
    caiTien?: string;
    nguoiDuyet?: string;
  }): Promise<string> {
    const name = await resolveName(params.tenChange);
    const st = await loadState(name);
    if (!st.gate) return `ℹ️ Change \`${name}\` được tạo trước khi có gate duyệt — không cần sep_duyet_buoc.`;
    if (params.quyetDinh !== 'approve' && params.quyetDinh !== 'reject') throw new Error('quyetDinh chỉ nhận: approve | reject');
    if (!params.tomTat?.trim()) throw new Error('Cần tomTat: tóm tắt kết quả bước (lưu vào summary.md).');

    const key = params.buoc ?? SEP_STEPS.find(s => needsApproval(s, st))?.key;
    if (!key || !APPROVABLE.includes(key)) throw new Error(`Không còn bước nào chờ duyệt. buoc hợp lệ: ${APPROVABLE.join(', ')}`);
    const step = stepByKey(key);
    const gap = stepGap(step, st);
    if (gap) throw new Error(`⛔ Bước ${step.label} chưa xong (${gap}) — chưa thể duyệt.`);
    requireStepsBefore(key, st, `duyệt bước ${step.label}`);

    const by = (params.nguoiDuyet || options.defaultAssignee || 'user').trim();
    const session = await readSession(name);
    if (!session) throw new Error(`Không đọc được .session.md của \`${name}\`.`);
    const written = ['.session.md', 'summary.md'];

    if (params.quyetDinh === 'approve') {
      session.data.approvals = { ...(session.data.approvals ?? {}), [key]: { by, at: nowIso() } };
    } else {
      session.data.rejections = { ...(session.data.rejections ?? {}), [key]: Number(session.data.rejections?.[key] ?? 0) + 1 };
    }
    await writeSession(name, session.data, session.content);

    const verdict = params.quyetDinh === 'approve' ? '✅ Approve' : '❌ Reject';
    await appendSection(`${base(name)}/summary.md`, `Summary: ${name}`, `${step.label} — ${verdict} bởi @${by} · ${stamp()}`, params.tomTat);
    if (params.caiTien?.trim()) {
      await appendSection(`${base(name)}/improvements.md`, `Improvements: ${name}`, `${step.label} · ${stamp()}`, params.caiTien);
      written.push('improvements.md');
    }
    await appendLog(name, `${params.quyetDinh === 'approve' ? 'duyệt' : 'từ chối'} bước ${step.label} · @${by}`);

    let autoDbSyncNote = '';
    if (key === 'apply' && params.quyetDinh === 'approve' && options.onApplyApprove) {
      try {
        const syncRes = await options.onApplyApprove();
        if (syncRes?.files?.length) {
          written.push(...syncRes.files);
          autoDbSyncNote = `\n${syncRes.note}`;
        }
      } catch (err: any) {
        autoDbSyncNote = `\n⚠️ db-sync cảnh báo: ${err.message}`;
      }
    }

    const isCheckpoint1 = key === 'verify-spec' && params.quyetDinh === 'approve';
    const git = await commit(rel(name, written), `sep(${name}): ${params.quyetDinh} ${key}`, isCheckpoint1);
    const head = params.quyetDinh === 'approve'
      ? `✅ Đã duyệt bước ${step.label}.${autoDbSyncNote}`
      : `❌ Bước ${step.label} bị từ chối — sửa artifact theo góp ý rồi hỏi duyệt lại.`;
    return reply(head, git, await summarize(name));
  }

  async function archiveSpecs(name: string, info: ChangeInfo): Promise<{ files: string[]; note: string }> {
    const delta = await provider.readFile(`${base(name)}/specs.md`);
    if (!delta) return { files: [], note: 'Không có specs.md — bỏ qua merge spec gốc.' };
    const target = `${SPECS_DIR}/${info.capability}/spec.md`;
    const result = mergeDeltaSpec(await provider.readFile(target), delta, {
      capability: info.capability,
      change: name,
      date: new Date().toISOString().slice(0, 10),
    });
    await write(target, result.content);
    const note = [
      `📚 Đã merge specs vào \`${target}\`: +${result.added.length} ~${result.modified.length} -${result.removed.length}`,
      ...result.warnings.map(w => `  ⚠️ ${w}`),
    ].join('\n');
    return { files: [target], note };
  }

  async function handleChuyenTrangThai(params: { tenChange?: string; trangThai: LifecycleStatus }): Promise<string> {
    const name = await resolveName(params.tenChange);
    if (!(await changeExists(name))) throw new Error(`Không tìm thấy change \`${name}\`.`);
    if (!LIFECYCLE_STATUSES.includes(params.trangThai)) {
      throw new Error(`trangThai chỉ nhận: ${LIFECYCLE_STATUSES.join(', ')}`);
    }

    const st = await loadState(name);
    if (st.status === 'archived') throw new Error(`Change \`${name}\` đã archive.`);
    requireStepsBefore(params.trangThai, st, `chuyển sang ${params.trangThai}`);

    const moved = await writeStatus(name, st, params.trangThai);
    if (!moved) return `ℹ️ \`${name}\` đã ở bước ${st.status}.\n\n${await summarize(name)}`;

    const extra: string[] = [];
    let note = '';
    if (params.trangThai === 'archived') {
      const merged = await archiveSpecs(name, await inspectChange(name));
      extra.push(...merged.files);
      note = merged.note;
    }
    await appendLog(name, `chuyển bước → ${params.trangThai}`);
    const isCheckpoint2 = params.trangThai === 'archived';
    const git = await commit([...rel(name, ['.status', '.session.md']), ...extra], `sep(${name}): ${params.trangThai}`, isCheckpoint2);
    return reply([`✅ \`${name}\` → **${params.trangThai}**`, note].filter(Boolean).join('\n'), git, await summarize(name));
  }

  async function handleLuiBuoc(params: {
    tenChange?: string;
    buocMoi?: StepKey;
    lyDo?: string;
  }): Promise<string> {
    const name = await resolveName(params.tenChange);
    if (!(await changeExists(name))) throw new Error(`Không tìm thấy change \`${name}\`.`);

    const st = await loadState(name);
    if (st.status === 'archived') throw new Error(`Change \`${name}\` đã archive — không thể lùi bước.`);

    const next = nextAction(st);
    const currentKey = next ? next.step.key : st.status;
    const currentStep = stepByKey(currentKey);
    const currentIndex = stepIndex(currentKey);

    let targetKey: StepKey;

    if (params.buocMoi) {
      const targetIndex = stepIndex(params.buocMoi);
      if (targetIndex >= currentIndex) {
        throw new Error(
          `⛔ Không thể lùi: bước mục tiêu '${params.buocMoi}' không nằm trước bước hiện tại '${currentKey}'. ` +
          `Các bước có thể lùi về: ${SEP_STEPS.slice(0, currentIndex).map(s => s.key).join(', ')}.`
        );
      }
      targetKey = params.buocMoi;
    } else {
      if (currentIndex <= 0) {
        throw new Error(`⛔ Change \`${name}\` đang ở bước đầu tiên ('${currentKey}'), không thể lùi thêm.`);
      }
      targetKey = SEP_STEPS[currentIndex - 1].key;
    }

    const targetStep = stepByKey(targetKey);

    // 1. Cập nhật .status tương ứng với targetKey
    const targetStatus: StepKey = stepIndex(targetKey) < stepIndex('apply') ? 'spec' : 'apply';
    await write(`${base(name)}/.status`, `${targetStatus}\n`);

    // 2. Reset approval gate cho các bước từ targetKey trở đi
    const session = await readSession(name);
    if (session) {
      if (session.data.approvals && typeof session.data.approvals === 'object') {
        for (const step of SEP_STEPS.slice(stepIndex(targetKey))) {
          delete session.data.approvals[step.key];
        }
      }
      const reason = params.lyDo?.trim() ? ` (lý do: ${params.lyDo.trim()})` : '';
      await appendLog(name, `lùi bước: ${currentKey} ➔ ${targetKey}${reason}`);
      await writeSession(name, session.data, session.content);
    }

    const git = await commit(rel(name, ['.status', '.session.md']), `sep(${name}): lui buoc ve ${targetKey}`);
    const head = [
      `⏪ Đã lùi change \`${name}\` từ **${currentStep.label}** (\`${currentKey}\`) về **${targetStep.label}** (\`${targetKey}\`).`,
      `ℹ️ Toàn bộ artifact cũ vẫn được giữ nguyên để bạn chỉnh sửa tiếp.`,
      `🔓 Cổng duyệt của bước ${targetStep.label} đã được mở lại để bạn duyệt sau khi cập nhật xong.`,
    ].join('\n');

    return reply(head, git, await summarize(name));
  }

  async function handleXemPersona(params: { ten?: string }): Promise<string> {
    const files = (await provider.listFiles(PERSONAS_DIR, '*.md'))
      .map(f => f.replace(/\\/g, '/').split('/').pop()!.replace(/\.md$/, ''))
      .filter(n => n.toLowerCase() !== 'readme')
      .sort();
    const wanted = toSlug(params.ten ?? '');
    if (!wanted) {
      return `Persona có sẵn: ${files.join(', ')}.\nGọi sep_xem_persona({ ten: "<tên>" }) để lấy prompt đầy đủ.`;
    }
    const raw = await provider.readFile(`${PERSONAS_DIR}/${wanted}.md`);
    if (!raw) return `Không có persona "${wanted}". Có sẵn: ${files.join(', ')}.`;
    return raw;
  }

  async function handleDongBoTestSheet(params: {
    tenChange?: string;
    reportTypes?: string[];
    featureCode?: string;
    featureName?: string;
    tabName?: string;
    tester?: string;
    items?: Array<Record<string, any>>;
  }): Promise<string> {
    const name = await resolveName(params.tenChange);
    const reportMd = await provider.readFile(`${base(name)}/test-report.md`);

    let testItems = params.items && params.items.length > 0 ? params.items : [];
    if (testItems.length === 0) {
      if (!reportMd) {
        throw new Error(`Change \`${name}\` chưa có test-report.md và không truyền testItems. Hãy hoàn thành /sep-test trước.`);
      }
      testItems = parseTestReportMarkdown(reportMd);
    }

    if (testItems.length === 0) {
      throw new Error(`Không tìm thấy kịch bản test nào trong test-report.md của \`${name}\`. Hãy đảm bảo test-report.md có bảng kịch bản test.`);
    }

    // Tự động đọc specs.md của change để bổ sung GIVEN, WHEN, THEN, Role, Priority (tránh N/A trên Sheet)
    let specScenarios: SpecScenario[] = [];
    const specsMd = await provider.readFile(`${base(name)}/specs.md`);
    if (specsMd) {
      specScenarios = parseSpecsScenarios(specsMd);
    }

    testItems = testItems.map(item => {
      const match = findBestMatchingScenario(item, specScenarios);
      const fallbackGiven = match?.given || 'Môi trường và dữ liệu khởi tạo sẵn sàng cho tính năng';
      const fallbackWhen = match?.when || 'Thực hiện thao tác kịch bản theo yêu cầu nghiệp vụ';
      const fallbackThen = match?.then || 'Hệ thống phản hồi đúng quy tắc nghiệp vụ';
      const fallbackRole = match?.role || 'StoreOwner';
      const fallbackPriority = match?.priority || 'High';
      const fallbackType = match?.type || 'Normal';

      return {
        ...item,
        preConditions: item.preConditions || item.given || fallbackGiven,
        given: item.given || item.preConditions || fallbackGiven,
        inputParams: item.inputParams || item.steps || item.procedure || fallbackWhen,
        steps: item.steps || item.procedure || item.inputParams || fallbackWhen,
        procedure: item.procedure || item.steps || fallbackWhen,
        when: item.when || item.procedure || item.steps || fallbackWhen,
        expectedResults: item.expectedResults || item.expected || fallbackThen,
        expected: item.expected || item.expectedResults || fallbackThen,
        then: item.then || item.expected || item.expectedResults || fallbackThen,
        type: item.type || fallbackType,
        role: item.role || fallbackRole,
        actor: item.actor || item.role || fallbackRole,
        priority: item.priority || fallbackPriority,
        scenario: item.scenario || match?.title || item.description || 'Kịch bản kiểm thử tính năng',
        description: item.description || match?.title || item.scenario || 'Kịch bản kiểm thử tính năng',
        notes: item.notes || item.feedback || '',
        feedback: item.feedback || item.notes || '',
      };
    });

    let featureCode = params.featureCode?.trim();
    if (!featureCode) {
      const match = name.match(/fe-?(\d+)/i);
      featureCode = match ? `FE-${match[1].padStart(2, '0')}` : name;
    }
    const session = await readSession(name);
    const featureName = params.featureName?.trim() || session?.data?.capability || name;

    let webAppUrl = process.env.GOOGLE_SHEET_WEBAPP_URL?.trim();
    let apiKey = process.env.GOOGLE_SHEET_API_KEY?.trim() || 'MT_GRMS_TEST_SECRET_2026';
    const tester = params.tester?.trim() || process.env.GOOGLE_SHEET_DEFAULT_TESTER?.trim() || options.defaultAssignee || 'AI-Agent';

    if (!webAppUrl) {
      const envRaw = await provider.readFile('.env');
      if (envRaw) {
        const urlMatch = envRaw.match(/GOOGLE_SHEET_WEBAPP_URL\s*=\s*(.+)/);
        if (urlMatch) webAppUrl = urlMatch[1].trim().replace(/^["']|["']$/g, '');
        const keyMatch = envRaw.match(/GOOGLE_SHEET_API_KEY\s*=\s*(.+)/);
        if (keyMatch) apiKey = keyMatch[1].trim().replace(/^["']|["']$/g, '');
      }
    }

    if (!webAppUrl) {
      return [
        `⚠️ **Chưa cấu hình GOOGLE_SHEET_WEBAPP_URL**!`,
        '',
        `Để đồng bộ kết quả lên Google Sheets, bạn cần:`,
        `1. Triển khai Google Apps Script theo hướng dẫn tại: [README.md](file:///d:/Sourse_code_Do_An/ai-team-kit/team-ai-knowledge/scripts/google-apps-script/README.md).`,
        `2. Điền biến \`GOOGLE_SHEET_WEBAPP_URL\` và \`GOOGLE_SHEET_API_KEY\` vào file \`.env\` tại gốc \`team-ai-knowledge\`.`,
      ].join('\n');
    }

    const allowedTypes = params.reportTypes && params.reportTypes.length > 0
      ? params.reportTypes.map(t => String(t).trim())
      : null;

    const grouped: Record<string, Array<Record<string, any>>> = {};
    for (const item of testItems) {
      const rType = String(item.reportType || '5.1').trim();
      if (allowedTypes && !allowedTypes.includes(rType)) continue;
      if (!grouped[rType]) grouped[rType] = [];
      grouped[rType].push(item);
    }

    const reportKeys = Object.keys(grouped);
    if (reportKeys.length === 0) {
      return `ℹ️ Không có kịch bản nào thuộc các loại report yêu cầu (${allowedTypes ? allowedTypes.join(', ') : 'tất cả'}).`;
    }

    const results: Array<{ reportType: string; tab: string; updated: number; inserted: number; total: number; success: boolean; message: string }> = [];

    for (const rType of reportKeys) {
      try {
        const payload = {
          apiKey,
          reportType: rType,
          featureCode,
          featureName,
          tabName: params.tabName || featureCode,
          tester,
          items: grouped[rType],
        };

        const res = await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        const data = (await res.json()) as any;
        if (data && data.success) {
          results.push({
            reportType: rType,
            tab: data.data?.tab || featureCode,
            updated: data.data?.updated ?? 0,
            inserted: data.data?.inserted ?? 0,
            total: data.data?.total ?? 0,
            success: true,
            message: data.message || 'OK',
          });
        } else {
          results.push({
            reportType: rType,
            tab: featureCode,
            updated: 0,
            inserted: 0,
            total: 0,
            success: false,
            message: data?.message || 'Lỗi không xác định từ Apps Script',
          });
        }
      } catch (err: any) {
        results.push({
          reportType: rType,
          tab: featureCode,
          updated: 0,
          inserted: 0,
          total: 0,
          success: false,
          message: err.message,
        });
      }
    }

    const reportNames: Record<string, string> = {
      '5.1': 'Report-5.1 (Unit Test)',
      '5.2': 'Report-5.2 (Integration Test)',
      '5.3': 'Report-5.3 (System Test FRs)',
      '5.4': 'Report-5.4 (System Test NFRs)',
      '5.5': 'Report-5.5 (Acceptance Test)',
    };

    const lines = [
      `### 📊 Kết quả đồng bộ kiểm thử lên Google Sheets`,
      `Feature: **${featureCode}** (${featureName}) · Tester: \`${tester}\``,
      '',
      `| Report | Tab / Sheet | Cập nhật | Thêm mới | Tổng | Trạng thái |`,
      `|---|---|---|---|---|---|`,
      ...results.map(r => {
        const nameLabel = reportNames[r.reportType] || `Report-${r.reportType}`;
        const statusIcon = r.success ? '✅ Thành công' : `❌ Thất bại: ${r.message}`;
        return `| **${nameLabel}** | \`${r.tab}\` | ${r.updated} | ${r.inserted} | ${r.total} | ${statusIcon} |`;
      }),
    ];

    return lines.join('\n');
  }

  return {
    inspectChange,
    listChangeNames,
    handleTaoChange,
    handleLuuArtifact,
    handleXemChange,
    handleChonChange,
    handleDanhSachChange,
    handleDuyetBuoc,
    handleChuyenTrangThai,
    handleLuiBuoc,
    handleXemPersona,
    handleDongBoTestSheet,
  };
}

function cleanHeaderStr(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Trích xuất các test case từ bảng markdown trong test-report.md
 * Hỗ trợ cả Unified Test Table (10 cột chuẩn BDD) lẫn Legacy Table (5-6 cột).
 */
export function parseTestReportMarkdown(md: string): Array<Record<string, any>> {
  const lines = md.split(/\r?\n/);
  const items: Array<Record<string, any>> = [];

  let inTable = false;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) {
      if (inTable && items.length > 0) break;
      continue;
    }

    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length === 0) continue;

    if (!inTable) {
      const cleaned = cells.map(cleanHeaderStr);
      const isHeader = cleaned.some(c =>
        c.includes('test') || c.includes('req') || c.includes('scenario') ||
        c.includes('kich ban') || c.includes('ket qua') || c.includes('status') ||
        c.includes('verdict') || c.includes('id') || c.includes('report')
      );
      if (isHeader) {
        headers = cleaned;
        inTable = true;
        continue;
      }
    }

    if (inTable) {
      if (cells.every(c => /^[-: ]+$/.test(c))) continue;

      let idIdx = headers.findIndex(h => h.includes('id') || h.includes('ma'));
      let scnIdx = headers.findIndex(h => h.includes('scenario') || h.includes('kich ban') || h.includes('ten') || h.includes('mo ta') || h.includes('yeu cau'));
      let preIdx = headers.findIndex(h => h.includes('pre') || h.includes('given') || h.includes('dieu kien') || h.includes('tien quyet'));
      let stepsIdx = headers.findIndex(h => h.includes('step') || h.includes('procedure') || h.includes('when') || h.includes('thao tac') || h.includes('cac buoc') || h.includes('buoc'));
      let expIdx = headers.findIndex(h => h.includes('expect') || h.includes('then') || h.includes('mong doi') || h.includes('ket qua mong'));
      let roleIdx = headers.findIndex(h => h.includes('role') || h.includes('actor') || h.includes('vai tro'));
      let priorityIdx = headers.findIndex(h => h.includes('priority') || h.includes('uu tien') || h.includes('muc do'));
      let typeIdx = headers.findIndex(h => h.includes('report') || h.includes('loai') || h.includes('type'));
      let resIdx = headers.findIndex(h => (h.includes('ket qua') && !h.includes('mong')) || h.includes('result') || h.includes('status') || h.includes('verdict'));
      let notesIdx = headers.findIndex(h => h.includes('note') || h.includes('ghi chu') || h.includes('feedback'));

      if (cells.length >= 10 && (preIdx === -1 || stepsIdx === -1)) {
        if (idIdx === -1) idIdx = 0;
        if (scnIdx === -1) scnIdx = 1;
        if (preIdx === -1) preIdx = 2;
        if (stepsIdx === -1) stepsIdx = 3;
        if (expIdx === -1) expIdx = 4;
        if (roleIdx === -1) roleIdx = 5;
        if (priorityIdx === -1) priorityIdx = 6;
        if (typeIdx === -1) typeIdx = 7;
        if (resIdx === -1) resIdx = 8;
        if (notesIdx === -1) notesIdx = 9;
      } else if (cells.length === 5 && scnIdx === -1) {
        idIdx = 0;
        scnIdx = 1;
        typeIdx = 2;
        resIdx = 3;
        notesIdx = 4;
      }

      const idVal = (idIdx !== -1 ? cells[idIdx] : `TC-${items.length + 1}`).replace(/[`*]/g, '');
      const scnVal = scnIdx !== -1 ? cells[scnIdx] : '';
      const preVal = preIdx !== -1 ? cells[preIdx] : '';
      const stepsVal = stepsIdx !== -1 ? cells[stepsIdx] : '';
      const expVal = expIdx !== -1 ? cells[expIdx] : '';
      const roleVal = roleIdx !== -1 ? cells[roleIdx] : '';
      const priorityVal = priorityIdx !== -1 ? cells[priorityIdx] : '';
      const typeVal = typeIdx !== -1 ? cells[typeIdx] : '5.1';
      const resVal = resIdx !== -1 ? cells[resIdx] : '';
      const notesVal = notesIdx !== -1 ? cells[notesIdx] : '';

      let status = 'Passed';
      const rLower = resVal.toLowerCase();
      if (rLower.includes('fail')) status = 'Failed';
      else if (rLower.includes('pend') || rLower.includes('not')) status = 'Pending';

      const rTypeMatch = typeVal.match(/5\.[1-5]/);
      const cleanReportType = rTypeMatch ? rTypeMatch[0] : (typeVal || '5.1');

      items.push({
        testId: idVal,
        description: scnVal,
        scenario: scnVal,
        preConditions: preVal,
        given: preVal,
        steps: stepsVal,
        procedure: stepsVal,
        when: stepsVal,
        inputParams: stepsVal,
        expectedResults: expVal,
        expected: expVal,
        then: expVal,
        role: roleVal,
        priority: priorityVal,
        status,
        reportType: cleanReportType,
        notes: notesVal,
        feedback: notesVal,
      });
    }
  }

  return items;
}

export interface SpecScenario {
  reqId: string;
  reqTitle: string;
  title: string;
  given: string;
  when: string;
  then: string;
  role: string;
  priority: string;
  type: string;
}

export function parseSpecsScenarios(md: string): SpecScenario[] {
  const scenarios: SpecScenario[] = [];
  const lines = md.split(/\r?\n/);

  let currentReqId = '';
  let currentReqTitle = '';
  let currentScenario: Partial<SpecScenario> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const reqMatch = line.match(/^###\s+Requirement:\s*(REQ-[\w.-]+)?\s*(.*)/i);
    if (reqMatch) {
      if (currentScenario && currentScenario.title) {
        scenarios.push(finalizeScenario(currentScenario, currentReqId, currentReqTitle));
        currentScenario = null;
      }
      currentReqId = reqMatch[1] || '';
      currentReqTitle = reqMatch[2] || '';
      continue;
    }

    const scnMatch = line.match(/^####\s+Scenario:\s*(.*)/i);
    if (scnMatch) {
      if (currentScenario && currentScenario.title) {
        scenarios.push(finalizeScenario(currentScenario, currentReqId, currentReqTitle));
      }
      currentScenario = {
        title: scnMatch[1].trim(),
        reqId: currentReqId,
        reqTitle: currentReqTitle,
        given: '',
        when: '',
        then: '',
      };
      continue;
    }

    if (currentScenario) {
      const givenMatch = line.match(/[-*]\s+\*\*GIVEN\*\*\s*:?\s*(.*)/i);
      if (givenMatch) {
        currentScenario.given = givenMatch[1].trim();
        continue;
      }
      const whenMatch = line.match(/[-*]\s+\*\*WHEN\*\*\s*:?\s*(.*)/i);
      if (whenMatch) {
        currentScenario.when = whenMatch[1].trim();
        continue;
      }
      const thenMatch = line.match(/[-*]\s+\*\*THEN\*\*\s*:?\s*(.*)/i);
      if (thenMatch) {
        currentScenario.then = thenMatch[1].trim();
        continue;
      }
    }
  }

  if (currentScenario && currentScenario.title) {
    scenarios.push(finalizeScenario(currentScenario, currentReqId, currentReqTitle));
  }

  return scenarios;
}

function finalizeScenario(s: Partial<SpecScenario>, reqId: string, reqTitle: string): SpecScenario {
  const text = `${s.title} ${s.given} ${s.when} ${s.then}`.toLowerCase();

  let role = 'User';
  if (text.includes('storeowner') || text.includes('chủ cửa hàng') || text.includes('owner')) role = 'StoreOwner';
  else if (text.includes('manager') || text.includes('quản lý')) role = 'StoreManager';
  else if (text.includes('cashier') || text.includes('thu ngân')) role = 'Cashier';
  else if (text.includes('customer') || text.includes('khách hàng')) role = 'Customer';
  else if (text.includes('admin') || text.includes('quản trị')) role = 'Admin';

  let priority = 'Medium';
  if (text.includes('thanh toán') || text.includes('thu nợ') || text.includes('vietqr') || text.includes('bảo mật') || text.includes('rbac') || text.includes('tiền')) {
    priority = 'Critical';
  } else if (text.includes('vượt hạn mức') || text.includes('chặn') || text.includes('lỗi') || text.includes('xóa')) {
    priority = 'High';
  }

  let type = 'Normal';
  if (text.includes('quá') || text.includes('vượt') || text.includes('chặn') || text.includes('sai') || text.includes('không hợp lệ') || text.includes('âm') || text.includes('boundary')) {
    type = text.includes('quá') || text.includes('vượt') || text.includes('boundary') ? 'Boundary' : 'Abnormal';
  }

  return {
    reqId: s.reqId || reqId,
    reqTitle: s.reqTitle || reqTitle,
    title: s.title || '',
    given: s.given || 'Môi trường và dữ liệu khởi tạo sẵn sàng',
    when: s.when || 'Thực hiện thao tác trên giao diện',
    then: s.then || 'Hệ thống phản hồi đúng quy tắc nghiệp vụ',
    role,
    priority,
    type,
  };
}

export function findBestMatchingScenario(item: Record<string, any>, scenarios: SpecScenario[]): SpecScenario | null {
  if (scenarios.length === 0) return null;

  const desc = String(item.description || item.scenario || item.testId || '').toLowerCase();

  // 1. Khớp chính xác theo REQ ID (ví dụ REQ-08.1 hoặc REQ-01)
  const reqMatch = desc.match(/req-[\w.-]+/i);
  const targetReq = reqMatch ? reqMatch[0].toUpperCase() : '';
  if (targetReq) {
    const byReq = scenarios.filter(s => s.reqId.toUpperCase() === targetReq);
    if (byReq.length > 0) return byReq[0];
  }

  // 2. Khớp theo số thứ tự (ví dụ TC-FE08-01 -> kịch bản 1)
  const numMatch = desc.match(/-(\d{1,2})$/) || String(item.testId || '').match(/-(\d{1,2})$/);
  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1;
    if (idx >= 0 && idx < scenarios.length) {
      return scenarios[idx];
    }
  }

  // 3. Khớp theo từ khóa trùng lặp
  const words = desc.replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter(w => w.length > 2);
  let bestScore = -1;
  let bestScenario: SpecScenario | null = null;

  for (const scn of scenarios) {
    const scnText = `${scn.reqId} ${scn.title} ${scn.given} ${scn.when}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (scnText.includes(w)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestScenario = scn;
    }
  }

  return bestScenario || scenarios[0] || null;
}

export type SepWorkflow = ReturnType<typeof createSepWorkflow>;

const TEN_CHANGE = { type: 'string', description: 'Tên change. Bỏ trống = change đang làm (sep_chon_change).' };

export const SEP_TOOL_DEFINITIONS = [
  {
    name: 'sep_tao_change',
    description:
      'SEP bước 1 (/sep-spec): Tạo OpenSpec change mới cho một chức năng (openspec/changes/<ten>/ với .session.md + .status=spec) ' +
      'và chọn nó làm change đang làm. Sau đó lưu proposal.md bằng sep_luu_artifact.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        moTa: { type: 'string', description: 'Mô tả chức năng user muốn làm (nguyên văn yêu cầu, có thể bổ sung ngữ cảnh đã làm rõ)' },
        tenChange: { type: 'string', description: 'Tên change dạng kebab-case tiếng Anh, ngắn gọn (VD: supplier-management). Nếu bỏ trống sẽ sinh từ moTa.' },
        schema: {
          type: 'string',
          enum: SCHEMA_KEYS,
          description: 'feature (chức năng mới, mặc định) | bug-fix (sửa lỗi, không cần design-brief) | refactor (không đổi hành vi, không cần design-brief)',
        },
        capability: {
          type: 'string',
          description: 'Capability (kebab-case) mà change thuộc về, dùng cho spec gốc openspec/specs/<capability>/spec.md. Bỏ trống = tên change.',
        },
        assignee: { type: 'string', description: 'GitHub username người phụ trách. Bỏ trống để dùng SEP_ASSIGNEE của máy.' },
        mode: { type: 'string', enum: ['full', 'fast', 'minimal'], description: 'full (mặc định) | fast | minimal' },
        project: { type: 'string', description: 'Tên dự án (mặc định MT-GRMS)' },
      },
      required: ['moTa'],
    },
  },
  {
    name: 'sep_luu_artifact',
    description:
      'SEP: Lưu (tạo/cập nhật) artifact của change. spec: proposal.md · brainstorm: exploration.md, design-brief.md (schema feature), specs.md, research.md (tuỳ chọn) · ' +
      'verify-spec: review/skeptic.md, tasks.md (cũng dùng để tick task khi apply), review/guardian.md|advocate.md|codebase.md (tuỳ chọn) · ' +
      'test: test-report.md (frontmatter verdict: PASS|FAIL). Từ chối nếu bước trước chưa xong hoặc chưa được duyệt. Tự cập nhật .status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tenChange: TEN_CHANGE,
        file: { type: 'string', enum: SEP_ARTIFACTS, description: 'Artifact cần lưu' },
        noiDung: { type: 'string', description: 'Toàn bộ nội dung markdown của file' },
      },
      required: ['file', 'noiDung'],
    },
  },
  {
    name: 'sep_xem_change',
    description: 'SEP: Xem trạng thái 6 bước của một change (bước nào xong/thiếu gì/chờ duyệt, compliance) và hướng dẫn chi tiết cho việc tiếp theo.',
    inputSchema: {
      type: 'object' as const,
      properties: { tenChange: TEN_CHANGE },
    },
  },
  {
    name: 'sep_chon_change',
    description: 'SEP: Chọn change đang làm (lưu trên máy). Sau đó các tool sep_* có thể bỏ trống tenChange.',
    inputSchema: {
      type: 'object' as const,
      properties: { tenChange: { type: 'string', description: 'Tên change' } },
      required: ['tenChange'],
    },
  },
  {
    name: 'sep_danh_sach_change',
    description: 'SEP: Liệt kê các change kèm schema, bước hiện tại, compliance và việc tiếp theo (lệnh /sep-* hoặc chờ duyệt). 📌 = change đang làm.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        assignee: {
          type: 'string',
          description: 'GitHub username để lọc. Bỏ trống = người dùng của máy (SEP_ASSIGNEE); "*" = tất cả.',
        },
      },
    },
  },
  {
    name: 'sep_duyet_buoc',
    description:
      'SEP gate: Ghi quyết định của USER cho một bước đã đủ artifact. Chỉ gọi sau khi user trả lời rõ Approve hoặc Reject — không tự duyệt. ' +
      'approve → mở khoá bước sau; reject → giữ nguyên bước, ghi lý do. Tóm tắt lưu vào summary.md, đề xuất cải tiến vào improvements.md.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tenChange: TEN_CHANGE,
        buoc: { type: 'string', enum: APPROVABLE, description: 'Bước cần duyệt. Bỏ trống = bước đầu tiên đang chờ duyệt.' },
        quyetDinh: { type: 'string', enum: ['approve', 'reject'], description: 'Quyết định của user' },
        tomTat: { type: 'string', description: 'Tóm tắt kết quả bước (đã làm gì, quyết định chính) hoặc lý do reject' },
        caiTien: { type: 'string', description: 'Đề xuất cải tiến quy trình / bài học rút ra (tuỳ chọn)' },
        nguoiDuyet: { type: 'string', description: 'GitHub username người duyệt. Bỏ trống = SEP_ASSIGNEE.' },
      },
      required: ['quyetDinh', 'tomTat'],
    },
  },
  {
    name: 'sep_chuyen_trang_thai',
    description:
      'SEP: Chuyển bước. "apply" (/sep-apply, cần xong + duyệt spec, brainstorm, verify-spec) hoặc ' +
      '"archived" (/sep-archive, cần mọi task đã tick, test-report.md verdict PASS và đã duyệt; tự merge specs.md vào openspec/specs/<capability>/spec.md).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tenChange: TEN_CHANGE,
        trangThai: { type: 'string', enum: [...LIFECYCLE_STATUSES], description: 'apply | archived' },
      },
      required: ['trangThai'],
    },
  },
  {
    name: 'sep_xem_persona',
    description:
      'SEP: Lấy prompt của persona review (skeptic, guardian, advocate, codebase) dùng cho /sep-verify-spec. ' +
      'Giao prompt cho sub-agent (Cursor Task / Claude agent) hoặc tự đóng vai lần lượt nếu IDE không có sub-agent. Bỏ trống ten = liệt kê.',
    inputSchema: {
      type: 'object' as const,
      properties: { ten: { type: 'string', description: 'Tên persona' } },
    },
  },
  {
    name: 'sep_lui_buoc',
    description:
      'SEP: Quay lại bước trước (Rollback) trong quy trình SEP khi cần sửa lại spec, brainstorm hoặc task. ' +
      'Giữ nguyên toàn bộ artifact cũ để tiếp tục chỉnh sửa, reset cổng duyệt của bước được lùi về để duyệt lại sau đó.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tenChange: TEN_CHANGE,
        buocMoi: {
          type: 'string',
          enum: ['spec', 'brainstorm', 'verify-spec', 'apply', 'test'],
          description: 'Bước muốn lùi về (mặc định: lùi 1 bước liền trước)',
        },
        lyDo: { type: 'string', description: 'Lý do lùi bước (lưu vào nhật ký)' },
      },
    },
  },
  {
    name: 'sep_dong_bo_test_sheet',
    description:
      'SEP kiểm thử: Đồng bộ kết quả test lên 5 file Google Sheets kiểm thử (Report 5.1 -> 5.5) qua Google Apps Script Web App. ' +
      'Tự động đọc test-report.md của change hiện tại (hoặc nhận items truyền vào), phân loại theo Report Type (5.1-5.5), ' +
      'tự động clone Tab Feature mới nếu chưa có, và upsert theo Test Case ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tenChange: TEN_CHANGE,
        reportTypes: {
          type: 'array',
          items: { type: 'string', enum: ['5.1', '5.2', '5.3', '5.4', '5.5'] },
          description: 'Danh sách các report cần đồng bộ (VD: ["5.1", "5.3"]). Nếu bỏ trống sẽ đồng bộ mọi report tìm thấy.',
        },
        featureCode: { type: 'string', description: 'Mã feature (VD: FE-01, FE-02). Bỏ trống = tự suy ra từ tên change.' },
        featureName: { type: 'string', description: 'Tên đầy đủ của tính năng để ghi vào ô B2 trên Sheet.' },
        tabName: { type: 'string', description: 'Tên tab trên Google Sheet (mặc định lấy theo featureCode).' },
        tester: { type: 'string', description: 'Tên người kiểm thử. Mặc định lấy từ cấu hình hoặc SEP_ASSIGNEE.' },
      },
    },
  },
];


