/**
 * End-to-end test of the SEP workflow on a throw-away KB copy (needs `npm run build` in mcp-server).
 *   node mcp-server/test-sep.js
 */

import assert from 'assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSepWorkflow, parseSpecsScenarios } from './dist/tools/sepWorkflow.js';
import { mergeDeltaSpec, parseDelta } from './dist/tools/specMerge.js';
import { LocalProvider } from './dist/providers/localProvider.js';

const KB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sep-test-'));
for (const dir of ['openspec/schemas', 'sep-kit/agents', '.opsx/instructions']) {
  fs.cpSync(path.join(KB, dir), path.join(tmp, dir), { recursive: true });
}
fs.copyFileSync(path.join(KB, 'openspec/config.yaml'), path.join(tmp, 'openspec/config.yaml'));

let active = null;
const commits = [];
const provider = new LocalProvider(tmp);
const sep = createSepWorkflow(provider, {
  defaultAssignee: 'tester',
  activeStore: { get: async () => active, set: async n => { active = n; } },
  afterWrite: async (files, msg) => { commits.push({ files, msg }); return 'ok'; },
});

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    console.log(`  ❌ ${name}\n     ${err.message}`);
    process.exitCode = 1;
  }
}
const rejects = (p, re) => assert.rejects(p, err => re.test(err.message));
const save = (file, noiDung, tenChange) => sep.handleLuuArtifact({ file, noiDung, tenChange });
const approve = buoc => sep.handleDuyetBuoc({ buoc, quyetDinh: 'approve', tomTat: `ok ${buoc}`, caiTien: `bài học ${buoc}` });
const read = rel => fs.readFileSync(path.join(tmp, rel), 'utf8');
const C = 'openspec/changes/supplier-crud';

const SPECS = `# Specs
## ADDED Requirements
### Requirement: REQ-01 Tạo nhà cung cấp
Hệ thống MUST tạo nhà cung cấp.
#### Scenario: ok
- GIVEN a
- WHEN b
- THEN c

### Requirement: REQ-02 Xoá nhà cung cấp
Hệ thống MUST xoá mềm.
`;

console.log(`\n🧪 SEP workflow (KB tạm: ${tmp})\n`);

await test('tạo change feature → gate bật, chọn làm change đang làm', async () => {
  const out = await sep.handleTaoChange({
    moTa: 'Quản lý nhà cung cấp',
    tenChange: 'supplier-crud',
    capability: 'supplier',
    taoCapabilityMoi: true,
  });
  assert.match(out, /Đã tạo change/);
  assert.equal(active, 'supplier-crud');
  assert.match(read(`${C}/.session.md`), /gate: true/);
  assert.match(read(`${C}/.session.md`), /schema: feature/);
});

await test('lưu proposal (bỏ trống tenChange = change đang làm)', async () => {
  await save('proposal.md', '# Proposal');
  assert.ok(fs.existsSync(path.join(tmp, C, 'proposal.md')));
});

await test('chưa duyệt spec → chặn brainstorm', () => rejects(save('exploration.md', '# E'), /chưa được duyệt/));

await test('reject spec → ghi summary, vẫn chặn', async () => {
  const out = await sep.handleDuyetBuoc({ quyetDinh: 'reject', tomTat: 'thiếu tiêu chí' });
  assert.match(out, /từ chối/);
  assert.match(read(`${C}/summary.md`), /Reject/);
  await rejects(save('exploration.md', '# E'), /chưa được duyệt/);
});

await test('approve spec → mở khoá brainstorm, ghi improvements, chưa nhảy .status sớm khi thiếu file', async () => {
  await approve('spec');
  assert.match(read(`${C}/improvements.md`), /bài học spec/);
  await save('exploration.md', '# E');
  // Chưa đủ design-brief.md + specs.md nên .status vẫn ở spec
  assert.equal(read(`${C}/.status`).trim(), 'spec');
});

await test('duyệt bước chưa xong bị từ chối', () => rejects(approve('brainstorm'), /chưa xong/));

await test('hướng dẫn bước có bối cảnh config.yaml + schema.yaml', async () => {
  const out = await sep.handleXemChange({});
  assert.match(out, /Bối cảnh dự án/);
  assert.match(out, /openspec\/schemas\/feature/);
});

await test('brainstorm đủ file + research tuỳ chọn → nâng .status = brainstorm & duyệt', async () => {
  await save('research.md', '# R');
  await save('design-brief.md', '# D');
  await save('specs.md', SPECS);
  assert.equal(read(`${C}/.status`).trim(), 'brainstorm');
  await approve('brainstorm');
});

await test('persona: liệt kê + đọc skeptic', async () => {
  assert.match(await sep.handleXemPersona({}), /skeptic/);
  assert.match(await sep.handleXemPersona({ ten: 'skeptic' }), /D1 Completeness/);
});

await test('verify-spec: review đa persona + tasks không checkbox bị chặn', async () => {
  await save('review/skeptic.md', '# S');
  await save('review/guardian.md', '# G');
  await rejects(save('tasks.md', '# no tasks'), /checklist/);
  await save('tasks.md', '- [ ] T1\n- [ ] T2');
});

await test('apply bị chặn khi verify-spec chưa duyệt', () =>
  rejects(sep.handleChuyenTrangThai({ trangThai: 'apply' }), /chưa được duyệt/));

await test('apply → tick task → duyệt apply', async () => {
  await approve('verify-spec');
  await sep.handleChuyenTrangThai({ trangThai: 'apply' });
  await rejects(approve('apply'), /chưa xong/);
  await save('tasks.md', '- [x] T1\n- [x] T2');
  await approve('apply');
});

await test('test-report thiếu verdict bị chặn; FAIL chưa cho archive', async () => {
  await rejects(save('test-report.md', '# R'), /verdict/);
  await save('test-report.md', '---\nverdict: FAIL\n---\n# R');
  await rejects(sep.handleChuyenTrangThai({ trangThai: 'archived' }), /Test chưa xong|verdict/);
});

await test('PASS + duyệt test → archive merge vào openspec/specs/ & chuyển sang openspec/archive/', async () => {
  await save('test-report.md', '---\nverdict: PASS\n---\n# R');
  await rejects(sep.handleChuyenTrangThai({ trangThai: 'archived' }), /chưa được duyệt/);
  await approve('test');
  const out = await sep.handleChuyenTrangThai({ trangThai: 'archived' });
  assert.match(out, /openspec\/archive\/supplier-crud-archived-/);
  assert.match(out, /Đã merge Delta vào Spec gốc/);
  assert.match(read('openspec/specs/supplier/spec.md'), /REQ-01 Tạo nhà cung cấp/);
  assert.match(read('openspec/specs/supplier/spec.md'), /REQ-02 Xoá nhà cung cấp/);
  // Thư mục cũ trong openspec/changes/ được dọn sạch hoàn toàn (kể cả folder rỗng)
  assert.equal(fs.existsSync(path.join(tmp, 'openspec/changes/supplier-crud')), false);
  const archivedDirs = fs.readdirSync(path.join(tmp, 'openspec/archive')).filter((d) => d.startsWith('supplier-crud-archived-'));
  assert.equal(archivedDirs.length, 1);
  assert.equal(fs.readFileSync(path.join(tmp, 'openspec/archive', archivedDirs[0], '.status'), 'utf8').trim(), 'archived');
});

await test('mergeDeltaSpec: MODIFIED + REMOVED trên base có sẵn', async () => {
  const base = `# Spec: supplier

## Requirements

### Requirement: REQ-01 Tạo nhà cung cấp
Hệ thống MUST tạo nhà cung cấp.

### Requirement: REQ-02 Xoá nhà cung cấp
Hệ thống MUST xoá mềm.

## Lịch sử
- 2026-09-01 · \`supplier-crud\` · +2 ~0 -0
`;
  const delta = `## MODIFIED Requirements
### Requirement: REQ-01 Tạo nhà cung cấp
Hệ thống MUST tạo nhà cung cấp và kiểm tra trùng mã số thuế.
## REMOVED Requirements
### Requirement: REQ-02 Xoá nhà cung cấp
`;
  const r = mergeDeltaSpec(base, delta, { capability: 'supplier', change: 'supplier-tax', date: '2026-10-01' });
  assert.deepEqual([r.added.length, r.modified.length, r.removed.length], [0, 1, 1]);
  assert.match(r.content, /mã số thuế/);
  assert.doesNotMatch(r.content, /REQ-02/);
  assert.match(r.content, /supplier-crud/);
  assert.match(r.content, /supplier-tax/);
  assert.equal(r.warnings.length, 0);
});

await test('archived → không sửa artifact', async () => {
  const archivedDirs = fs.readdirSync(path.join(tmp, 'openspec/archive')).filter((d) => d.startsWith('supplier-crud-archived-'));
  assert.equal(archivedDirs.length, 1);
  await rejects(save('specs.md', '# x', archivedDirs[0]), /đã archive/);
});

await test('schema bug-fix: không cần + không nhận design-brief', async () => {
  await sep.handleTaoChange({
    moTa: 'Lỗi tính thuế',
    tenChange: 'tax-bug',
    schema: 'bug-fix',
    capability: 'supplier',
  });
  await save('proposal.md', '# P');
  await approve('spec');
  await rejects(save('design-brief.md', '# D'), /không dùng design-brief/);
  await save('exploration.md', '# root cause');
  await save('specs.md', '## MODIFIED Requirements\n### Requirement: Thuế\nMUST đúng.');
  const info = await sep.inspectChange('tax-bug');
  assert.equal(info.steps[1].gap, null);
  assert.equal(info.next.kind, 'approve');
});

await test('change cũ (không gate) không cần duyệt', async () => {
  const dir = path.join(tmp, 'openspec/changes/legacy');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.session.md'), '---\nassignee: old\n---\n# legacy\n');
  fs.writeFileSync(path.join(dir, '.status'), 'spec\n');
  await save('proposal.md', '# P', 'legacy');
  await save('exploration.md', '# E', 'legacy');
});

await test('danh sách: 📌 change vừa thao tác + việc tiếp theo', async () => {
  const out = await sep.handleDanhSachChange({ assignee: '*' });
  assert.match(out, /📌 legacy/);
  assert.match(out, /tax-bug .* duyệt bước Brainstorm/);
});

await test('sep_chon_change đổi change đang làm', async () => {
  await sep.handleChonChange({ tenChange: 'tax-bug' });
  assert.equal(active, 'tax-bug');
  await rejects(sep.handleChonChange({ tenChange: 'khong-ton-tai' }), /Không tìm thấy/);
});

await test('Triage Gate: chặn tạo change trùng capability đang mở trừ khi taoChangeMoiKhiTrung=true', async () => {
  await rejects(
    sep.handleTaoChange({
      moTa: 'Thêm bộ lọc nhà cung cấp',
      tenChange: 'supplier-filter-dup',
      capability: 'supplier',
    }),
    /đang có change mở chưa hoàn tất.*`tax-bug`/s,
  );
});

await test('sep_lui_buoc lùi về đúng bước trước (giữ đúng .status = targetKey) và reset cổng duyệt', async () => {
  // Tạo change thử nghiệm rollback (xác nhận tách riêng bằng taoChangeMoiKhiTrung: true)
  await sep.handleTaoChange({
    moTa: 'Test rollback feature',
    tenChange: 'rollback-demo',
    capability: 'supplier',
    taoChangeMoiKhiTrung: true,
  });
  await save('proposal.md', '# Proposal', 'rollback-demo');
  await sep.handleDuyetBuoc({ tenChange: 'rollback-demo', buoc: 'spec', quyetDinh: 'approve', tomTat: 'Duyệt spec' });
  await save('exploration.md', '# Exp', 'rollback-demo');
  await save('design-brief.md', '# DB', 'rollback-demo');
  await save('specs.md', SPECS, 'rollback-demo');
  await sep.handleDuyetBuoc({ tenChange: 'rollback-demo', buoc: 'brainstorm', quyetDinh: 'approve', tomTat: 'Duyệt brainstorm' });
  await save('review/skeptic.md', '# Skep', 'rollback-demo');
  await save('tasks.md', '- [ ] T1', 'rollback-demo');
  await sep.handleDuyetBuoc({ tenChange: 'rollback-demo', buoc: 'verify-spec', quyetDinh: 'approve', tomTat: 'Duyệt verify' });
  await sep.handleChuyenTrangThai({ tenChange: 'rollback-demo', trangThai: 'apply' });

  // Lùi từ apply về verify-spec → .status phải là 'verify-spec' (không bị tụt về 'spec')
  const outBack = await sep.handleLuiBuoc({ tenChange: 'rollback-demo', buocMoi: 'verify-spec', lyDo: 'Tách lại tasks' });
  assert.match(outBack, /về \*\*Verify Spec\*\* \(`verify-spec`\)/);
  assert.equal(read('openspec/changes/rollback-demo/.status').trim(), 'verify-spec');

  // Lùi tiếp về spec
  const out = await sep.handleLuiBuoc({ tenChange: 'rollback-demo', buocMoi: 'spec', lyDo: 'Sửa lại proposal' });
  assert.match(out, /về \*\*Spec\*\* \(`spec`\)/);
  assert.equal(read('openspec/changes/rollback-demo/.status').trim(), 'spec');

  const info = await sep.inspectChange('rollback-demo');
  assert.equal(info.next.step.key, 'spec');
  // Cổng duyệt spec đã được reset
  assert.equal(Boolean(info.state.approvals['spec']), false);

  // Thử lùi khi đang ở spec -> chặn
  await rejects(
    sep.handleLuiBuoc({ tenChange: 'rollback-demo' }),
    /đang ở bước đầu tiên/
  );

  // Thử lùi về bước không nằm trước -> chặn
  await rejects(
    sep.handleLuiBuoc({ tenChange: 'rollback-demo', buocMoi: 'brainstorm' }),
    /không nằm trước bước hiện tại/
  );
});

await test('sep_tao_change thiếu capability bị chặn', () =>
  rejects(sep.handleTaoChange({ moTa: 'không có cap', tenChange: 'no-cap' }), /Thiếu `capability`/));

await test('sep_tim_capability tìm change theo query', async () => {
  const out = await sep.handleTimCapability({ query: 'tax-bug thue' });
  assert.match(out, /`tax-bug`/);
  assert.match(out, /openspec\/changes\/tax-bug\/specs\.md/);
});

await test('sep_tim_capability 0 match', async () => {
  const out = await sep.handleTimCapability({ query: 'xyzzy-khong-co-change-nao' });
  assert.match(out, /Không tìm thấy/);
});

await test('sep_cap_nhat_capability bảo toàn chuẩn Delta + API/Checklist và nối tasksBoSung', async () => {
  await save(
    'specs.md',
    `# Specs: tax-bug\n\n## API / Contract\n| GET | /api/tax |\n\n## MODIFIED Requirements\n### Requirement: Thuế\nMUST đúng.\n\n## Acceptance checklist\n- [ ] Kiểm tra thuế\n`,
    'tax-bug',
  );
  const beforeSpec = read('openspec/specs/supplier/spec.md');
  const out = await sep.handleCapNhatCapability({
    tenChange: 'tax-bug',
    tomTat: 'sua REQ thue va them REQ-03',
    reqsDaChot: ['Thuế'],
    tasksBoSung: ['T3 — Cập nhật công thức thuế mới (REQ-03)'],
    delta: `## MODIFIED Requirements
### Requirement: Thuế
MUST đúng (đã refactor).

## ADDED Requirements
### Requirement: REQ-03 Làm tròn thuế
Hệ thống MUST làm tròn VND.
`,
  });
  assert.match(out, /Đã cập nhật Delta specs của change/);
  const updatedSpecs = read('openspec/changes/tax-bug/specs.md');
  assert.equal(parseDelta(updatedSpecs).isDelta, true);
  assert.match(updatedSpecs, /## API \/ Contract/);
  assert.match(updatedSpecs, /## Acceptance checklist/);
  assert.match(updatedSpecs, /đã refactor/);
  assert.match(updatedSpecs, /REQ-03 Làm tròn thuế/);
  assert.match(read('openspec/changes/tax-bug/tasks.md'), /- \[ \] T3 — Cập nhật công thức thuế mới/);
  assert.equal(read('openspec/specs/supplier/spec.md'), beforeSpec);
});

await test('mode=fast trên bug-fix chỉ dừng ở 2 cổng duyệt chính (verify-spec & test)', async () => {
  await sep.handleTaoChange({
    moTa: 'Hotfix hiển thị tồn kho',
    tenChange: 'inv-hotfix',
    schema: 'bug-fix',
    mode: 'fast',
    capability: 'inventory',
    taoCapabilityMoi: true,
  });
  await save('proposal.md', '# P', 'inv-hotfix');
  // Không cần approve spec hay brainstorm, đi thẳng được tới verify-spec
  await save('exploration.md', '# Root cause', 'inv-hotfix');
  await save('specs.md', '## MODIFIED Requirements\n### Requirement: REQ-INV-01 Tồn kho\nMUST hiển thị đúng.\n#### Scenario: S1\n- GIVEN có 5 sp\n- WHEN mở trang\n- THEN hiện 5', 'inv-hotfix');
  await save('review/skeptic.md', '# OK', 'inv-hotfix');
  await save('tasks.md', '- [ ] T1 — Fix UI', 'inv-hotfix');
  // Cổng 1 (verify-spec) bắt buộc phải duyệt trước khi sang apply
  await rejects(sep.handleChuyenTrangThai({ tenChange: 'inv-hotfix', trangThai: 'apply' }), /chưa được duyệt/);
  await sep.handleDuyetBuoc({ tenChange: 'inv-hotfix', buoc: 'verify-spec', quyetDinh: 'approve', tomTat: 'Chốt spec' });
  await sep.handleChuyenTrangThai({ tenChange: 'inv-hotfix', trangThai: 'apply' });
  await save('tasks.md', '- [x] T1 — Fix UI', 'inv-hotfix');
  // Không cần approve apply, lưu thẳng test-report.md được nhưng phải duyệt Cổng 2 (test) trước khi archive
  await save('test-report.md', '---\nverdict: PASS\n---\n# Pass', 'inv-hotfix');
  await rejects(sep.handleChuyenTrangThai({ tenChange: 'inv-hotfix', trangThai: 'archived' }), /chưa được duyệt/);
  await sep.handleDuyetBuoc({ tenChange: 'inv-hotfix', buoc: 'test', quyetDinh: 'approve', tomTat: 'Pass test' });
  await sep.handleChuyenTrangThai({ tenChange: 'inv-hotfix', trangThai: 'archived' });
});

await test('parseSpecsScenarios đọc được cả GIVEN thường lẫn **GIVEN** in đậm', () => {
  const scns = parseSpecsScenarios(`### Requirement: REQ-01 Test
#### Scenario: Thường
- GIVEN có đơn hàng
- WHEN bấm lưu
- THEN trả 200
#### Scenario: Đậm
- **GIVEN**: có giỏ hàng
- **WHEN**: bấm thanh toán
- **THEN**: trừ tồn FEFO`);
  assert.equal(scns.length, 2);
  assert.equal(scns[0].given, 'có đơn hàng');
  assert.equal(scns[0].then, 'trả 200');
  assert.equal(scns[1].given, 'có giỏ hàng');
  assert.equal(scns[1].then, 'trừ tồn FEFO');
});

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${process.exitCode ? '❌' : '✅'} ${passed} test pass · ${commits.length} commit giả lập\n`);
